(function () {
  function defaultEscapeHtml(value) {
    var div = document.createElement("div");
    div.textContent = String(value == null ? "" : value);
    return div.innerHTML;
  }

  function defaultEscapeAttr(value) {
    return defaultEscapeHtml(value).replace(/"/g, "&quot;");
  }

  function createSearchTools(options) {
    options = options || {};

    var searchAssistEl = options.searchAssistEl || null;
    var escapeHtml = options.escapeHtml || defaultEscapeHtml;
    var escapeAttr = options.escapeAttr || defaultEscapeAttr;

    function normalizeSearchToken(value) {
      return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ß/g, "ss")
        .trim();
    }

    var getVerseSearchBooks =
      options.getVerseSearchBooks ||
      function () {
        return {
          matthew: { label: "Matthäus", refKey: "ref_matthew", maxChapter: 28, aliases: ["matthäus", "matthaus", "mt"] },
          mark: { label: "Markus", refKey: "ref_mark", maxChapter: 16, aliases: ["markus", "mk"] },
          luke: { label: "Lukas", refKey: "ref_luke", maxChapter: 24, aliases: ["lukas", "lk"] },
          john: { label: "Johannes", refKey: "ref_john", maxChapter: 21, aliases: ["johannes", "jn", "john"] },
        };
      };
    var SEARCH_BOOK_NUMBERS = {
      matthew: 40,
      mark: 41,
      luke: 42,
      john: 43,
    };

    function getSearchBookDefs() {
      return Object.entries(getVerseSearchBooks()).map(function (entry) {
        var id = entry[0];
        var book = entry[1];
        return {
          id: id,
          label: book.label,
          maxChapter: book.maxChapter,
          aliases: (book.aliases || []).map(function (alias) {
            return normalizeSearchToken(alias);
          }),
        };
      });
    }

    function parseReferenceQuery(rest, book) {
      var raw = String(rest || "").trim();
      var chapterOnlyMatch;
      var verseMatch;
      var chapter;
      var verse;
      if (!raw || !book) return null;

      chapterOnlyMatch = raw.match(/^(\d+)$/);
      if (chapterOnlyMatch) {
        chapter = parseInt(chapterOnlyMatch[1], 10);
        if (chapter >= 1 && chapter <= book.maxChapter) {
          return { chapter: chapter, verse: null };
        }
        return null;
      }

      verseMatch = raw.match(/^(\d+)(?:\s*[:.,]\s*|\s+)(\d+)$/);
      if (!verseMatch) return null;

      chapter = parseInt(verseMatch[1], 10);
      verse = parseInt(verseMatch[2], 10);
      if (chapter < 1 || chapter > book.maxChapter || verse < 1) return null;

      return { chapter: chapter, verse: verse };
    }

    function getSearchAssistState(rawValue) {
      var raw = String(rawValue || "");
      var trimmed = raw.trim();
      if (!trimmed) return null;

      var normalized = normalizeSearchToken(trimmed);
      var parts = normalized.split(/\s+/);
      var first = parts[0] || "";
      var rest = parts.slice(1).join(" ").trim();

      var searchBookDefs = getSearchBookDefs();
      var exactBook = searchBookDefs.find(function (book) {
        return book.aliases.includes(first);
      });
      if (exactBook) {
        var parsedQuery = parseReferenceQuery(rest, exactBook);
        var chapters = Array.from({ length: exactBook.maxChapter }, function (_, index) {
          return index + 1;
        });
        var selectedChapter = parsedQuery ? parsedQuery.chapter : !rest ? 1 : 0;
        return {
          mode: "chapters",
          book: exactBook,
          chapters: chapters,
          selectedChapter: selectedChapter,
          selectedVerse: parsedQuery && parsedQuery.verse ? parsedQuery.verse : 0,
        };
      }

      if (parts.length > 1) return null;

      var matches = searchBookDefs.filter(function (book) {
        return book.aliases.some(function (alias) {
          return alias.startsWith(first);
        });
      });
      if (!matches.length) return null;

      return {
        mode: "books",
        matches: matches,
      };
    }

    function renderSearchAssist(state) {
      if (!searchAssistEl) return;
      if (!state) {
        searchAssistEl.hidden = true;
        searchAssistEl.innerHTML = "";
        return;
      }

      if (state.mode === "books") {
        searchAssistEl.hidden = false;
        searchAssistEl.innerHTML =
          '<div class="search-assist__list">' +
          state.matches
            .map(function (book) {
              return (
                '<button type="button" class="search-assist__book" data-search-assist-book="' +
                escapeAttr(book.id) +
                '">' +
                escapeHtml(book.label) +
                "</button>"
              );
            })
            .join("") +
          "</div>";
        return;
      }

      searchAssistEl.hidden = false;
      searchAssistEl.innerHTML =
        '<div class="search-assist__heading">' +
        escapeHtml(state.book.label) +
        "</div>" +
        '<div class="search-assist__chapters">' +
        state.chapters
          .map(function (chapter) {
            var active = state.selectedChapter === chapter;
            return (
              '<button type="button" class="search-assist__chapter' +
              (active ? " is-active" : "") +
              '" data-search-assist-book="' +
              escapeAttr(state.book.id) +
              '" data-search-assist-chapter="' +
              chapter +
              '" aria-pressed="' +
              (active ? "true" : "false") +
              '">' +
              chapter +
              "</button>"
            );
          })
          .join("") +
        "</div>";
    }

    function formatVerseQueryLabel(query) {
      if (!query) return "";
      var book = getVerseSearchBooks()[query.book];
      if (!book) return "";
      return book.label + " " + query.chapter + (query.verse ? "," + query.verse : "");
    }

    function getVersePairsForReference(ref, bookId) {
      var compareApi = window.SYNOPTIC_COMPARE;
      var bookNumber = SEARCH_BOOK_NUMBERS[bookId];
      var expanded;
      if (!ref || !compareApi || typeof compareApi.expandRefToVerses !== "function" || !bookNumber) {
        return null;
      }
      expanded = compareApi.expandRefToVerses(String(ref || ""), bookNumber, Object.create(null));
      if (!expanded || !expanded.ok || !Array.isArray(expanded.verses)) return null;
      return expanded.verses;
    }

    function refContainsChapter(ref, chapter, bookId) {
      if (!ref || !chapter) return false;
      var versePairs = getVersePairsForReference(ref, bookId);
      if (versePairs && versePairs.length) {
        return versePairs.some(function (pair) {
          return pair[0] === chapter;
        });
      }
      var tokens = String(ref)
        .replace(/;/g, " ")
        .split(/\s+/)
        .map(function (part) {
          return part.trim();
        })
        .filter(Boolean);
      var currentChapter = 0;
      for (var i = 0; i < tokens.length; i += 1) {
        var token = tokens[i].replace(/[\[\]()]/g, "");
        if (!token) continue;
        var explicit = token.match(/^(\d+)\.(.+)$/);
        if (explicit) {
          currentChapter = parseInt(explicit[1], 10);
          token = explicit[2];
        } else if (!currentChapter) {
          continue;
        }
        var cleaned = token.replace(/[a-z]/gi, "");
        if (!cleaned) continue;
        var rangeMatch = cleaned.match(/^(\d+)-(\d+)$/);
        if (rangeMatch) {
          if (currentChapter === chapter) return true;
          continue;
        }
        var singleMatch = cleaned.match(/^(\d+)$/);
        if (singleMatch && currentChapter === chapter) {
          return true;
        }
      }
      return false;
    }

    function refContainsVerse(ref, bookId, chapter, verse) {
      if (!ref || !chapter || !verse) return false;
      var versePairs = getVersePairsForReference(ref, bookId);
      if (!versePairs || !versePairs.length) return false;
      return versePairs.some(function (pair) {
        return pair[0] === chapter && pair[1] === verse;
      });
    }

    function rowMatchesVerseQuery(row, query) {
      if (!row || !query) return false;
      var book = getVerseSearchBooks()[query.book];
      if (!book) return false;
      if (query.verse) {
        return refContainsVerse(row[book.refKey] || "", query.book, query.chapter, query.verse);
      }
      return refContainsChapter(row[book.refKey] || "", query.chapter, query.book);
    }

    function normalizeReferenceSignaturePart(value) {
      return String(value || "")
        .replace(/\s+/g, " ")
        .trim();
    }

    function getReferenceSignature(row) {
      if (!row) return "";
      return ["ref_matthew", "ref_mark", "ref_luke", "ref_john"]
        .map(function (key) {
          return normalizeReferenceSignaturePart(row[key]);
        })
        .join("||");
    }

    function dedupeSearchRowsByReferences(rows) {
      var seen = new Set();
      return (rows || []).filter(function (row) {
        var signature = getReferenceSignature(row);
        if (!signature) return true;
        if (seen.has(signature)) return false;
        seen.add(signature);
        return true;
      });
    }

    return {
      getVerseSearchBooks: getVerseSearchBooks,
      getSearchBookDefs: getSearchBookDefs,
      normalizeSearchToken: normalizeSearchToken,
      getSearchAssistState: getSearchAssistState,
      renderSearchAssist: renderSearchAssist,
      formatVerseQueryLabel: formatVerseQueryLabel,
      rowMatchesVerseQuery: rowMatchesVerseQuery,
      dedupeSearchRowsByReferences: dedupeSearchRowsByReferences,
    };
  }

  window.SYNOPSE_SEARCH = {
    createSearchTools: createSearchTools,
  };
})();

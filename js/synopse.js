(function () {
  const data = window.PARALLELS_DATA;
  const listEl = document.getElementById("list");
  const isCompareHome = document.body.classList.contains("compare-home");
  const i18n = window.SYNOPSE_I18N || null;
  if (i18n && typeof i18n.initPage === "function") {
    i18n.initPage();
  }
  const t = i18n
    ? i18n.t
    : function (key, vars) {
        const fallback = {
          "js.missingData": "Keine Daten — <code>data/parallels_data.js</code> fehlt oder enthält keine Einträge.",
          "js.eventFallback": "Ereignis",
          "js.shareEvent": "Ereignis teilen",
          "js.bookmark": "Merken",
          "js.bookmarked": "Gemerkt",
          "js.eventsFor": "Ereignisse zu {label}",
          "js.filterModeKicker": "Filtermodus",
          "js.filterModeTitle": "Wähle oben einen Filter",
          "js.filterModeText":
            "Sobald du einen Filter setzt, erscheinen hier die passenden Ereignisse. Du kannst auch direkt nach einem Ereignistitel suchen.",
          "js.starterTitle": "Ereignisse, die dich interessieren könnten",
          "js.starterText":
            "Beim Lesen kannst du Ereignisse für später merken. Bis dahin findest du unten ein paar gute Einstiege, mit denen du die Synopse direkt ausprobieren kannst.",
          "js.loadingGreek": "Lade griechischen Text …",
          "js.loadingTranslation": "Lade Übersetzung …",
          "js.greekLoadFailed": "Der griechische Text konnte nicht geladen werden.",
          "js.translationLoadFailed": "Übersetzung konnte nicht geladen werden.",
          "js.noGreekData": "Keine Textdaten verfügbar.",
          "js.noTranslationData": "Übersetzungsdaten nicht verfügbar.",
          "js.noLinkedGospelText": "In dieser Zeile ist kein Evangelientext verknüpft.",
          "js.openSynopsis": "Zur Synopse",
          "js.compareWithLabel": "Vergleiche mit",
          "js.compareWith": "Vergleiche mit {gospels}",
          "js.goToEvent": "Zum Ereignis",
          "js.goToContext": "Zum Kontext",
          "js.translationPrefix": "Übersetzung: {label}",
          "js.chooseChapterToSeeEvents": "Kapitel wählen, um passende Ereignisse zu sehen.",
          "js.noEventForChapter": "Kein Ereignis gefunden, das dieses Kapitel direkt enthält.",
          "js.noResults": "Keine Treffer — Filter lockern oder Suche ändern.",
          "js.countLines": "{count} von {total} Zeilen",
          "js.chapterActiveSuffix": " (Bibelstelle aktiv)",
          "js.filterActiveSuffix": " (Filter aktiv)",
          "js.yourBookmarks": "Deine Merkliste",
          "js.chooseFilterOrSearch": "Filter oder Suche wählen",
          "js.chooseChapter": "Kapitel wählen",
          "js.books.matthew": "Matthäus",
          "js.books.mark": "Markus",
          "js.books.luke": "Lukas",
          "js.books.john": "Johannes",
          "js.openCompareAria": "Versvergleich in Fenster öffnen",
        };
        let value = fallback[key] || key;
        return String(value).replace(/\{(\w+)\}/g, function (_, name) {
          return vars && Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : "";
        });
      };
  const getRowTitle = i18n
    ? i18n.getRowTitle
    : function (row) {
        return (row && (row.title_de || row.title)) || t("js.eventFallback");
      };
  const getRowSection = i18n
    ? i18n.getRowSection
    : function (row) {
        return (row && (row.section_de || row.section)) || "";
      };
  const getBookLabel = i18n
    ? i18n.getBookLabel
    : function (bookId) {
        return t("js.books." + bookId);
      };
  const getExplorerGroupLabel = i18n
    ? i18n.getExplorerGroupLabel
    : function (_, fallback) {
        return fallback || "";
      };
  const getExplorerTopicLabel = i18n
    ? i18n.getExplorerTopicLabel
    : function (_, fallback) {
        return fallback || "";
      };
  const getPresetGroupLabel = i18n
    ? i18n.getPresetGroupLabel
    : function (_, fallback) {
        return fallback || "";
      };
  const getPresetLabel = i18n
    ? i18n.getPresetLabel
    : function (_, fallback) {
        return fallback || "";
      };
  const getPresetTitle = i18n
    ? i18n.getPresetTitle
    : function (_, fallback) {
        return fallback || "";
      };

  if (!Array.isArray(data) || !data.length) {
    const msg = '<div class="empty">' + t("js.missingData") + "</div>";
    if (listEl) {
      listEl.innerHTML = msg;
    } else {
      const mg = document.getElementById("compare-main-grid");
      if (mg) mg.innerHTML = msg;
    }
    return;
  }

  function tripleSyn(r) {
    return r.in_matthew && r.in_mark && r.in_luke;
  }

  function qStyle(r) {
    return r.in_matthew && r.in_luke && !r.in_mark;
  }

  const n = data.length;
  let overlayLockCount = 0;
  let lockedScrollY = 0;

  function lockPageScroll() {
    overlayLockCount += 1;
    if (overlayLockCount > 1) return;
    lockedScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.position = "fixed";
    document.body.style.top = "-" + lockedScrollY + "px";
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";
  }

  function unlockPageScroll() {
    if (overlayLockCount === 0) return;
    overlayLockCount -= 1;
    if (overlayLockCount > 0) return;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    window.scrollTo(0, lockedScrollY);
  }

  /** Abschnitte in Datenreihenfolge (nicht alphabetisch). */
  const sectionsOrdered = [];
  const sectionSeen = new Set();
  for (let i = 0; i < data.length; i++) {
    const s = data[i].section;
    if (s && !sectionSeen.has(s)) {
      sectionSeen.add(s);
      sectionsOrdered.push(s);
    }
  }
  const rowByAlandNo = new Map(
    data.map(function (row) {
      return [row.aland_no, row];
    }),
  );

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function escapeAttr(s) {
    return String(s || "").replace(/"/g, "&quot;");
  }

  /** Aktiver Aland-Abschnitt (interner Schlüssel) — nur per \`?section=\` gesetzt, kein eigenes UI. */
  let activeSection = "";
  let deepLinkedAlandNo = 0;
  let pendingPericopeOpenAlandNo = 0;
  let activeSearchChapterQuery = null;
  const searchAssistEl = document.getElementById("search-assist");
  const searchToolsFactory =
    window.SYNOPSE_SEARCH && typeof window.SYNOPSE_SEARCH.createSearchTools === "function"
      ? window.SYNOPSE_SEARCH.createSearchTools
      : null;
  const searchTools = searchToolsFactory
    ? searchToolsFactory({
        searchAssistEl: searchAssistEl,
        escapeHtml: escapeHtml,
        escapeAttr: escapeAttr,
        getVerseSearchBooks: i18n ? i18n.getVerseSearchBooks : null,
      })
    : null;
  const getVerseSearchBooks = searchTools
    ? searchTools.getVerseSearchBooks
    : function () {
        return {};
      };
  const getSearchAssistState = searchTools
    ? searchTools.getSearchAssistState
    : function () {
        return null;
      };
  const renderSearchAssist = searchTools
    ? searchTools.renderSearchAssist
    : function () {
        if (!searchAssistEl) return;
        searchAssistEl.hidden = true;
        searchAssistEl.innerHTML = "";
      };
  const formatVerseQueryLabel = searchTools
    ? searchTools.formatVerseQueryLabel
    : function () {
        return "";
      };
  const rowMatchesVerseQuery = searchTools
    ? searchTools.rowMatchesVerseQuery
    : function () {
        return false;
      };
  const dedupeSearchRowsByReferences = searchTools
    ? searchTools.dedupeSearchRowsByReferences
    : function (rows) {
        return rows || [];
      };
  const normalizeSearchToken = searchTools
    ? searchTools.normalizeSearchToken
    : function (value) {
        return String(value || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/ß/g, "ss")
          .trim();
      };
  const SEARCH_BOOK_NUMBERS = {
    matthew: 40,
    mark: 41,
    luke: 42,
    john: 43,
  };
  const DIRECT_GOSPEL_REF_KEYS = {
    matthew: "ref_matthew",
    mark: "ref_mark",
    luke: "ref_luke",
    john: "ref_john",
  };
  const DIRECT_GOSPEL_WITNESS_KEYS = [
    { id: "matthew", cls: "mt", prop: "in_matthew", label: "Mt" },
    { id: "mark", cls: "mk", prop: "in_mark", label: "Mk" },
    { id: "luke", cls: "lk", prop: "in_luke", label: "Lk" },
    { id: "john", cls: "jn", prop: "in_john", label: "Jn" },
  ];
  const DIRECT_GOSPEL_SCROLL_HASH = "#context-verse";
  let searchVerseTextTranslationId = "";
  let searchVerseTextCache = null;
  let searchVerseTextLoadPromise = null;
  let searchVerseTextFailedTranslationId = "";
  let directGospelTargetScrollRequested = false;

  function hasSpecificVerseQuery(query) {
    return !!(query && Number.isFinite(query.chapter) && Number.isFinite(query.verse) && query.verse >= 1);
  }

  function getSearchVerseQueryKey(query) {
    if (!query) return "";
    return [query.book || "", query.chapter || 0, query.verse || 0].join(":");
  }

  function ensureSearchVerseTextCache(translationId) {
    const requestedQueryKey = getSearchVerseQueryKey(activeSearchChapterQuery);
    if (!translationId) return Promise.resolve(null);
    if (searchVerseTextTranslationId === translationId && searchVerseTextCache) {
      return Promise.resolve(searchVerseTextCache);
    }
    if (searchVerseTextTranslationId === translationId && searchVerseTextLoadPromise) {
      return searchVerseTextLoadPromise;
    }
    if (searchVerseTextFailedTranslationId === translationId) {
      return Promise.resolve(null);
    }

    searchVerseTextTranslationId = translationId;
    searchVerseTextCache = null;
    searchVerseTextLoadPromise = getVerseCache(translationId)
      .then(function (cache) {
        searchVerseTextLoadPromise = null;
        if (searchVerseTextTranslationId !== translationId) return cache;
        searchVerseTextCache = cache;
        searchVerseTextFailedTranslationId = cache ? "" : translationId;
        if (requestedQueryKey && requestedQueryKey === getSearchVerseQueryKey(activeSearchChapterQuery)) {
          filter();
        }
        return cache;
      })
      .catch(function () {
        searchVerseTextLoadPromise = null;
        if (searchVerseTextTranslationId === translationId) {
          searchVerseTextFailedTranslationId = translationId;
          if (requestedQueryKey && requestedQueryKey === getSearchVerseQueryKey(activeSearchChapterQuery)) {
            filter();
          }
        }
        return null;
      });
    return searchVerseTextLoadPromise;
  }

  function getSearchVerseSnippet(row, query, cache) {
    const compareApi = window.SYNOPTIC_COMPARE;
    const book = query ? getVerseSearchBooks()[query.book] : null;
    const bookNumber = query ? SEARCH_BOOK_NUMBERS[query.book] : 0;
    const ref = row && book ? row[book.refKey] || "" : "";
    if (
      !row ||
      !hasSpecificVerseQuery(query) ||
      !cache ||
      !compareApi ||
      typeof compareApi.getColumnBlocks !== "function" ||
      !book ||
      !bookNumber ||
      !ref
    ) {
      return null;
    }

    const resolved = compareApi.getColumnBlocks(
      bookNumber,
      ref,
      cache.idx || Object.create(null),
      cache.maxV || Object.create(null),
      cache.aliases || Object.create(null),
    );
    if (!resolved || !resolved.ok || !Array.isArray(resolved.blocks)) return null;

    const block = resolved.blocks.find(function (entry) {
      return entry && entry.ch === query.chapter && entry.v === query.verse && entry.text != null;
    });
    if (!block || block.text == null) return null;

    return {
      label: getBookLabel(query.book) + " " + query.chapter + "," + query.verse,
      text: String(block.text || "")
        .replace(/\s+/g, " ")
        .trim(),
    };
  }

  function renderMatchedVerseSnippet(row, query, cache) {
    const match = getSearchVerseSnippet(row, query, cache);
    if (!match) return "";
    return (
      '<p class="row-verse-match">' +
      '<span class="row-verse-match__ref">' +
      escapeHtml(match.label) +
      "</span>" +
      '<span class="row-verse-match__text">' +
      escapeHtml(match.text) +
      "</span>" +
      "</p>"
    );
  }

  let filterRequestSeq = 0;

  function getDirectGospelQuery(searchAssistState, normalizedQuery) {
    if (!searchAssistState || searchAssistState.mode !== "chapters" || !searchAssistState.book) return null;
    const parts = String(normalizedQuery || "").split(/\s+/).filter(Boolean);
    const rest = parts.slice(1).join(" ").trim();
    if (!rest) {
      return {
        book: searchAssistState.book.id,
        chapter: 1,
        verse: 0,
      };
    }
    if (!searchAssistState.selectedChapter) return null;
    return {
      book: searchAssistState.book.id,
      chapter: searchAssistState.selectedChapter,
      verse: searchAssistState.selectedVerse || 0,
    };
  }

  function formatDirectGospelQueryLabel(query) {
    if (!query) return "";
    return getBookLabel(query.book) + " " + query.chapter + (query.verse ? "," + query.verse : "");
  }

  function getCompareReferenceContextQuery(bookId, ref) {
    const compareApi = window.SYNOPTIC_COMPARE;
    const bookNumber = SEARCH_BOOK_NUMBERS[bookId];
    if (!bookId || !ref) return null;

    if (compareApi && typeof compareApi.expandRefToVerses === "function" && bookNumber) {
      const expanded = compareApi.expandRefToVerses(String(ref), bookNumber, Object.create(null));
      if (expanded && expanded.ok && Array.isArray(expanded.verses) && expanded.verses.length) {
        return {
          book: bookId,
          chapter: expanded.verses[0][0],
          verse: expanded.verses[0][1],
        };
      }
    }

    const chapterVerseMatch = String(ref).match(/(\d+)\s*[,.:]\s*(\d+)/);
    if (chapterVerseMatch) {
      return {
        book: bookId,
        chapter: parseInt(chapterVerseMatch[1], 10),
        verse: parseInt(chapterVerseMatch[2], 10),
      };
    }

    const chapterMatch = String(ref).match(/(\d+)/);
    if (chapterMatch) {
      return {
        book: bookId,
        chapter: parseInt(chapterMatch[1], 10),
        verse: 0,
      };
    }

    return null;
  }

  function buildCompareContextUrl(bookId, ref, translationId) {
    const query = getCompareReferenceContextQuery(bookId, ref);
    if (!query) return "";
    try {
      const url = new URL("/liste/", window.location.href);
      url.searchParams.set("q", formatDirectGospelQueryLabel(query));
      if (translationId) {
        url.searchParams.set("translation", translationId);
      }
      url.hash = DIRECT_GOSPEL_SCROLL_HASH;
      return url.pathname + url.search + url.hash;
    } catch (e) {
      const search = new URLSearchParams();
      search.set("q", formatDirectGospelQueryLabel(query));
      if (translationId) {
        search.set("translation", translationId);
      }
      return "/liste/?" + search.toString() + DIRECT_GOSPEL_SCROLL_HASH;
    }
  }

  function renderCompareContextLink(bookId, ref, translationId) {
    const href = buildCompareContextUrl(bookId, ref, translationId);
    if (!href) return "";
    const contextQuery = getCompareReferenceContextQuery(bookId, ref);
    const title = contextQuery ? ` title="${escapeAttr(formatDirectGospelQueryLabel(contextQuery))}"` : "";
    return `<a class="text-col-context-link" href="${escapeAttr(href)}"${title}>${escapeHtml(t("js.goToContext"))}</a>`;
  }

  function getCachedVerseText(cache, bookNumber, chapter, verse) {
    if (!cache || !cache.idx) return null;
    const aliases =
      cache.aliases && cache.aliases[bookNumber] && cache.aliases[bookNumber].length
        ? cache.aliases[bookNumber]
        : [bookNumber];
    for (let i = 0; i < aliases.length; i += 1) {
      const text = cache.idx[aliases[i] + ":" + chapter + ":" + verse];
      if (text != null) return String(text);
    }
    return null;
  }

  function getDirectGospelChapterVerses(query, cache) {
    const bookNumber = SEARCH_BOOK_NUMBERS[query.book];
    if (!bookNumber || !cache || !cache.maxV) return [];
    const maxVerse = cache.maxV[bookNumber + ":" + query.chapter] || 0;
    const verses = [];
    for (let verse = 1; verse <= maxVerse; verse += 1) {
      const text = getCachedVerseText(cache, bookNumber, query.chapter, verse);
      if (text == null) continue;
      verses.push({ verse: verse, text: text });
    }
    return verses;
  }

  function getDirectGospelChapterEvents(query) {
    const compareApi = window.SYNOPTIC_COMPARE;
    const refKey = query ? DIRECT_GOSPEL_REF_KEYS[query.book] : "";
    const bookNumber = query ? SEARCH_BOOK_NUMBERS[query.book] : 0;
    if (
      !query ||
      !refKey ||
      !bookNumber ||
      !compareApi ||
      typeof compareApi.expandRefToVerses !== "function"
    ) {
      return [];
    }

    const events = [];
    const seenRanges = new Set();

    data.forEach(function (row) {
      const ref = row && row[refKey];
      if (!ref) return;
      const expanded = compareApi.expandRefToVerses(String(ref), bookNumber, Object.create(null));
      if (!expanded || !expanded.ok || !Array.isArray(expanded.verses) || !expanded.verses.length) return;

      const chapterVerses = expanded.verses.filter(function (pair) {
        return pair && pair[0] === query.chapter && Number.isFinite(pair[1]);
      });
      if (!chapterVerses.length) return;
      const signature = chapterVerses
        .map(function (pair) {
          return pair[0] + ":" + pair[1];
        })
        .join("|");
      if (seenRanges.has(signature)) return;
      seenRanges.add(signature);

      events.push({
        alandNo: row.aland_no,
        startVerse: chapterVerses[0][1],
        endVerse: chapterVerses[chapterVerses.length - 1][1],
        title: getRowTitle(row),
        in_matthew: !!row.in_matthew,
        in_mark: !!row.in_mark,
        in_luke: !!row.in_luke,
        in_john: !!row.in_john,
      });
    });

    events.sort(function (a, b) {
      const startDiff = (a.startVerse || 0) - (b.startVerse || 0);
      if (startDiff) return startDiff;
      const endDiff = (b.endVerse || 0) - (a.endVerse || 0);
      if (endDiff) return endDiff;
      const noA = Number(a && a.alandNo) || 0;
      const noB = Number(b && b.alandNo) || 0;
      if (noA !== noB) return noA - noB;
      return String(a && a.title ? a.title : "").localeCompare(String(b && b.title ? b.title : ""));
    });
    return events;
  }

  function getDirectGospelComparisonLabels(event, currentBookId) {
    return DIRECT_GOSPEL_WITNESS_KEYS.filter(function (item) {
      return item.id !== currentBookId && !!(event && event[item.prop]);
    }).map(function (item) {
      return item.label;
    });
  }

  function renderDirectGospelComparisonWitnesses(event, currentBookId) {
    const comparisons = DIRECT_GOSPEL_WITNESS_KEYS.filter(function (item) {
      return item.id !== currentBookId && !!(event && event[item.prop]);
    });
    if (!comparisons.length) return "";
    return (
      '<span class="gospel-search-event__link-witnesses" aria-hidden="true">' +
      comparisons
        .map(function (item) {
          return (
            '<span class="gospel-search-event__link-witness ' +
            item.cls +
            '">' +
            item.label +
            "</span>"
          );
        })
        .join("") +
      "</span>"
    );
  }

  function renderDirectGospelEventActionContent(event, currentBookId) {
    const labels = getDirectGospelComparisonLabels(event, currentBookId);
    if (!labels.length) {
      return '<span class="gospel-search-event__link-text">' + escapeHtml(t("js.goToEvent")) + "</span>";
    }
    return (
      '<span class="gospel-search-event__link-text">' +
      escapeHtml(t("js.compareWithLabel")) +
      "</span>" +
      renderDirectGospelComparisonWitnesses(event, currentBookId)
    );
  }

  function renderDirectGospelVerse(entry, targetVerse) {
    return (
      '<span class="gospel-search-result__verse' +
      (targetVerse === entry.verse ? " is-target" : "") +
      '">' +
      '<span class="gospel-search-result__verse-num">' +
      entry.verse +
      "</span>" +
      '<span class="gospel-search-result__verse-text">' +
      escapeHtml(entry.text) +
      "</span>" +
      "</span>"
    );
  }

  function renderDirectGospelParagraph(entries, targetVerse) {
    if (!Array.isArray(entries) || !entries.length) return "";
    return (
      '<p class="gospel-search-result__paragraph">' +
      entries
        .map(function (entry) {
          return renderDirectGospelVerse(entry, targetVerse);
        })
        .join(" ") +
      "</p>"
    );
  }

  function renderDirectGospelEventSection(event, entries, currentBookId, targetVerse) {
    const href = event && event.alandNo ? buildContextualPericopeUrl(event.alandNo) : "";
    const actionContent = renderDirectGospelEventActionContent(event, currentBookId);
    return (
      '<section class="gospel-search-event">' +
      '<div class="gospel-search-event__headline">' +
      '<h3 class="gospel-search-event__title">' +
      escapeHtml((event && event.title) || t("js.eventFallback")) +
      "</h3>" +
      "</div>" +
      '<div class="gospel-search-event__text">' +
      renderDirectGospelParagraph(entries, targetVerse) +
      "</div>" +
      (href
        ? '<a class="gospel-search-event__link" href="' +
          escapeAttr(href) +
          '" data-aland-no="' +
          escapeAttr(String(event.alandNo || "")) +
          '">' +
          actionContent +
          "</a>"
        : "") +
      "</section>"
    );
  }

  function renderDirectGospelBody(query, verses) {
    const events = getDirectGospelChapterEvents(query);
    const parts = [];
    let cursor = 0;

    function takeVersesUntil(beforeVerse) {
      const chunk = [];
      while (cursor < verses.length && verses[cursor].verse < beforeVerse) {
        chunk.push(verses[cursor]);
        cursor += 1;
      }
      return chunk;
    }

    function takeVersesThrough(lastVerse) {
      const chunk = [];
      while (cursor < verses.length && verses[cursor].verse <= lastVerse) {
        chunk.push(verses[cursor]);
        cursor += 1;
      }
      return chunk;
    }

    events.forEach(function (event) {
      const leadingVerses = takeVersesUntil(event.startVerse || 0);
      if (leadingVerses.length) {
        parts.push(renderDirectGospelParagraph(leadingVerses, query.verse));
      }

      const eventVerses = takeVersesThrough(event.endVerse || 0);
      if (eventVerses.length) {
        parts.push(renderDirectGospelEventSection(event, eventVerses, query.book, query.verse));
      }
    });

    if (cursor < verses.length) {
      parts.push(renderDirectGospelParagraph(verses.slice(cursor), query.verse));
    }

    return parts.join("");
  }

  function renderDirectGospelResult(query, verses, translationId) {
    const title = formatDirectGospelQueryLabel({ book: query.book, chapter: query.chapter, verse: 0 });
    return (
      '<article class="gospel-search-result' +
      (translationIsSourceTextForId(translationId) ? " gospel-search-result--greek" : "") +
      '">' +
      '<header class="gospel-search-result__head">' +
      '<h2 class="gospel-search-result__title">' +
      escapeHtml(title) +
      "</h2>" +
      "</header>" +
      '<div class="gospel-search-result__body">' +
      renderDirectGospelBody(query, verses) +
      "</div>" +
      "</article>"
    );
  }

  function scrollToDirectGospelTarget(query) {
    if (!query || !query.verse) return;
    const target = listEl ? listEl.querySelector(".gospel-search-result__verse.is-target") : null;
    if (!target || typeof target.scrollIntoView !== "function") return;
    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        target.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "center",
          inline: "nearest",
        });
      });
    });
  }

  function consumeDirectGospelTargetScroll(query) {
    const shouldScroll = !!(directGospelTargetScrollRequested && query && query.verse);
    directGospelTargetScrollRequested = false;
    return shouldScroll;
  }

  function consumeDirectGospelScrollHash() {
    if (location.hash !== DIRECT_GOSPEL_SCROLL_HASH) return false;
    try {
      history.replaceState(null, "", location.pathname + location.search);
    } catch (e) {
      /* ignore */
    }
    return true;
  }

  function renderDirectGospelSearch(query, translationId, requestSeq) {
    const countEl = document.getElementById("count");
    if (countEl) {
      const translationLabel = translationVerboseLabelForId(translationId);
      countEl.textContent = translationLabel || "";
    }
    pulseCountLine();
    listEl.innerHTML =
      '<div class="empty">' +
      escapeHtml(translationIsSourceTextForId(translationId) ? t("js.loadingGreek") : t("js.loadingTranslation")) +
      "</div>";
    triggerListReveal();
    syncListFabs();

    getVerseCache(translationId)
      .then(function (cache) {
        if (requestSeq !== filterRequestSeq) return;
        const verses = getDirectGospelChapterVerses(query, cache);
        if (!verses.length) {
          listEl.innerHTML =
            '<div class="empty">' +
            escapeHtml(translationIsSourceTextForId(translationId) ? t("js.noGreekData") : t("js.noTranslationData")) +
            "</div>";
          triggerListReveal();
          syncListFabs();
          return;
        }
        listEl.innerHTML = renderDirectGospelResult(query, verses, translationId);
        triggerListReveal();
        if (consumeDirectGospelTargetScroll(query)) {
          scrollToDirectGospelTarget(query);
        }
        syncListFabs();
      })
      .catch(function (err) {
        if (requestSeq !== filterRequestSeq) return;
        const detail = err && err.message ? " " + err.message : "";
        listEl.innerHTML =
          '<div class="empty">' +
          escapeHtml(
            (translationIsSourceTextForId(translationId) ? t("js.greekLoadFailed") : t("js.translationLoadFailed")) +
              detail,
          ) +
          "</div>";
        triggerListReveal();
        syncListFabs();
      });
  }

  function createAlandTopic(id, label, startAland, endAland) {
    const alandNos = [];
    for (let no = startAland; no <= endAland; no += 1) {
      alandNos.push(no);
    }
    const alandSet = new Set(alandNos);
    return {
      id: id,
      label: label,
      count: alandNos.length,
      matcher: function (row) {
        return alandSet.has(row.aland_no);
      },
    };
  }

  function createAlandTopicFromList(id, label, alandNos) {
    const alandSet = new Set(alandNos);
    return {
      id: id,
      label: label,
      count: alandNos.length,
      matcher: function (row) {
        return alandSet.has(row.aland_no);
      },
    };
  }

  function stripExplorerTopicNumber(label) {
    return String(label || "").replace(/^\d+\.\s*/, "").trim();
  }

  function detailSectionLabelForRow(row) {
    if (!row) return "";
    const topic = explorerTopics.find(function (item) {
      return item.matcher(row);
    });
    if (topic) {
      return topic.groupLabel + " · " + stripExplorerTopicNumber(topic.label);
    }
    return stripExplorerTopicNumber(getRowSection(row) || "");
  }

  const SYNOPSE_CONFIG = window.SYNOPSE_CONFIG || {};
  const explorerTopicGroups = (SYNOPSE_CONFIG.explorerTopicGroups || []).map(function (group) {
    return {
      id: group.id,
      label: getExplorerGroupLabel(group.id, group.label),
      items: (group.items || []).map(function (item) {
        return createAlandTopicFromList(item.id, getExplorerTopicLabel(item.id, item.label), item.alandNos || []);
      }),
    };
  });
  const explorerTopics = explorerTopicGroups.flatMap(function (group) {
    return group.items.map(function (item) {
      return Object.assign({ groupId: group.id, groupLabel: group.label }, item);
    });
  });
  const explorerAssignedAlands = new Set();
  let explorerAssignedCount = 0;
  explorerTopics.forEach(function (topic) {
    data.forEach(function (row) {
      if (!topic.matcher(row)) return;
      explorerAssignedAlands.add(row.aland_no);
      explorerAssignedCount += 1;
    });
  });
  if (
    explorerAssignedAlands.size !== 365 ||
    explorerAssignedCount !== 365 ||
    explorerAssignedAlands.has(361) ||
    explorerAssignedAlands.has(362)
  ) {
    console.warn("Explorer-Zuordnung unerwartet:", {
      uniqueAssigned: explorerAssignedAlands.size,
      totalAssigned: explorerAssignedCount,
    });
  }
  const explorerTopicById = new Map(
    explorerTopics.map(function (topic) {
      return [topic.id, topic];
    }),
  );
  const explorerGroupById = new Map(
    explorerTopicGroups.map(function (group) {
      return [group.id, group];
    }),
  );
  let explorerActiveTopicId = "";
  let explorerActiveGroupId = "";
  let chapterPickerGroupId = "";
  let chapterPickerReturnFocusEl = null;
  let chapterPickerHideTimer = 0;

  function sgMatthew(r) {
    return r.in_matthew && !r.in_mark && !r.in_luke;
  }
  function sgMark(r) {
    return r.in_mark && !r.in_matthew && !r.in_luke;
  }
  function sgLuke(r) {
    return r.in_luke && !r.in_matthew && !r.in_mark;
  }
  function sgJohn(r) {
    return r.in_john && !r.in_matthew && !r.in_mark && !r.in_luke;
  }

  const presetGroups = (SYNOPSE_CONFIG.presetGroups || []).map(function (group) {
    return {
      id: group.id,
      label: getPresetGroupLabel(group.id, group.label),
      presets: (group.presets || []).map(function (preset) {
        return Object.assign({}, preset, {
          label: getPresetLabel(preset.id, preset.label),
          title: getPresetTitle(preset.id, preset.title),
        });
      }),
    };
  });
  const presetEl = document.getElementById("presets");
  let activePreset = "all";
  /** Nach Deep-Link (?section=…) erste Trefferzeile ins Sichtfeld scrollen. */
  let scrollListToFirst = false;

  function syncPresetButtonActiveState() {
    if (!presetEl) return;
    presetEl.querySelectorAll("button[data-preset]").forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.preset === activePreset);
    });
  }

  function syncListFabs() {
    const scrollBtn = document.getElementById("scroll-top-fab");
    if (scrollBtn) scrollBtn.classList.toggle("visible", window.scrollY > 200);
  }

  const shareFeedbackEl = document.getElementById("share-feedback");

  function replaceCurrentQuery(mutator) {
    try {
      const url = new URL(window.location.href);
      mutator(url.searchParams);
      const nextSearch = url.searchParams.toString();
      const nextUrl = url.pathname + (nextSearch ? "?" + nextSearch : "") + url.hash;
      history.replaceState(null, "", nextUrl);
    } catch (e) {
      /* ignore */
    }
  }

  function clearContextQueryParamsFromUrl() {
    replaceCurrentQuery(function (params) {
      params.delete("q");
      params.delete("translation");
    });
  }

  function clearPericopeParamFromUrl() {
    replaceCurrentQuery(function (params) {
      params.delete("p");
    });
  }

  function clearPericopeDeepLinkWithoutFiltering() {
    if (!deepLinkedAlandNo) return;
    deepLinkedAlandNo = 0;
    clearPericopeParamFromUrl();
  }

  function buildPericopeUrl(alandNo) {
    try {
      const url = new URL(window.location.href);
      url.pathname = "/liste/";
      url.hash = "";
      url.search = "";
      url.searchParams.set("p", String(alandNo));
      return url.toString();
    } catch (e) {
      return "/liste/?p=" + encodeURIComponent(String(alandNo));
    }
  }

  function buildContextualPericopeUrl(alandNo) {
    try {
      const url = new URL(buildPericopeUrl(alandNo), window.location.href);
      const query = qInput && qInput.value ? String(qInput.value).trim() : "";
      const translationId = typeof effectiveTranslationId === "function" ? effectiveTranslationId("main") : "";
      if (query) {
        url.searchParams.set("q", query);
      }
      if (translationId) {
        url.searchParams.set("translation", translationId);
      }
      return url.toString();
    } catch (e) {
      return buildPericopeUrl(alandNo);
    }
  }

  const shareToolsFactory =
    window.SYNOPSE_SHARE && typeof window.SYNOPSE_SHARE.createShareTools === "function"
      ? window.SYNOPSE_SHARE.createShareTools
      : null;
  const shareTools = shareToolsFactory
    ? shareToolsFactory({
        shareFeedbackEl: shareFeedbackEl,
        buildPericopeUrl: buildPericopeUrl,
        t: t,
        getRowTitle: getRowTitle,
      })
    : null;
  const sharePericopeRow = shareTools
    ? shareTools.sharePericopeRow
    : async function () {
        return false;
      };

  function renderFilterLanding() {
    return `<section class="start-state start-state--filter" aria-label="Filter-Hinweis">
      <p class="start-state__kicker">${t("js.filterModeKicker")}</p>
      <h2 class="start-state__title">${t("js.filterModeTitle")}</h2>
      <p class="start-state__text">${t("js.filterModeText")}</p>
    </section>`;
  }

  function renderStarterLanding() {
    return `<section class="start-state" aria-label="Einstieg in die Ereignisse">
      <h2 class="start-state__title">${t("js.starterTitle")}</h2>
      <p class="start-state__text">${t("js.starterText")}</p>
    </section>`;
  }

  function presetButtonHtml(p) {
    const tip = p.title ? ` title="${escapeAttr(p.title)}"` : "";
    return `<button type="button" data-preset="${p.id}" class="${
      p.id === activePreset ? "active" : ""
    }"${tip}>${p.label}</button>`;
  }

  if (presetEl) {
    presetEl.innerHTML = presetGroups
      .map(
        (g) =>
          `<div class="preset-group"><span class="preset-group-label">${escapeHtml(
            g.label,
          )}</span><div class="preset">${g.presets.map(presetButtonHtml).join("")}</div></div>`,
      )
      .join("");
  }

  const sectionListHeadingEl = document.getElementById("section-list-heading");
  const sectionListHeadingTitleEl = document.getElementById("section-list-heading-title");
  const sectionListHeadingClearEl = document.getElementById("section-list-heading-clear");

  function hasOpenFilterPanel() {
    let open = false;
    document.querySelectorAll(".filter-acc-panel").forEach(function (panel) {
      if (panel.open) open = true;
    });
    return open;
  }

  function updateSectionListHeading() {
    if (!sectionListHeadingEl || !sectionListHeadingTitleEl) return;
    if (activeSearchChapterQuery) {
      sectionListHeadingTitleEl.textContent = t("js.eventsFor", { label: formatVerseQueryLabel(activeSearchChapterQuery) });
      sectionListHeadingEl.hidden = false;
      if (sectionListHeadingClearEl) {
        sectionListHeadingClearEl.hidden = false;
      }
      return;
    }
    const explorerTopic = explorerTopicById.get(explorerActiveTopicId);
    if (explorerTopic) {
      sectionListHeadingTitleEl.textContent = stripExplorerTopicNumber(explorerTopic.label);
      sectionListHeadingEl.hidden = false;
      if (sectionListHeadingClearEl) {
        sectionListHeadingClearEl.hidden = false;
      }
      return;
    }
    const sec = activeSection;
    if (!sec) {
      sectionListHeadingEl.hidden = true;
      sectionListHeadingTitleEl.textContent = "";
      if (sectionListHeadingClearEl) {
        sectionListHeadingClearEl.hidden = true;
      }
      return;
    }
    const sample = data.find((r) => r.section === sec);
    const label = sample ? getRowSection(sample) : sec;
    sectionListHeadingTitleEl.textContent = label;
    sectionListHeadingEl.hidden = false;
    if (sectionListHeadingClearEl) {
      sectionListHeadingClearEl.hidden = false;
    }
  }

  document.querySelectorAll(".filter-acc-panel").forEach(function (panel) {
    panel.addEventListener("toggle", function () {
      if (panel.open) {
        clearContextQueryParamsFromUrl();
        clearPericopeDeepLinkWithoutFiltering();
        clearExplorerSelectionWithoutFiltering();
        clearVerseQueryWithoutFiltering();
        const qEl = document.getElementById("q");
        if (qEl) qEl.value = "";
        document.querySelectorAll(".filter-acc-panel").forEach(function (other) {
          if (other !== panel) other.open = false;
        });
        filter();
        return;
      }
      const kind = panel.getAttribute("data-filter-kind");
      if (kind === "presets" && presetEl) {
        activePreset = "all";
        syncPresetButtonActiveState();
      }
      filter();
    });
  });

  const filterToolbar = document.getElementById("filter-accordion");
  const filterPresetsPanel = document.querySelector(
    '.filter-acc-panel[data-filter-kind="presets"]',
  );
  const filterPresetsLabel = document.querySelector(".filter-acc-btn-label");
  const filterPresetsBody = filterPresetsPanel
    ? filterPresetsPanel.querySelector(".filter-acc-body--presets")
    : null;

  function syncFilterPresetsLabel() {
    if (!filterPresetsLabel || !filterPresetsPanel) return;
    filterPresetsLabel.textContent = filterPresetsPanel.open ? "Filter schliessen" : "Filter";
  }

  function syncFilterVisibility() {
    if (!filterPresetsPanel) return;
    const qEl = document.getElementById("q");
    const hasQuery = Boolean((qEl && qEl.value ? qEl.value : "").trim());
    if (hasQuery && filterPresetsPanel.open) {
      filterPresetsPanel.open = false;
    }
    filterPresetsPanel.classList.toggle("is-hidden-by-search", hasQuery);
    filterPresetsPanel.setAttribute("aria-hidden", hasQuery ? "true" : "false");
    if (hasQuery) {
      filterPresetsPanel.setAttribute("inert", "");
    } else {
      filterPresetsPanel.removeAttribute("inert");
    }
    updateFilterToolbarReserveSpace();
  }

  /** Entspricht CSS --filter-gap (Abstand Toolbar-Zeile → Dropdown). */
  function getFilterGapPx() {
    const fs = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--filter-gap").trim();
    const rem = /^([\d.]+)rem$/.exec(raw);
    if (rem) return parseFloat(rem[1], 10) * fs;
    const px = /^([\d.]+)px$/.exec(raw);
    if (px) return parseFloat(px[1], 10);
    return 10;
  }

  /** Platz unter der Toolbar, damit das absolut positionierte Panel die Liste nicht überdeckt.
   *  margin-bottom (nicht padding): sonst wächst die Toolbar-Höhe und top:100% für das Panel verschiebt sich. */
  function updateFilterToolbarReserveSpace() {
    if (!filterToolbar || !filterPresetsPanel) return;
    if (!filterPresetsPanel.open || !filterPresetsBody) {
      filterToolbar.style.marginBottom = "";
      return;
    }
    filterToolbar.style.marginBottom = filterPresetsBody.offsetHeight + getFilterGapPx() + "px";
  }

  if (filterPresetsPanel) {
    filterPresetsPanel.addEventListener("toggle", function () {
      syncFilterPresetsLabel();
      requestAnimationFrame(function () {
        requestAnimationFrame(updateFilterToolbarReserveSpace);
      });
    });
    syncFilterPresetsLabel();
    syncFilterVisibility();
    window.addEventListener("resize", updateFilterToolbarReserveSpace);
    if (filterPresetsBody && typeof ResizeObserver !== "undefined") {
      new ResizeObserver(updateFilterToolbarReserveSpace).observe(filterPresetsBody);
    }
  }

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function escapeAttr(s) {
    return String(s == null ? "" : s).replace(/"/g, "&quot;");
  }

  function matchesPreset(r, id) {
    if (id === "all") return true;
    if (id === "has_mt") return r.in_matthew;
    if (id === "has_mk") return r.in_mark;
    if (id === "has_lk") return r.in_luke;
    if (id === "has_jn") return r.in_john;
    if (id === "triple") return tripleSyn(r);
    if (id === "q") return qStyle(r);
    if (id === "syn_only") return !r.in_john;
    if (id === "sg_mt") return sgMatthew(r);
    if (id === "sg_mk") return sgMark(r);
    if (id === "sg_lk") return sgLuke(r);
    if (id === "sg_jn") return sgJohn(r);
    return true;
  }

  function pill(cls, label, on, bold, ref, options) {
    options = options || {};
    const r = ref ? `<span class="ref">${escapeHtml(ref)}</span>` : "";
    return `<span class="pill ${cls} ${on ? "on" : ""} ${on && bold ? "bold" : ""} ${options.isMatch ? "pill--match" : ""}">${label}${r}</span>`;
  }

  const FAVORITE_ALANDS_STORAGE_KEY = "synopse-favorite-alands";
  const DEFAULT_STARTER_ALANDS = Array.isArray(SYNOPSE_CONFIG.defaultStarterAlands) && SYNOPSE_CONFIG.defaultStarterAlands.length
    ? SYNOPSE_CONFIG.defaultStarterAlands
    : [18, 269, 352];

  let favoriteAlandNos = [];

  function sanitizeFavoriteAlandNos(arr) {
    const seen = Object.create(null);
    const out = [];
    (arr || []).forEach(function (value) {
      const no = parseInt(value, 10);
      if (Number.isNaN(no) || seen[no] || !rowByAlandNo.has(no)) return;
      seen[no] = true;
      out.push(no);
    });
    return out;
  }

  function loadFavoriteAlands() {
    try {
      const raw = localStorage.getItem(FAVORITE_ALANDS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        favoriteAlandNos = sanitizeFavoriteAlandNos(parsed);
      }
    } catch (e) {
      /* ignore */
    }
  }

  function persistFavoriteAlands() {
    try {
      localStorage.setItem(FAVORITE_ALANDS_STORAGE_KEY, JSON.stringify(favoriteAlandNos));
    } catch (e) {
      /* ignore */
    }
  }

  function isFavoriteAlandNo(alandNo) {
    return favoriteAlandNos.indexOf(alandNo) !== -1;
  }

  function toggleFavoriteAlandNo(alandNo) {
    if (!rowByAlandNo.has(alandNo)) return false;
    if (isFavoriteAlandNo(alandNo)) {
      favoriteAlandNos = favoriteAlandNos.filter(function (no) {
        return no !== alandNo;
      });
    } else {
      favoriteAlandNos = [alandNo].concat(
        favoriteAlandNos.filter(function (no) {
          return no !== alandNo;
        }),
      );
    }
    persistFavoriteAlands();
    return isFavoriteAlandNo(alandNo);
  }

  function getFavoriteRows() {
    return favoriteAlandNos
      .map(function (no) {
        return rowByAlandNo.get(no) || null;
      })
      .filter(Boolean);
  }

  function getStarterRows() {
    return DEFAULT_STARTER_ALANDS
      .map(function (no) {
        return rowByAlandNo.get(no) || null;
      })
      .filter(Boolean);
  }

  loadFavoriteAlands();
  let initialHomeDemoTranslationId = "";
  let requestedTranslationId = "";
  try {
    const params = new URLSearchParams(window.location.search);
    const tr = params.get("translation");
    if (tr) {
      requestedTranslationId = tr;
      if (isCompareHome) initialHomeDemoTranslationId = tr;
    }
  } catch (e) {
    /* ignore */
  }

  const translationToolsFactory =
    window.SYNOPSE_TRANSLATIONS && typeof window.SYNOPSE_TRANSLATIONS.createTranslationTools === "function"
      ? window.SYNOPSE_TRANSLATIONS.createTranslationTools
      : null;
  const translationTools = translationToolsFactory
    ? translationToolsFactory({
        translationLangOrder: SYNOPSE_CONFIG.translationLangOrder || [],
        translations: SYNOPSE_CONFIG.translations || [],
        quickTranslationDe: SYNOPSE_CONFIG.quickTranslationDe || "elberfelder_1905",
        quickTranslationEn: SYNOPSE_CONFIG.quickTranslationEn || "web",
        quickTranslationFr: SYNOPSE_CONFIG.quickTranslationFr || "segond_1910",
        quickTranslationIt: SYNOPSE_CONFIG.quickTranslationIt || "riveduta_1927",
        quickTranslationEs: SYNOPSE_CONFIG.quickTranslationEs || "sparv",
        quickTranslationEl: SYNOPSE_CONFIG.quickTranslationEl || "greek_slb",
        getUiLang: i18n ? i18n.getLang : null,
        isCompareHome: isCompareHome,
        initialHomeDemoTranslationId: initialHomeDemoTranslationId,
        escapeHtml: escapeHtml,
        escapeAttr: escapeAttr,
        lockPageScroll: lockPageScroll,
        unlockPageScroll: unlockPageScroll,
        t: t,
        getTranslationLangLabel: i18n ? i18n.getTranslationLangLabel : null,
      })
    : null;
  const getActiveTranslationId = translationTools
    ? translationTools.getActiveTranslationId
    : function () {
        return "";
      };
  const getPrimaryQuickTranslationId = translationTools
    ? translationTools.getPrimaryQuickTranslationId
    : function () {
        return "";
      };
  const setActiveTranslationId = translationTools
    ? translationTools.setActiveTranslationId
    : function () {};
  if (requestedTranslationId) {
    setActiveTranslationId(requestedTranslationId);
  }
  const getHomeDemoTranslationId = translationTools
    ? translationTools.getHomeDemoTranslationId
    : function () {
        return "";
      };
  const effectiveTranslationId = translationTools
    ? translationTools.effectiveTranslationId
    : function () {
        return "";
      };
  const isQuickPairTranslationId = translationTools
    ? translationTools.isQuickPairTranslationId
    : function () {
        return false;
      };
  const notePinnedTranslationChoice = translationTools
    ? translationTools.notePinnedTranslationChoice
    : function () {};
  const removePinnedQuickTranslation = translationTools
    ? translationTools.removePinnedQuickTranslation
    : function () {};
  const getVerseCache = translationTools
    ? translationTools.getVerseCache
    : async function () {
        return null;
      };
  const translationIsSourceTextForId = translationTools
    ? translationTools.translationIsSourceTextForId
    : function () {
        return false;
      };
  const translationVerboseLabelForId = translationTools
    ? translationTools.translationVerboseLabelForId
    : function (translationId) {
        return String(translationId || "");
      };
  const compareColumnMetaHtmlForTranslation = translationTools
    ? translationTools.compareColumnMetaHtmlForTranslation
    : function () {
        return "";
      };
  const refreshQuickStripOnly = translationTools
    ? translationTools.refreshQuickStripOnly
    : function () {};
  const refreshTranslationUI = translationTools
    ? translationTools.refreshTranslationUI
    : function () {};
  const syncTranslationButtons = translationTools
    ? translationTools.syncTranslationButtons
    : function () {};
  const openTranslationPicker = translationTools
    ? translationTools.openTranslationPicker
    : function () {};
  const closeTranslationPicker = translationTools
    ? translationTools.closeTranslationPicker
    : function () {};
  const openTranslationInfoDialog = translationTools
    ? translationTools.openTranslationInfoDialog
    : function () {};
  const focusTranslationQuickControl = translationTools
    ? translationTools.focusTranslationQuickControl
    : function () {};
  const greekCompareToolsFactory =
    window.SYNOPSE_GREEK_TOOLS && typeof window.SYNOPSE_GREEK_TOOLS.createGreekCompareTools === "function"
      ? window.SYNOPSE_GREEK_TOOLS.createGreekCompareTools
      : null;
  const greekCompareTools = greekCompareToolsFactory
    ? greekCompareToolsFactory({
        t: t,
        escapeHtml: escapeHtml,
        escapeAttr: escapeAttr,
        getBookLabel: getBookLabel,
        effectiveTranslationId: effectiveTranslationId,
        getReferenceTranslationId: getPrimaryQuickTranslationId,
        getVerseCache: getVerseCache,
        translationVerboseLabelForId: translationVerboseLabelForId,
        invalidateOpenPanels: function (options) {
          invalidateOpenPanels(options);
        },
        fetchJson: function (path) {
          return fetchJsonIfExists(path);
        },
        getCompareGridEl: function (which) {
          return document.getElementById(which === "modal" ? "compare-modal-grid" : "compare-main-grid");
        },
        onModeChange: function () {
          syncVerseMarkerToggleButtons();
        },
      })
    : null;

  const compareModal = document.getElementById("compare-modal");
  const compareModalBackdrop = document.getElementById("compare-modal-backdrop");
  const compareModalShareBtn = document.getElementById("compare-modal-share");
  const compareModalFavoriteBtn = document.getElementById("compare-modal-favorite");
  const compareModalMarkerToggleBtn = document.getElementById("compare-modal-marker-toggle");
  const compareMainMarkerToggleBtn = document.getElementById("compare-main-marker-toggle");
  const compareModalCloseBtn = document.getElementById("compare-modal-close");
  const translationPickerOverlay = document.getElementById("translation-picker-overlay");
  const VERSE_MARKERS_STORAGE_KEY = "synopse-verse-markers-enabled";
  const VERSE_MARKER_ANIMATION_DURATION_MS = 420;
  const VERSE_MARKER_ANIMATION_STEP_MS = 0;
  const VERSE_MARKER_ANIMATION_MAX_DELAY_MS = 0;
  let verseMarkersEnabled = true;
  let compareModalRowId = null;
  let compareMainRowId = null;
  let lastFocusBeforeModal = null;
  let translationSwapSeq = 0;

  try {
    const storedVerseMarkersEnabled = localStorage.getItem(VERSE_MARKERS_STORAGE_KEY);
    if (storedVerseMarkersEnabled === "0") verseMarkersEnabled = false;
  } catch (e) {
    /* ignore */
  }

  function syncVerseMarkerToggleButtons() {
    [
      { button: compareModalMarkerToggleBtn, which: "modal" },
      { button: compareMainMarkerToggleBtn, which: "main" },
    ].forEach(function (entry) {
      const button = entry.button;
      if (!button) return;
      const suppressed = !!(
        greekCompareTools &&
        typeof greekCompareTools.suppressesVerseMarkers === "function" &&
        greekCompareTools.suppressesVerseMarkers(entry.which)
      );
      button.classList.toggle("is-active", verseMarkersEnabled && !suppressed);
      button.classList.toggle("is-disabled", suppressed);
      button.disabled = suppressed;
      button.setAttribute("aria-pressed", verseMarkersEnabled && !suppressed ? "true" : "false");
      button.setAttribute(
        "aria-label",
        suppressed
          ? "Experimentelle Marker in der Interlinearansicht deaktiviert"
          : verseMarkersEnabled
            ? "Experimentelle Marker ausblenden"
            : "Experimentelle Marker einblenden",
      );
      button.title = suppressed
        ? "Experimentelle Marker in der Interlinearansicht deaktiviert"
        : verseMarkersEnabled
          ? "Experimentelle Marker ausblenden"
          : "Experimentelle Marker einblenden";
    });
  }

  function setVerseMarkersPreference(nextValue) {
    verseMarkersEnabled = !!nextValue;
    try {
      localStorage.setItem(VERSE_MARKERS_STORAGE_KEY, verseMarkersEnabled ? "1" : "0");
    } catch (e) {
      /* ignore */
    }
    syncVerseMarkerToggleButtons();
  }

  function animateMarkerExitInGrid(grid) {
    if (!grid) return 0;
    const markers = Array.from(grid.querySelectorAll(".compare-marker"));
    if (!markers.length) return 0;
    markers.forEach(function (marker, index) {
      marker.classList.remove("compare-marker--enter");
      marker.classList.add("compare-marker--exit");
      marker.style.setProperty(
        "--marker-delay",
        String(Math.min(index * VERSE_MARKER_ANIMATION_STEP_MS, VERSE_MARKER_ANIMATION_MAX_DELAY_MS)) + "ms",
      );
    });
    return (
      VERSE_MARKER_ANIMATION_DURATION_MS +
      Math.min((markers.length - 1) * VERSE_MARKER_ANIMATION_STEP_MS, VERSE_MARKER_ANIMATION_MAX_DELAY_MS)
    );
  }

  function removeMarkersInGrid(grid) {
    if (!grid) return;
    grid.querySelectorAll(".compare-marker").forEach(function (marker) {
      const line = marker.closest(".verse-line");
      const parent = marker.parentNode;
      if (!parent) return;
      while (marker.firstChild) {
        parent.insertBefore(marker.firstChild, marker);
      }
      parent.removeChild(marker);
      if (line && !line.querySelector(".compare-marker")) {
        line.classList.remove("verse-line--marked");
      }
    });
  }

  function setVerseMarkersEnabled(nextValue) {
    nextValue = !!nextValue;
    if (nextValue === verseMarkersEnabled) return;
    if (!nextValue) {
      const modalDelay =
        compareModal && compareModal.classList.contains("is-open")
          ? animateMarkerExitInGrid(document.getElementById("compare-modal-grid"))
          : 0;
      const mainDelay = compareMainRowId !== null ? animateMarkerExitInGrid(document.getElementById("compare-main-grid")) : 0;
      const delay = Math.max(modalDelay, mainDelay);
      if (delay > 0) {
        setVerseMarkersPreference(false);
        window.setTimeout(function () {
          if (verseMarkersEnabled) return;
          removeMarkersInGrid(document.getElementById("compare-modal-grid"));
          removeMarkersInGrid(document.getElementById("compare-main-grid"));
        }, delay);
        return;
      }
      setVerseMarkersPreference(false);
      removeMarkersInGrid(document.getElementById("compare-modal-grid"));
      removeMarkersInGrid(document.getElementById("compare-main-grid"));
      return;
    }
    setVerseMarkersPreference(nextValue);
    invalidateOpenPanels({ skipSwap: true, skipReveal: true });
  }

  function syncGreekScriptClass() {
    const greekModal = translationIsSourceTextForId(getActiveTranslationId());
    const greekMain = translationIsSourceTextForId(effectiveTranslationId("main"));
    const modalPanel = document.getElementById("compare-modal-panel");
    const mainPanel = document.getElementById("compare-main-panel");
    if (modalPanel) modalPanel.classList.toggle("is-greek-script", greekModal);
    if (mainPanel) mainPanel.classList.toggle("is-greek-script", greekMain);
    if (greekCompareTools) {
      greekCompareTools.syncPanel("modal");
      greekCompareTools.syncPanel("main");
    }
  }

  function closeCompareModal() {
    if (!compareModal) return;
    closeTranslationPicker();
    const infoDlg = document.getElementById("translation-info-dialog");
    if (infoDlg && infoDlg.open && typeof infoDlg.close === "function") {
      infoDlg.close();
    }
    const panel = document.getElementById("compare-modal-panel");
    if (panel) panel.classList.remove("is-greek-script");
    if (greekCompareTools) greekCompareTools.clearSelection("modal");
    compareModal.classList.remove("is-open");
    syncCompareModalShareButton(null);
    syncCompareModalFavoriteButton(null);
    compareModalRowId = null;
    translationSwapSeq += 1;
    const grid = document.getElementById("compare-modal-grid");
    if (grid) {
      grid.dataset.filled = "0";
      grid.classList.remove("is-swapping");
      grid.innerHTML = "";
    }
    window.setTimeout(function () {
      compareModal.setAttribute("hidden", "");
    }, 450);
    unlockPageScroll();
    if (lastFocusBeforeModal && typeof lastFocusBeforeModal.focus === "function") {
      lastFocusBeforeModal.focus();
    }
    lastFocusBeforeModal = null;
  }

  function openCompareModalForRow(row, focusSourceEl) {
    if (!compareModal || !row) return;
    const id = row.row_id;
    compareModalRowId = id;
    lastFocusBeforeModal = focusSourceEl || document.activeElement;
    translationSwapSeq += 1;
    if (greekCompareTools) greekCompareTools.clearSelection("modal");

    const alandEl = document.getElementById("compare-modal-aland");
    const titleEl = document.getElementById("compare-modal-title");
    const secEl = document.getElementById("compare-modal-sec");
    if (alandEl) {
      alandEl.textContent = "";
      alandEl.hidden = true;
    }
    if (titleEl) titleEl.textContent = getRowTitle(row);
    if (secEl) secEl.textContent = detailSectionLabelForRow(row);
    syncCompareModalShareButton(row);
    syncCompareModalFavoriteButton(row);

    const grid = document.getElementById("compare-modal-grid");
    if (!grid) return;
    grid.dataset.filled = "0";
    grid.classList.remove("is-swapping");
    grid.innerHTML = "";

    compareModal.removeAttribute("hidden");
    lockPageScroll();
    compareModal.classList.add("is-open");

    fillCompareGrid(grid, row, "modal");
    if (compareModalCloseBtn) {
      window.setTimeout(function () {
        compareModalCloseBtn.focus();
      }, 50);
    }
  }

  function openCompareModal(wrap) {
    if (!compareModal || !wrap) return;
    const id = +wrap.dataset.rowId;
    const row = data.find(function (x) {
      return x.row_id === id;
    });
    if (!row) return;
    openCompareModalForRow(row, wrap);
  }

  function syncCompareModalFavoriteButton(row) {
    if (!compareModalFavoriteBtn) return;
    const labelEl = compareModalFavoriteBtn.querySelector(".compare-modal-favorite__label");
    if (!row) {
      compareModalFavoriteBtn.hidden = true;
      compareModalFavoriteBtn.classList.remove("is-active");
      compareModalFavoriteBtn.setAttribute("aria-pressed", "false");
      compareModalFavoriteBtn.setAttribute("aria-label", t("js.bookmark"));
      compareModalFavoriteBtn.title = t("js.bookmark");
      if (labelEl) labelEl.textContent = t("js.bookmark");
      return;
    }
    const active = isFavoriteAlandNo(row.aland_no);
    compareModalFavoriteBtn.hidden = false;
    compareModalFavoriteBtn.classList.toggle("is-active", active);
    compareModalFavoriteBtn.setAttribute("aria-pressed", active ? "true" : "false");
    compareModalFavoriteBtn.setAttribute("aria-label", active ? t("js.bookmarked") : t("js.bookmark"));
    compareModalFavoriteBtn.title = active ? t("js.bookmarked") : t("js.bookmark");
    if (labelEl) labelEl.textContent = active ? t("js.bookmarked") : t("js.bookmark");
  }

  function syncCompareModalShareButton(row) {
    if (!compareModalShareBtn) return;
    if (!row) {
      compareModalShareBtn.hidden = true;
      compareModalShareBtn.removeAttribute("data-share-aland");
      return;
    }
    compareModalShareBtn.hidden = false;
    compareModalShareBtn.setAttribute("data-share-aland", String(row.aland_no));
    compareModalShareBtn.setAttribute(
      "aria-label",
      t("js.shareEvent") + ": " + getRowTitle(row),
    );
    compareModalShareBtn.title = t("js.shareEvent");
  }

  const explorerEl = document.getElementById("event-explorer");
  const explorerChapterEl = document.getElementById("event-explorer-chapters");
  const chapterPickerEl = document.getElementById("chapter-picker");
  const chapterPickerBackdrop = document.getElementById("chapter-picker-backdrop");
  const chapterPickerCloseBtn = document.getElementById("chapter-picker-close");
  const chapterPickerTitleEl = document.getElementById("chapter-picker-title");
  const chapterPickerItemsEl = document.getElementById("chapter-picker-items");

  function renderExplorerMenu() {
    if (explorerChapterEl) {
      explorerChapterEl.innerHTML = explorerTopicGroups
        .map(function (group) {
          const groupCount = group.items.reduce(function (sum, item) {
            return sum + item.count;
          }, 0);
          return `<button type="button" class="event-explorer__chapter${
            group.id === explorerActiveGroupId ? " is-active" : ""
          }" data-explorer-group="${escapeAttr(group.id)}" aria-pressed="${
            group.id === explorerActiveGroupId ? "true" : "false"
          }">
            <span class="event-explorer__chapter-label">${escapeHtml(group.label)}</span>
            <span class="event-explorer__chapter-count">${groupCount}</span>
          </button>`;
        })
        .join("");
    }
    if (!chapterPickerTitleEl || !chapterPickerItemsEl) return;
    const activeGroup = explorerGroupById.get(chapterPickerGroupId);
    if (!activeGroup) {
      chapterPickerTitleEl.textContent = "";
      chapterPickerItemsEl.innerHTML = "";
      return;
    }
    chapterPickerTitleEl.textContent = activeGroup.label;
    chapterPickerItemsEl.innerHTML = activeGroup.items
      .map(function (item) {
        return `<button type="button" class="event-explorer__item${
          item.id === explorerActiveTopicId ? " is-active" : ""
        }" data-explorer-topic="${escapeAttr(item.id)}" aria-pressed="${
          item.id === explorerActiveTopicId ? "true" : "false"
        }">
          <span class="event-explorer__item-label">${escapeHtml(stripExplorerTopicNumber(item.label))}</span>
          <span class="event-explorer__item-count">${item.count}</span>
        </button>`;
      })
      .join("");
  }

  function clearExplorerSelectionWithoutFiltering() {
    explorerActiveGroupId = "";
    explorerActiveTopicId = "";
    chapterPickerGroupId = "";
    renderExplorerMenu();
  }

  function clearVerseQueryWithoutFiltering() {
    activeSearchChapterQuery = null;
  }

  function clearStandardFiltersWithoutFiltering() {
    const qEl = document.getElementById("q");
    if (qEl) qEl.value = "";
    activePreset = "all";
    syncPresetButtonActiveState();
    activeSection = "";
    document.querySelectorAll(".filter-acc-panel").forEach(function (panel) {
      panel.open = false;
    });
  }

  function syncExplorerVisibility() {
    if (!explorerEl) return;
    const qEl = document.getElementById("q");
    const hasQuery = Boolean((qEl && qEl.value ? qEl.value : "").trim());
    const filterModeActive =
      hasOpenFilterPanel() || activePreset !== "all" || Boolean(activeSection) || Boolean(activeSearchChapterQuery);
    const shouldShowExplorer = !hasQuery && !filterModeActive;
    explorerEl.hidden = !shouldShowExplorer;
    if (!shouldShowExplorer) {
      closeChapterPicker({ restoreFocus: false });
    }
  }

  function closeChapterPicker(options) {
    const restoreFocus = !options || options.restoreFocus !== false;
    if (!chapterPickerEl || chapterPickerEl.hidden) {
      chapterPickerGroupId = "";
      chapterPickerReturnFocusEl = null;
      renderExplorerMenu();
      return;
    }
    chapterPickerEl.classList.remove("is-open");
    chapterPickerGroupId = "";
    renderExplorerMenu();
    if (chapterPickerHideTimer) {
      window.clearTimeout(chapterPickerHideTimer);
    }
    chapterPickerHideTimer = window.setTimeout(function () {
      chapterPickerEl.setAttribute("hidden", "");
      chapterPickerHideTimer = 0;
    }, 180);
    unlockPageScroll();
    if (
      restoreFocus &&
      chapterPickerReturnFocusEl &&
      typeof chapterPickerReturnFocusEl.focus === "function"
    ) {
      chapterPickerReturnFocusEl.focus();
    }
    chapterPickerReturnFocusEl = null;
  }

  function openChapterPicker(groupId, triggerEl) {
    if (!chapterPickerEl || !groupId) return;
    if (chapterPickerHideTimer) {
      window.clearTimeout(chapterPickerHideTimer);
      chapterPickerHideTimer = 0;
    }
    chapterPickerGroupId = groupId;
    chapterPickerReturnFocusEl = triggerEl || document.activeElement;
    renderExplorerMenu();
    chapterPickerEl.removeAttribute("hidden");
    lockPageScroll();
    window.requestAnimationFrame(function () {
      chapterPickerEl.classList.add("is-open");
      window.setTimeout(function () {
        if (chapterPickerCloseBtn) chapterPickerCloseBtn.focus();
      }, 40);
    });
  }

  function openCompareMainForRow(row) {
    if (!row) return;
    const grid = document.getElementById("compare-main-grid");
    if (!grid) return;
    translationSwapSeq += 1;
    compareMainRowId = row.row_id;
    if (greekCompareTools) greekCompareTools.clearSelection("main");
    const alandEl = document.getElementById("compare-main-aland");
    const titleEl = document.getElementById("compare-main-title");
    const secEl = document.getElementById("compare-main-sec");
    if (alandEl) {
      alandEl.textContent = "";
      alandEl.hidden = true;
    }
    if (titleEl) titleEl.textContent = getRowTitle(row);
    if (secEl) secEl.textContent = detailSectionLabelForRow(row);
    grid.dataset.filled = "0";
    grid.classList.remove("is-swapping");
    grid.innerHTML = "";
    fillCompareGrid(grid, row, "main");
  }

  refreshTranslationUI();
  renderExplorerMenu();
  syncVerseMarkerToggleButtons();

  [compareModalMarkerToggleBtn, compareMainMarkerToggleBtn].forEach(function (button) {
    if (!button) return;
    button.addEventListener("click", function () {
      setVerseMarkersEnabled(!verseMarkersEnabled);
    });
  });

  const translationPickerCloseBtn = document.getElementById("translation-picker-close");
  if (translationPickerCloseBtn) {
    translationPickerCloseBtn.addEventListener("click", function () {
      closeTranslationPicker();
      focusTranslationQuickControl();
    });
  }

  const exampleLayer = document.getElementById("beispiel");
  const exampleOpenBtn = document.getElementById("compare-home-open-example");
  const exampleCloseBtn = document.getElementById("compare-home-example-close");
  const exampleBackdrop = document.getElementById("compare-home-example-backdrop");

  function closeExampleLayer() {
    if (!exampleLayer || exampleLayer.hidden) return;
    if (greekCompareTools) greekCompareTools.clearSelection("main");
    exampleLayer.setAttribute("hidden", "");
    exampleLayer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("compare-home-example-is-open");
    try {
      if (location.hash === "#beispiel") {
        history.replaceState(null, "", location.pathname + location.search);
      }
    } catch (e) {
      /* ignore */
    }
    if (exampleOpenBtn) exampleOpenBtn.focus();
  }

  function openExampleLayer() {
    if (!exampleLayer) return;
    exampleLayer.removeAttribute("hidden");
    exampleLayer.setAttribute("aria-hidden", "false");
    document.body.classList.add("compare-home-example-is-open");
    try {
      history.replaceState(null, "", "#beispiel");
    } catch (e) {
      /* ignore */
    }
    if (exampleCloseBtn) exampleCloseBtn.focus();
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    const siteInfoDlg = document.getElementById("site-info-dialog");
    if (siteInfoDlg && siteInfoDlg.open) {
      e.preventDefault();
      if (typeof siteInfoDlg.close === "function") siteInfoDlg.close();
      return;
    }
    const infoDlg = document.getElementById("translation-info-dialog");
    if (infoDlg && infoDlg.open) {
      e.preventDefault();
      if (typeof infoDlg.close === "function") infoDlg.close();
      return;
    }
    if (translationPickerOverlay && !translationPickerOverlay.hidden) {
      e.preventDefault();
      closeTranslationPicker();
      focusTranslationQuickControl();
      return;
    }
    if (chapterPickerEl && !chapterPickerEl.hidden) {
      e.preventDefault();
      closeChapterPicker();
      return;
    }
    if (exampleLayer && !exampleLayer.hidden) {
      e.preventDefault();
      closeExampleLayer();
      return;
    }
    if (compareModal && compareModal.classList.contains("is-open")) {
      e.preventDefault();
      closeCompareModal();
    }
  });

  if (compareModalBackdrop) {
    compareModalBackdrop.addEventListener("click", closeCompareModal);
  }
  if (compareModalShareBtn) {
    compareModalShareBtn.addEventListener("click", function () {
      if (compareModalRowId === null) return;
      const row = data.find(function (entry) {
        return entry.row_id === compareModalRowId;
      });
      if (!row) return;
      sharePericopeRow(row);
    });
  }
  if (compareModalFavoriteBtn) {
    compareModalFavoriteBtn.addEventListener("click", function () {
      if (compareModalRowId === null) return;
      const row = data.find(function (entry) {
        return entry.row_id === compareModalRowId;
      });
      if (!row) return;
      toggleFavoriteAlandNo(row.aland_no);
      syncCompareModalFavoriteButton(row);
      if (listEl) filter();
    });
  }
  if (compareModalCloseBtn) {
    compareModalCloseBtn.addEventListener("click", closeCompareModal);
  }
  if (chapterPickerBackdrop) {
    chapterPickerBackdrop.addEventListener("click", function () {
      closeChapterPicker();
    });
  }
  if (chapterPickerCloseBtn) {
    chapterPickerCloseBtn.addEventListener("click", function () {
      closeChapterPicker();
    });
  }
  document.getElementById("translation-info-dialog-close").addEventListener("click", function () {
    const dlg = document.getElementById("translation-info-dialog");
    if (dlg && typeof dlg.close === "function") dlg.close();
  });

  const siteInfoDialog = document.getElementById("site-info-dialog");
  const siteInfoBtn = document.getElementById("compare-home-info-btn");
  const siteInfoClose = document.getElementById("site-info-dialog-close");
  if (siteInfoBtn && siteInfoDialog) {
    siteInfoBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (typeof siteInfoDialog.showModal === "function") siteInfoDialog.showModal();
    });
  }
  if (siteInfoClose && siteInfoDialog) {
    siteInfoClose.addEventListener("click", function () {
      if (typeof siteInfoDialog.close === "function") siteInfoDialog.close();
    });
  }

  if (isCompareHome && exampleLayer && exampleOpenBtn) {
    exampleOpenBtn.addEventListener("click", function (e) {
      e.preventDefault();
      openExampleLayer();
    });
  }
  if (exampleCloseBtn) {
    exampleCloseBtn.addEventListener("click", function () {
      closeExampleLayer();
    });
  }
  if (exampleBackdrop) {
    exampleBackdrop.addEventListener("click", function () {
      closeExampleLayer();
    });
  }
  if (isCompareHome && exampleLayer && location.hash === "#beispiel") {
    openExampleLayer();
  }
  window.addEventListener("hashchange", function () {
    if (!isCompareHome || !exampleLayer) return;
    if (location.hash === "#beispiel") openExampleLayer();
    else if (!exampleLayer.hidden) closeExampleLayer();
  });

  document.addEventListener("click", function (e) {
    const unpinBtn = e.target.closest("[data-remove-pinned-translation]");
    if (unpinBtn) {
      e.preventDefault();
      e.stopPropagation();
      removePinnedQuickTranslation(unpinBtn.getAttribute("data-remove-pinned-translation"));
      invalidateOpenPanels();
      return;
    }
    if (e.target.closest("[data-open-translation-picker]")) {
      e.preventDefault();
      openTranslationPicker();
      return;
    }
    const infoBtn = e.target.closest("button[data-translation-info]");
    if (infoBtn) {
      e.preventDefault();
      e.stopPropagation();
      openTranslationInfoDialog(infoBtn.getAttribute("data-translation-info"));
      return;
    }
    const tBtn = e.target.closest("button[data-translation]");
    if (!tBtn) return;
    if (!isCompareHome) {
      clearContextQueryParamsFromUrl();
    }
    setActiveTranslationId(tBtn.dataset.translation);
    if (!isQuickPairTranslationId(getActiveTranslationId())) {
      notePinnedTranslationChoice(getActiveTranslationId());
    }
    invalidateOpenPanels();
    if (translationPickerOverlay && !translationPickerOverlay.hidden) {
      closeTranslationPicker();
      focusTranslationQuickControl();
    }
  });

  function isCompareRowActive(r, which) {
    if (which === "main") return compareMainRowId === r.row_id;
    return compareModalRowId === r.row_id;
  }

  function triggerCompareGridReveal(grid, skipReveal) {
    if (!grid || skipReveal) return;
    grid.classList.remove("compare-grid--reveal");
    void grid.offsetWidth;
    grid.classList.add("compare-grid--reveal");
  }

  const verseMarkerMapCache = Object.create(null);

  async function fetchJsonIfExists(path) {
    try {
      const res = await fetch(path);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) {
      return null;
    }
  }

  function buildVerseMarkerMapFromJson(json) {
    const map = Object.create(null);
    if (!json || !Array.isArray(json.groups)) return null;
    json.groups.forEach(function (group) {
      const marker = group && typeof group.marker === "string" ? group.marker.trim() : "";
      const verses = group && Array.isArray(group.verses) ? group.verses : [];
      if (!marker) return;
      verses.forEach(function (verseKey) {
        if (!verseKey) return;
        map[String(verseKey)] = "compare-marker--" + marker;
      });
    });
    return Object.keys(map).length ? map : null;
  }

  async function getVerseMarkerMap(row, translationId, which) {
    if (!row) return null;
    const cacheKey = "vm:" + row.aland_no;
    if (Object.prototype.hasOwnProperty.call(verseMarkerMapCache, cacheKey)) {
      return verseMarkerMapCache[cacheKey];
    }
    const canonicalTranslationId = "elberfelder_1905";
    const translationJson = await fetchJsonIfExists(
      "/data/cross_references/" +
        encodeURIComponent(String(row.aland_no)) +
        ".json",
    );
    verseMarkerMapCache[cacheKey] = buildVerseMarkerMapFromJson(translationJson);
    return verseMarkerMapCache[cacheKey];
  }

  function applyVerseMarkers(book, html, markerMap) {
    if (!markerMap || !html) return html;
    const wrap = document.createElement("div");
    wrap.innerHTML = html;
    let markedIndex = 0;
    wrap.querySelectorAll(".verse-line").forEach(function (line) {
      const addrEl = line.querySelector(".verse-addr");
      if (!addrEl) return;
      const addr = (addrEl.textContent || "").trim().replace(/\s+/g, "");
      const parts = addr.split(",");
      if (parts.length !== 2) return;
      const verseKey = book + ":" + parts[0] + ":" + parts[1];
      const markerClass = markerMap[verseKey];
      if (!markerClass) return;

      const marker = document.createElement("span");
      marker.className = "compare-marker compare-marker--enter compare-marker--example " + markerClass;
      marker.style.setProperty(
        "--marker-delay",
        String(Math.min(markedIndex * VERSE_MARKER_ANIMATION_STEP_MS, VERSE_MARKER_ANIMATION_MAX_DELAY_MS)) + "ms",
      );
      let node = addrEl.nextSibling;
      while (node) {
        const next = node.nextSibling;
        marker.appendChild(node);
        node = next;
      }
      line.appendChild(marker);
      line.classList.add("verse-line--marked");
      markedIndex += 1;
    });
    return wrap.innerHTML;
  }

  async function fillCompareGrid(grid, r, which, options) {
    options = options || {};
    const tid = effectiveTranslationId(which);
    const useGreekEnhancedMode = !!(
      greekCompareTools &&
      tid === "greek_slb" &&
      greekCompareTools.supportsEnhancedMode(which)
    );
    syncGreekScriptClass();
    if (!grid || grid.dataset.filled === "1") return;
    grid.innerHTML =
      '<p class="compare-note">' +
      (translationIsSourceTextForId(tid) ? t("js.loadingGreek") : t("js.loadingTranslation")) +
      "</p>";

    let cache = null;
    const SC = window.SYNOPTIC_COMPARE;
    try {
      if (!useGreekEnhancedMode) {
        cache = await getVerseCache(tid);
      }
      if (!isCompareRowActive(r, which)) return;
      if ((!cache && !useGreekEnhancedMode) || !SC) {
        grid.innerHTML =
          '<p class="compare-note">' +
          (translationIsSourceTextForId(tid) ? t("js.noGreekData") : t("js.noTranslationData")) +
          "</p>";
        grid.dataset.filled = "1";
        triggerCompareGridReveal(grid, options.skipReveal);
        return;
      }

      const cacheForColumns = cache || { idx: Object.create(null), maxV: Object.create(null), aliases: Object.create(null) };
      const { idx, maxV, aliases } = cacheForColumns;
      const cols = [
        { id: "matthew", book: 40, label: getBookLabel("matthew"), cls: "mt", inKey: "in_matthew", refKey: "ref_matthew" },
        { id: "mark", book: 41, label: getBookLabel("mark"), cls: "mk", inKey: "in_mark", refKey: "ref_mark" },
        { id: "luke", book: 42, label: getBookLabel("luke"), cls: "lk", inKey: "in_luke", refKey: "ref_luke" },
        { id: "john", book: 43, label: getBookLabel("john"), cls: "jn", inKey: "in_john", refKey: "ref_john" },
      ];

      const active = cols.filter((c) => r[c.inKey]);
      if (!active.length) {
        grid.innerHTML =
          '<p class="compare-note">' + t("js.noLinkedGospelText") + "</p>";
        grid.dataset.filled = "1";
        grid.style.gridTemplateColumns = "";
        triggerCompareGridReveal(grid, options.skipReveal);
        return;
      }

      const n = active.length;
      grid.style.gridTemplateColumns = "repeat(" + n + ", minmax(0, 1fr))";

      const suppressVerseMarkers = !!(
        greekCompareTools &&
        typeof greekCompareTools.suppressesVerseMarkers === "function" &&
        greekCompareTools.suppressesVerseMarkers(which)
      );
      const markerMap = verseMarkersEnabled && !suppressVerseMarkers ? await getVerseMarkerMap(r, tid, which) : null;
      const colMeta = compareColumnMetaHtmlForTranslation(tid);
      const columnHtml = await Promise.all(
        active.map(async function (c) {
          const ref = r[c.refKey] || "";
          const renderedBody =
            useGreekEnhancedMode
              ? await greekCompareTools.renderColumnHtml({
                  which: which,
                  book: c.book,
                  label: c.label,
                  ref: ref,
                  cache: { idx: idx, maxV: maxV, aliases: aliases },
                })
              : SC.renderColumnHtml(c.book, c.label, ref, idx, maxV, aliases);
          const body = applyVerseMarkers(c.book, renderedBody, markerMap);
          const contextLink = renderCompareContextLink(c.id, ref, tid);
          return `<div class="text-col ${c.cls}"><h4>${c.label}<span class="ref-tag">${escapeHtml(ref)}</span></h4>${colMeta}<div class="text-col-body">${body}</div>${contextLink}</div>`;
        }),
      );
      if (!isCompareRowActive(r, which)) return;
      grid.innerHTML = columnHtml.join("");
      grid.dataset.filled = "1";
      if (greekCompareTools) greekCompareTools.syncPanel(which);
      triggerCompareGridReveal(grid, options.skipReveal);
    } catch (err) {
      if (!isCompareRowActive(r, which)) return;
      const detail = err && err.message ? " " + err.message : "";
      grid.innerHTML =
        '<p class="compare-note">' +
        (translationIsSourceTextForId(tid)
          ? t("js.greekLoadFailed")
          : t("js.translationLoadFailed")) +
        escapeHtml(detail) +
        "</p>";
      grid.dataset.filled = "1";
      triggerCompareGridReveal(grid, options.skipReveal);
    }
  }

  function refillCompareGrid(which, options) {
    options = options || {};
    const gridId = which === "modal" ? "compare-modal-grid" : "compare-main-grid";
    const rowId = which === "modal" ? compareModalRowId : compareMainRowId;
    const grid = document.getElementById(gridId);
    if (!grid || rowId === null) return;
    const seq = (translationSwapSeq += 1);
    if (!options.skipSwap) grid.classList.add("is-swapping");
    window.setTimeout(function () {
      if (seq !== translationSwapSeq) return;
      const modalOk =
        which === "modal" &&
        compareModal &&
        compareModal.classList.contains("is-open") &&
        compareModalRowId !== null;
      const mainOk = which === "main" && compareMainRowId !== null;
      if (which === "modal" && !modalOk) {
        grid.classList.remove("is-swapping");
        return;
      }
      if (which === "main" && !mainOk) {
        grid.classList.remove("is-swapping");
        return;
      }
      grid.dataset.filled = "0";
      grid.innerHTML = "";
      const row = data.find(function (x) {
        return x.row_id === rowId;
      });
      if (!row) {
        grid.classList.remove("is-swapping");
        return;
      }
      fillCompareGrid(grid, row, which, options)
        .then(function () {
          if (seq !== translationSwapSeq) return;
          grid.classList.remove("is-swapping");
        })
        .catch(function () {
          grid.classList.remove("is-swapping");
        });
    }, options.skipSwap ? 0 : 140);
  }

  function invalidateOpenPanels(options) {
    options = options || {};
    refreshQuickStripOnly();
    syncTranslationButtons();
    if (listEl && hasSpecificVerseQuery(activeSearchChapterQuery)) {
      filter();
    }
    if (compareModal && compareModal.classList.contains("is-open") && compareModalRowId !== null) {
      refillCompareGrid("modal", options);
    }
    if (compareMainRowId !== null) {
      refillCompareGrid("main", options);
    }
  }

  function triggerListReveal() {
    if (!listEl) return;
    listEl.classList.remove("list--reveal");
    void listEl.offsetWidth;
    listEl.classList.add("list--reveal");
  }

  function pulseCountLine() {
    const el = document.getElementById("count");
    if (!el) return;
    el.classList.remove("count--pulse");
    void el.offsetWidth;
    el.classList.add("count--pulse");
    el.addEventListener(
      "animationend",
      function onEnd() {
        el.classList.remove("count--pulse");
        el.removeEventListener("animationend", onEnd);
      },
      { once: true },
    );
  }

  function setDirectGospelMode(active) {
    document.body.classList.toggle("is-direct-gospel-mode", !!active);
  }

  function renderRow(r, options) {
    options = options || {};
    const title = escapeHtml(getRowTitle(r));
    const verseQuery = options.verseQuery || null;
    const verseSnippet = hasSpecificVerseQuery(verseQuery)
      ? renderMatchedVerseSnippet(r, verseQuery, options.verseCache || null)
      : "";
    const matchedBookId = verseQuery && verseQuery.book ? verseQuery.book : "";
    return `
      <section class="row-wrap" data-row-id="${r.row_id}" data-aland-no="${r.aland_no}">
        <div class="row row-head" tabindex="0" role="button" aria-label="${escapeAttr(t("js.openCompareAria"))}">
          <div class="row-main">
            <h2>${title}</h2>
            ${verseSnippet}
          </div>
          <div class="row-actions">
            <div class="gospels">
              ${pill("mt", "Mt", r.in_matthew, r.bold_matthew, r.ref_matthew, { isMatch: matchedBookId === "matthew" && r.in_matthew })}
              ${pill("mk", "Mk", r.in_mark, r.bold_mark, r.ref_mark, { isMatch: matchedBookId === "mark" && r.in_mark })}
              ${pill("lk", "Lk", r.in_luke, r.bold_luke, r.ref_luke, { isMatch: matchedBookId === "luke" && r.in_luke })}
              ${pill("jn", "Jn", r.in_john, r.bold_john, r.ref_john, { isMatch: matchedBookId === "john" && r.in_john })}
            </div>
            <span class="chev" aria-hidden="true">↗</span>
          </div>
        </div>
      </section>`;
  }

  function filter() {
    if (!listEl) return;
    const requestSeq = ++filterRequestSeq;
    const qEl = document.getElementById("q");
    const qRaw = qEl && qEl.value ? qEl.value : "";
    const q = normalizeSearchToken(qRaw);
    const searchAssistState = getSearchAssistState(qRaw);
    const directGospelQuery = getDirectGospelQuery(searchAssistState, q);
    if (!directGospelQuery || !directGospelQuery.verse) {
      directGospelTargetScrollRequested = false;
    }
    activeSearchChapterQuery =
      !directGospelQuery && searchAssistState && searchAssistState.mode === "chapters" && searchAssistState.selectedChapter
        ? {
            book: searchAssistState.book.id,
            chapter: searchAssistState.selectedChapter,
            verse: searchAssistState.selectedVerse || null,
          }
        : null;
    renderSearchAssist(searchAssistState);
    const sec = activeSection;
    const explorerTopic = explorerTopicById.get(explorerActiveTopicId) || null;
    const verseQuery = activeSearchChapterQuery;
    const specificVerseQuery = hasSpecificVerseQuery(verseQuery) ? verseQuery : null;
    const textQuery = verseQuery ? "" : q;
    const hasDefaultState = !textQuery && !sec && !explorerTopic && activePreset === "all" && !verseQuery;
    const filterModeActive = hasOpenFilterPanel();
    const listTranslationId = effectiveTranslationId("main");
    const verseSnippetCache =
      specificVerseQuery && searchVerseTextTranslationId === listTranslationId ? searchVerseTextCache : null;

    if (specificVerseQuery && listTranslationId && (!verseSnippetCache || searchVerseTextTranslationId !== listTranslationId)) {
      ensureSearchVerseTextCache(listTranslationId);
    }

    syncExplorerVisibility();
    syncFilterVisibility();

    updateSectionListHeading();

    if (directGospelQuery) {
      setDirectGospelMode(true);
      scrollListToFirst = false;
      renderDirectGospelSearch(directGospelQuery, listTranslationId, requestSeq);
      return;
    }

    setDirectGospelMode(false);

    if (hasDefaultState) {
      const favoriteRows = getFavoriteRows();
      const starterRows = getStarterRows();
      const countEl = document.getElementById("count");
      if (countEl) {
        countEl.textContent = filterModeActive
          ? t("js.chooseFilterOrSearch")
          : favoriteRows.length
            ? t("js.yourBookmarks")
            : "";
      }
      if (filterModeActive) {
        listEl.innerHTML = renderFilterLanding();
      } else if (searchAssistState && searchAssistState.mode === "chapters" && !verseQuery) {
        listEl.innerHTML = '<div class="empty">' + t("js.chooseChapterToSeeEvents") + "</div>";
      } else if (favoriteRows.length) {
        listEl.innerHTML = favoriteRows.map(function (row) {
          return renderRow(row, { verseQuery: verseQuery, verseCache: verseSnippetCache });
        }).join("");
      } else {
        listEl.innerHTML =
          renderStarterLanding() +
          starterRows
            .map(function (row) {
              return renderRow(row, { verseQuery: verseQuery, verseCache: verseSnippetCache });
            })
            .join("");
      }
      scrollListToFirst = false;
      triggerListReveal();
      syncListFabs();
      return;
    }

    const out = data.filter((r) => {
      if (!matchesPreset(r, activePreset)) return false;
      if (sec && r.section !== sec) return false;
      if (explorerTopic && !explorerTopic.matcher(r)) return false;
      if (verseQuery && !rowMatchesVerseQuery(r, verseQuery)) return false;
      if (searchAssistState && searchAssistState.mode === "chapters" && !verseQuery) return false;
      if (!textQuery) return true;
      const hay = normalizeSearchToken(
        [
          r.title,
          r.title_de,
          r.section,
          r.section_de,
          getRowTitle(r),
          getRowSection(r),
          r.ref_matthew,
          r.ref_mark,
          r.ref_luke,
          r.ref_john,
          String(r.aland_no),
        ].join(" "),
      );
      return hay.includes(textQuery);
    });
    
    const visibleOut = textQuery || verseQuery ? dedupeSearchRowsByReferences(out) : out;

    const countEl = document.getElementById("count");
    if (countEl) {
      if (searchAssistState && searchAssistState.mode === "chapters" && !verseQuery) {
        countEl.textContent = t("js.chooseChapter");
      } else {
        countEl.textContent =
          t("js.countLines", { count: visibleOut.length, total: n }) +
          (verseQuery
            ? t("js.chapterActiveSuffix")
            : activePreset !== "all" || explorerTopic
              ? t("js.filterActiveSuffix")
              : "");
      }
    }
    pulseCountLine();

    if (!visibleOut.length) {
      listEl.innerHTML = searchAssistState && searchAssistState.mode === "chapters" && !verseQuery
        ? '<div class="empty">' + t("js.chooseChapterToSeeEvents") + "</div>"
        : verseQuery
          ? '<div class="empty">' + (hasSpecificVerseQuery(verseQuery) ? t("js.noResults") : t("js.noEventForChapter")) + "</div>"
          : '<div class="empty">' + t("js.noResults") + "</div>";
      scrollListToFirst = false;
      triggerListReveal();
      syncListFabs();
      return;
    }
    listEl.innerHTML = visibleOut
      .map(function (row) {
        return renderRow(row, { verseQuery: verseQuery, verseCache: verseSnippetCache });
      })
      .join("");
    triggerListReveal();
    if (scrollListToFirst && visibleOut.length) {
      scrollListToFirst = false;
      const heading = document.getElementById("section-list-heading");
      const firstRow = listEl.querySelector(".row-wrap");
      const scrollTarget =
        heading && !heading.hidden ? heading : firstRow;
      if (scrollTarget) {
        window.requestAnimationFrame(function () {
          scrollTarget.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }
    syncListFabs();
  }

  if (listEl) {
    listEl.addEventListener("click", (e) => {
      const synopsisLink = e.target.closest(".gospel-search-event__link[data-aland-no]");
      if (synopsisLink) {
        const isModifiedClick = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
        if (isModifiedClick) return;
        const alandNo = parseInt(synopsisLink.getAttribute("data-aland-no") || "", 10);
        const row = Number.isNaN(alandNo) ? null : rowByAlandNo.get(alandNo);
        if (!row) return;
        e.preventDefault();
        openCompareModalForRow(row, synopsisLink);
        return;
      }

      const head = e.target.closest(".row-head");
      if (!head) return;
      const wrap = head.closest(".row-wrap");
      if (!wrap) return;
      openCompareModal(wrap);
    });

    listEl.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const head = e.target.closest(".row-head");
      if (!head) return;
      e.preventDefault();
      const wrap = head.closest(".row-wrap");
      if (wrap) openCompareModal(wrap);
    });
  }

  const qInput = document.getElementById("q");
  if (qInput) {
    const mobileSearchPlaceholder = qInput.getAttribute("data-placeholder-mobile") || "";
    const desktopSearchPlaceholder = qInput.getAttribute("data-placeholder-desktop") || qInput.placeholder || "";
    const placeholderMedia = window.matchMedia("(max-width: 720px)");

    function syncSearchPlaceholder() {
      qInput.placeholder = placeholderMedia.matches ? mobileSearchPlaceholder : desktopSearchPlaceholder;
    }

    syncSearchPlaceholder();
    if (typeof placeholderMedia.addEventListener === "function") {
      placeholderMedia.addEventListener("change", syncSearchPlaceholder);
    } else if (typeof placeholderMedia.addListener === "function") {
      placeholderMedia.addListener(syncSearchPlaceholder);
    }

    qInput.addEventListener("input", function () {
      clearContextQueryParamsFromUrl();
      clearPericopeDeepLinkWithoutFiltering();
      clearExplorerSelectionWithoutFiltering();
      clearVerseQueryWithoutFiltering();
      filter();
    });
    qInput.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      directGospelTargetScrollRequested = true;
      filter();
    });
    qInput.addEventListener("focus", function () {
      clearContextQueryParamsFromUrl();
      clearPericopeDeepLinkWithoutFiltering();
      clearExplorerSelectionWithoutFiltering();
      clearVerseQueryWithoutFiltering();
      activePreset = "all";
      syncPresetButtonActiveState();
      activeSection = "";
      document.querySelectorAll(".filter-acc-panel").forEach(function (panel) {
        panel.open = false;
      });
      filter();
    });
  }

  if (searchAssistEl && qInput) {
    searchAssistEl.addEventListener("click", function (e) {
      const chapterBtn = e.target.closest("[data-search-assist-chapter]");
      if (chapterBtn) {
        clearContextQueryParamsFromUrl();
        const bookId = chapterBtn.getAttribute("data-search-assist-book") || "";
        const chapter = chapterBtn.getAttribute("data-search-assist-chapter") || "";
        const book = getVerseSearchBooks()[bookId];
        if (!book || !chapter) return;
        qInput.value = book.label + " " + chapter;
        filter();
        qInput.blur();
        return;
      }
      const bookBtn = e.target.closest("[data-search-assist-book]");
      if (!bookBtn) return;
      clearContextQueryParamsFromUrl();
      const bookId = bookBtn.getAttribute("data-search-assist-book") || "";
      const book = getVerseSearchBooks()[bookId];
      if (!book) return;
      qInput.value = book.label + " ";
      filter();
      qInput.focus();
    });
  }

  if (explorerChapterEl) {
    explorerChapterEl.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-explorer-group]");
      if (!btn) return;
      clearContextQueryParamsFromUrl();
      clearPericopeDeepLinkWithoutFiltering();
      clearVerseQueryWithoutFiltering();
      const nextGroupId = btn.dataset.explorerGroup || "";
      openChapterPicker(nextGroupId, btn);
    });
  }

  if (chapterPickerItemsEl) {
    chapterPickerItemsEl.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-explorer-topic]");
      if (!btn) return;
      clearContextQueryParamsFromUrl();
      clearPericopeDeepLinkWithoutFiltering();
      clearVerseQueryWithoutFiltering();
      clearStandardFiltersWithoutFiltering();
      explorerActiveTopicId = btn.dataset.explorerTopic || "";
      const topic = explorerTopicById.get(explorerActiveTopicId);
      explorerActiveGroupId = topic ? topic.groupId : "";
      chapterPickerGroupId = explorerActiveGroupId;
      renderExplorerMenu();
      closeChapterPicker({ restoreFocus: false });
      filter();
      const heading = document.getElementById("section-list-heading");
      const firstRow = listEl ? listEl.querySelector(".row-wrap") : null;
      const scrollTarget = heading && !heading.hidden ? heading : firstRow;
      if (scrollTarget) {
        window.requestAnimationFrame(function () {
          scrollTarget.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    });
  }

  if (presetEl) {
    presetEl.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-preset]");
      if (!b) return;
      clearContextQueryParamsFromUrl();
      clearPericopeDeepLinkWithoutFiltering();
      clearExplorerSelectionWithoutFiltering();
      clearVerseQueryWithoutFiltering();
      activePreset = b.dataset.preset;
      syncPresetButtonActiveState();
      filter();
    });
  }

  const DEFAULT_ALAND_NO = 18;
  if (listEl) {
    try {
      if (consumeDirectGospelScrollHash()) {
        directGospelTargetScrollRequested = true;
      }
      const params = new URLSearchParams(window.location.search);
      const rawQuery = params.get("q");
      if (qInput && rawQuery != null) {
        qInput.value = rawQuery;
      }
      let handledPericope = false;
      const rawPericope = params.get("p");
      if (rawPericope != null && rawPericope !== "") {
        const pericopeNo = parseInt(rawPericope, 10);
        if (!Number.isNaN(pericopeNo) && rowByAlandNo.has(pericopeNo)) {
          deepLinkedAlandNo = pericopeNo;
          pendingPericopeOpenAlandNo = pericopeNo;
          activePreset = "all";
          syncPresetButtonActiveState();
          handledPericope = true;
        }
      }
      if (!handledPericope) {
        const secFromUrl = params.get("section");
        if (secFromUrl && sectionsOrdered.includes(secFromUrl)) {
          activeSection = secFromUrl;
          activePreset = "all";
          syncPresetButtonActiveState();
          scrollListToFirst = true;
        }
      }
    } catch (e) {
      /* ignore */
    }
    filter();
    if (pendingPericopeOpenAlandNo) {
      window.requestAnimationFrame(function () {
        const row = rowByAlandNo.get(pendingPericopeOpenAlandNo) || null;
        if (row) openCompareModalForRow(row, null);
        pendingPericopeOpenAlandNo = 0;
      });
    } else if (qInput) {
      window.requestAnimationFrame(function () {
        qInput.focus({ preventScroll: true });
      });
    }
  }

  if (listEl) {
    const scrollTopFab = document.getElementById("scroll-top-fab");
    window.addEventListener("scroll", syncListFabs, { passive: true });
    syncListFabs();
    if (scrollTopFab) {
      scrollTopFab.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  if (isCompareHome) {
    let aland = DEFAULT_ALAND_NO;
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get("aland");
      if (raw != null && raw !== "") {
        const n = parseInt(raw, 10);
        if (!Number.isNaN(n)) aland = n;
      }
    } catch (e) {
      /* ignore */
    }
    let row = data.find(function (r) {
      return r.aland_no === aland;
    });
    if (!row) {
      row = data.find(function (r) {
        return r.aland_no === DEFAULT_ALAND_NO;
      });
    }
    if (row) openCompareMainForRow(row);
  }

  getVerseCache(isCompareHome ? getHomeDemoTranslationId() : getActiveTranslationId()).catch(function () {
    // Erstes Laden kann bei lokalen file://-Setups scheitern; wir zeigen den Fehler erst im Panel.
  });
})();

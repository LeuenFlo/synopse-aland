/**
 * Elberfelder 1905: Index + Parsing der Aland-Referenzstrings (Kapitel.Vers).
 * Buch-Codes: 40 Mt, 41 Mk, 42 Lk, 43 Joh (wie in elberfelder_1905.json).
 */
(function () {
  const BOOK = { mt: 40, mk: 41, lk: 42, jn: 43 };
  const NAME_TO_BOOK = {
    matthew: 40,
    matthaeus: 40,
    matthaus: 40,
    matthäus: 40,
    matteo: 40,
    mark: 41,
    markus: 41,
    marco: 41,
    luke: 42,
    lukas: 42,
    luca: 42,
    john: 43,
    johannes: 43,
    giovanni: 43,
  };

  function normalizeBookName(name) {
    return String(name || "")
      .trim()
      .toLowerCase()
      .replace(/[.]/g, "")
      .replace(/\s+/g, " ");
  }

  function guessBookByNameOrIndex(bookName, fallbackIndex) {
    const n = normalizeBookName(bookName);
    if (n) {
      for (const [k, v] of Object.entries(NAME_TO_BOOK)) {
        if (n === k || n.startsWith(k + " ")) return v;
      }
      return null;
    }
    // Nur wenn der Datensatz keine Buchnamen hat (reine NT-Reihenfolge Mt–Joh)
    if (fallbackIndex >= 0 && fallbackIndex <= 3) return 40 + fallbackIndex;
    return null;
  }

  function normalizeTranslationData(raw) {
    if (raw == null) return [];
    if (typeof raw === "object" && !Array.isArray(raw)) {
      if (Array.isArray(raw.verses)) {
        raw = raw.verses;
      } else if (Array.isArray(raw.books)) {
        raw = raw.books;
      }
    }
    if (!Array.isArray(raw) || !raw.length) return [];
    const first = raw[0] || {};

    // Strukturtyp A: Flat Verse List
    if (
      Object.prototype.hasOwnProperty.call(first, "book") &&
      Object.prototype.hasOwnProperty.call(first, "chapter") &&
      Object.prototype.hasOwnProperty.call(first, "verse") &&
      Object.prototype.hasOwnProperty.call(first, "text")
    ) {
      return raw
        .map(function (r) {
          return {
            book_name: r.book_name || "",
            book: +r.book,
            chapter: +r.chapter,
            verse: +r.verse,
            text: r.text == null ? "" : String(r.text),
          };
        })
        .filter(function (r) {
          return Number.isFinite(r.book) && Number.isFinite(r.chapter) && Number.isFinite(r.verse);
        });
    }

    // Strukturtyp B: Nested Book > Chapters > Verses
    if (Object.prototype.hasOwnProperty.call(first, "chapters")) {
      const out = [];
      for (let bi = 0; bi < raw.length; bi++) {
        const bookObj = raw[bi] || {};
        const bookNo = guessBookByNameOrIndex(bookObj.name, bi);
        if (!bookNo) continue;
        const chapters = Array.isArray(bookObj.chapters) ? bookObj.chapters : [];
        for (let ci = 0; ci < chapters.length; ci++) {
          const chObj = chapters[ci] || {};
          const chNo = +chObj.chapter || ci + 1;
          const verses = Array.isArray(chObj.verses) ? chObj.verses : [];
          for (let vi = 0; vi < verses.length; vi++) {
            const vObj = verses[vi] || {};
            const vNo = +vObj.verse || vi + 1;
            if (!Number.isFinite(chNo) || !Number.isFinite(vNo)) continue;
            out.push({
              book_name: bookObj.name || "",
              book: bookNo,
              chapter: chNo,
              verse: vNo,
              text: vObj.text == null ? "" : String(vObj.text),
            });
          }
        }
      }
      return out;
    }

    return [];
  }

  function buildVerseIndex(elb) {
    const idx = Object.create(null);
    const maxV = Object.create(null);
    const aliasSets = {
      40: new Set([40]),
      41: new Set([41]),
      42: new Set([42]),
      43: new Set([43]),
    };
    for (let i = 0; i < elb.length; i++) {
      const r = elb[i];
      const k = r.book + ":" + r.chapter + ":" + r.verse;
      idx[k] = r.text;
      const mk = r.book + ":" + r.chapter;
      maxV[mk] = Math.max(maxV[mk] || 0, r.verse);
      const canonical = guessBookByNameOrIndex(r.book_name, -1);
      if (canonical && aliasSets[canonical]) aliasSets[canonical].add(+r.book);
    }
    const aliases = {
      40: Array.from(aliasSets[40]),
      41: Array.from(aliasSets[41]),
      42: Array.from(aliasSets[42]),
      43: Array.from(aliasSets[43]),
    };
    return { idx, maxV, aliases };
  }

  function normalizeRef(ref) {
    if (!ref || typeof ref !== "string") return "";
    return ref
      .replace(/(\d+)\.\s+/g, "$1.")
      .replace(/\s+/g, " ")
      .trim();
  }

  /** "16.1-2a,4" → "16.1-2a 16.4" */
  function expandCommaBareVerses(s) {
    if (!s.includes(",")) return s;
    const parts = s.split(",").map((x) => x.trim()).filter(Boolean);
    let lastCh = null;
    const out = [];
    for (const p of parts) {
      const m = p.match(/^(\d+)\./);
      if (m) lastCh = +m[1];
      if (/^\d+$/.test(p) && lastCh !== null) out.push(lastCh + "." + p);
      else out.push(p);
    }
    return out.join(" ");
  }

  function expandCrossChapter(c1, v1, c2, v2, book, maxV) {
    const res = [];
    let ch = c1;
    let v = v1;
    for (let guard = 0; guard < 5000; guard++) {
      res.push([ch, v]);
      if (ch === c2 && v === v2) break;
      const mx = maxV[book + ":" + ch] || 176;
      if (v < mx) v++;
      else {
        ch++;
        v = 1;
      }
      if (ch > c2 || (ch === c2 && v > v2)) break;
    }
    return res;
  }

  function stripRefLetters(seg) {
    return seg
      .replace(/(\d+)([a-z])(?=-)/gi, "$1")
      .replace(/(\d+)([a-z])$/gi, "$1");
  }

  function parseOneSegment(seg, book, maxV) {
    seg = seg.replace(/^[\s,]+|[\s,]+$/g, "");
    if (!seg) return [];
    seg = stripRefLetters(seg);

    const cross = seg.match(/^(\d+)\.(\d+)-(\d+)\.(\d+)$/);
    if (cross) {
      return expandCrossChapter(
        +cross[1],
        +cross[2],
        +cross[3],
        +cross[4],
        book,
        maxV,
      );
    }

    const same = seg.match(/^(\d+)\.(\d+)-(\d+)$/);
    if (same) {
      const c = +same[1];
      const a = +same[2];
      const b = +same[3];
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      const out = [];
      for (let v = lo; v <= hi; v++) out.push([c, v]);
      return out;
    }

    const single = seg.match(/^(\d+)\.(\d+)$/);
    if (single) return [[+single[1], +single[2]]];

    return [];
  }

  /**
   * @returns {{ ok: boolean, verses?: [number,number][], note?: string }}
   */
  function expandRefToVerses(ref, book, maxV) {
    const raw = normalizeRef(ref);
    if (!raw) return { ok: true, verses: [] };
    if (/see\s+note/i.test(raw) || /1\s*cor/i.test(raw)) {
      return { ok: false, note: "kein Evangelientext (Hinweis / anderer Text)" };
    }

    const expanded = expandCommaBareVerses(raw);
    const tokens = expanded.split(/\s+/).filter(Boolean);
    const verses = [];
    for (const t of tokens) {
      verses.push(...parseOneSegment(t, book, maxV));
    }

    const key = (a, b) => a[0] * 1000 + a[1] - (b[0] * 1000 + b[1]);
    verses.sort(key);
    const seen = new Set();
    const uniq = [];
    for (const p of verses) {
      const s = p[0] + ":" + p[1];
      if (seen.has(s)) continue;
      seen.add(s);
      uniq.push(p);
    }
    return { ok: true, verses: uniq };
  }

  function lookupVerses(book, versePairs, idx, aliases) {
    const books = (aliases && aliases[book] && aliases[book].length)
      ? aliases[book]
      : [book];
    const blocks = [];
    for (const [ch, v] of versePairs) {
      let text = null;
      for (let i = 0; i < books.length; i++) {
        const k = books[i] + ":" + ch + ":" + v;
        if (idx[k] != null) {
          text = idx[k];
          break;
        }
      }
      blocks.push({
        ch,
        v,
        text: text,
      });
    }
    return blocks;
  }

  function escHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function renderColumnHtml(book, label, ref, idx, maxV, aliases) {

    const ex = expandRefToVerses(ref, book, maxV);
    if (!ex.ok) {
      return '<p class="compare-note">' + escHtml(ex.note || "") + "</p>";
    }
    if (!ex.verses.length) {
      return '<p class="compare-note">Keine Versangaben.</p>';
    }
    const blocks = lookupVerses(book, ex.verses, idx, aliases);
    return blocks
      .map(function (b) {
        const addr = b.ch + "," + b.v;
        const t =
          b.text != null
            ? escHtml(b.text)
            : '<em class="missing">[Vers nicht in der Datei]</em>';
        return (
          '<p class="verse-line"><span class="verse-addr">' +
          escHtml(addr) +
          "</span> " +
          t +
          "</p>"
        );
      })
      .join("");
  }

  window.SYNOPTIC_COMPARE = {
    BOOK: BOOK,
    buildVerseIndex: buildVerseIndex,
    normalizeRef: normalizeRef,
    expandRefToVerses: expandRefToVerses,
    renderColumnHtml: renderColumnHtml,
    normalizeTranslationData: normalizeTranslationData,
    initFromTranslationData: function (raw) {
      const normalized = normalizeTranslationData(raw);
      const { idx, maxV, aliases } = buildVerseIndex(normalized);
      return { idx: idx, maxV: maxV, aliases: aliases };
    },
    initFromElberfelder: function (elb) {
      const { idx, maxV, aliases } = buildVerseIndex(normalizeTranslationData(elb));
      return { idx: idx, maxV: maxV, aliases: aliases };
    },
  };
})();

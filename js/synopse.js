(function () {
  const data = window.PARALLELS_DATA;
  if (!Array.isArray(data) || !data.length) {
    document.getElementById("list").innerHTML =
      '<div class="empty">Keine Daten — <code>data/parallels_data.js</code> fehlt oder enthält keine Einträge.</div>';
    return;
  }

  function tripleSyn(r) {
    return r.in_matthew && r.in_mark && r.in_luke;
  }

  function qStyle(r) {
    return r.in_matthew && r.in_luke && !r.in_mark;
  }

  const n = data.length;

  const sections = [...new Set(data.map((r) => r.section))].filter(Boolean);
  const sel = document.getElementById("section");
  sel.innerHTML =
    '<option value="">Alle Abschnitte</option>' +
    sections
      .map((s) => {
        const sample = data.find((r) => r.section === s);
        const label = sample && sample.section_de ? sample.section_de : s;
        return `<option value="${escapeAttr(s)}">${escapeHtml(label)}</option>`;
      })
      .join("");

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

  const presetGroups = [
    {
      label: "Allgemein",
      presets: [{ id: "all", label: "Alle" }],
    },
    {
      label: "Vorkommen",
      presets: [
        {
          id: "has_mt",
          label: "Mit Mt",
          title: "Matthäus kommt in dieser Perikope vor",
        },
        {
          id: "has_mk",
          label: "Mit Mk",
          title: "Markus kommt in dieser Perikope vor",
        },
        {
          id: "has_lk",
          label: "Mit Lk",
          title: "Lukas kommt in dieser Perikope vor",
        },
        {
          id: "has_jn",
          label: "Mit Jn",
          title: "Johannes kommt in dieser Perikope vor",
        },
      ],
    },
    {
      label: "Muster",
      presets: [
        { id: "triple", label: "Triple (Mt+Mk+Lk)" },
        { id: "q", label: "Q‑Kandidat" },
        { id: "syn_only", label: "Nur Synoptiker (ohne Jn)" },
      ],
    },
    {
      label: "Sondergut",
      presets: [
        {
          id: "sg_mt",
          label: "Sondergut Mt",
          title: "Nur Matthäus unter den drei Synoptikern (nicht in Mk/Lk)",
        },
        {
          id: "sg_mk",
          label: "Sondergut Mk",
          title: "Nur Markus unter den drei Synoptikern (nicht in Mt/Lk)",
        },
        {
          id: "sg_lk",
          label: "Sondergut Lk",
          title: "Nur Lukas unter den drei Synoptikern (nicht in Mt/Mk)",
        },
        {
          id: "sg_jn",
          label: "Sondergut Joh",
          title: "Nur Johannes (keine der drei Synoptiker-Spalten)",
        },
      ],
    },
  ],
    presetEl = document.getElementById("presets");
  let activePreset = "all";

  function presetButtonHtml(p) {
    const tip = p.title ? ` title="${escapeAttr(p.title)}"` : "";
    return `<button type="button" data-preset="${p.id}" class="${
      p.id === "all" ? "active" : ""
    }"${tip}>${p.label}</button>`;
  }

  presetEl.innerHTML = presetGroups
    .map(
      (g) =>
        `<div class="preset-group"><span class="preset-group-label">${escapeHtml(
          g.label,
        )}</span><div class="preset">${g.presets.map(presetButtonHtml).join("")}</div></div>`,
    )
    .join("");

  function escapeHtml(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function escapeAttr(s) {
    return s.replace(/"/g, "&quot;");
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

  function pill(cls, label, on, bold, ref) {
    const r = ref ? `<span class="ref">${escapeHtml(ref)}</span>` : "";
    return `<span class="pill ${cls} ${on ? "on" : ""} ${on && bold ? "bold" : ""}">${label}${r}</span>`;
  }

  const TRANSLATION_LANG_ORDER = [
    { key: "de", label: "Deutsch" },
    { key: "en", label: "Englisch" },
    { key: "fr", label: "Französisch" },
    { key: "it", label: "Italienisch" },
    { key: "es", label: "Spanisch" },
    { key: "la", label: "Latein" },
    { key: "el", label: "Griechisch · Urtext" },
  ];

  /** Immer sichtbar; alle übrigen Sprachen unter „Weitere Sprachen“. */
  const PRIMARY_LANG_KEYS = ["de", "el"];

  const TRANSLATIONS = [
    {
      id: "menge",
      lang: "de",
      label: "Menge 1939",
      path: "data/translations/german/menge.json",
      info:
        "Hermann Menge erarbeitete diese Übersetzung bewusst nahe an der Lutherbibel; das Neue Testament erschien 1931, die vollständige Bibel mit Alten Testament folgte 1939 — die Jahreszahl im Namen bezieht sich auf diesen Gesamtstand vor dem Zweiten Weltkrieg. Die Menge-Bibel war im deutschsprachigen Raum eine weit verbreitete Alternative zu Luther und Elberfelder.",
      infoUrl: "https://de.wikipedia.org/wiki/Hermann_Menge",
    },
    {
      id: "offene_bibel_studienausgabe",
      lang: "de",
      label: "Offene Bibel (Studienausgabe)",
      path: "data/translations/german/offene_bibel_studienausgabe.json",
      info:
        "Die Offene Bibel ist ein gemeinschaftliches deutschsprachiges Übersetzungsprojekt; die Studienausgabe verbindet einen verständlichen Wortlaut mit Hinweisen zur Textgestalt. Der Text eignet sich für Vergleiche mit älteren und wörtlicheren deutschen Bibeln.",
      infoUrl: "https://de.wikipedia.org/wiki/Offene_Bibel",
    },
    {
      id: "elberfelder_1905",
      lang: "de",
      label: "Elberfelder 1905",
      path: "data/translations/german/elberfelder_1905.json",
      info:
        "Die Elberfelder Übersetzung entstand im pietistischen Umfeld und strebt eine möglichst wörtliche Wiedergabe des hebräischen und griechischen Urtextes an. Die hier verwendete Fassung von 1905 gehört zu den klassischen, älteren Elberfelder-Texten vor den späteren großen Revisionen (ab 1961 bzw. 1985); Sprache und Schreibung sind damit typisch für die Bibeldrucke des frühen 20. Jahrhunderts.",
      infoUrl: "https://de.wikipedia.org/wiki/Elberfelder_Bibel",
    },
    {
      id: "luther_1912",
      lang: "de",
      label: "Luther 1912",
      path: "data/translations/german/luther_1912.json",
      info:
        "Die Lutherbibel von 1912 ist eine Revision der Übersetzung Martin Luthers (Grundlage 1545) und war im deutschsprachigen Protestantismus lange eine verbreitete Standardfassung, bevor neuere Gesamtausgaben und Überarbeitungen (z. B. 1984, 2017) folgten. Sie bewahrt die vertraute Luther-Sprache, angepasst an Orthographie und Wortgebrauch des ausgehenden Kaiserreichs und der Weimarer Zeit.",
      infoUrl: "https://de.wikipedia.org/wiki/Lutherbibel",
    },
    {
      id: "schlachter",
      lang: "de",
      label: "Schlachter 1951",
      path: "data/translations/german/schlachter.json",
      info:
        "Die Schlachter-Bibel geht auf Franz Eugen Schlachter zurück; die Revision von 1951 aktualisierte die Sprache gegenüber der Erstfassung von 1905 und prägte in vielen Freikirchen die Bibellektüre der zweiten Hälfte des 20. Jahrhunderts. Für Vergleiche eignet sie sich als markanter Vertreter evangelikaler Bibeltradition jener Zeit.",
      infoUrl: "https://de.wikipedia.org/wiki/Schlachter-Bibel",
    },
    {
      id: "zurcher_1931",
      lang: "de",
      label: "Zürcher 1931",
      path: "data/translations/german/zurcher_1931.json",
      info:
        "Die Zürcher Bibel steht in der reformierten Übersetzungstradition (Zwingli-Bibel). Die Ausgabe von 1931 repräsentiert die Zwischenkriegszeit: klare, damals moderne Sprache und die für die Schweiz typische Bibelfassung vor den späteren Überarbeitungen. Sie ist ein guter Bezugspunkt für historischen Sprachduktus der 1930er-Jahre.",
      infoUrl: "https://de.wikipedia.org/wiki/Zürcher_Bibel",
    },
    {
      id: "greek_slb",
      lang: "el",
      label: "SBL Greek NT",
      path: "data/translations/greek/greek_slb.json",
      info:
        "Das SBL Greek New Testament (SBLGNT) ist eine kritisch edierte Ausgabe des griechischen Neuen Testaments; die erste Ausgabe erschien 2010 (Society of Biblical Literature). Der Text steht frei in elektronischer Form zur Verfügung und richtet sich an Studium, Lehre und Forschung.",
      infoUrl: "https://www.sblgnt.com/",
    },
    {
      id: "kjv",
      lang: "en",
      label: "English KJV",
      path: "data/translations/english/KJV.json",
      info:
        "King James Version (1769): weit verbreitete englische Bibelübersetzung, sprachlich der frühneuzeitlichen Tradition verbunden. Für Vergleiche mit deutschsprachigen und anderen europäischen Texten geeignet.",
      infoUrl: "https://en.wikipedia.org/wiki/King_James_Version",
    },
    {
      id: "asv",
      lang: "en",
      label: "English ASV",
      path: "data/translations/english/ASV.json",
      info:
        "American Standard Version (1901): englische Übersetzung mit wörtlicher Ausrichtung, historisch wichtige protestantische Standardbibel vor der modernen Flut an Übersetzungen. Gut vergleichbar mit der KJV-Tradition.",
      infoUrl: "https://en.wikipedia.org/wiki/American_Standard_Version",
    },
    {
      id: "web",
      lang: "en",
      label: "English WEB",
      path: "data/translations/english/WEB.json",
      info:
        "The World English Bible (WEB) is a modern English translation in the public domain, derived in part from the American Standard Version (1901). It is widely used for digital distribution and comparison.",
      infoUrl: "https://worldenglish.bible/",
    },
    {
      id: "segond_1910",
      lang: "fr",
      label: "Louis Segond 1910",
      path: "data/translations/french/segond_1910.json",
      info:
        "Die Übersetzung Louis Segond (1910) ist eine verbreitete protestantische Bibel in französischer Sprache, in der Schweiz und Frankreich lange Standard gewesen.",
      infoUrl: "https://fr.wikipedia.org/wiki/Bible_Segond",
    },
    {
      id: "riveduta_1990",
      lang: "it",
      label: "Riveduta 1990",
      path: "data/translations/italian/riveduta_1990.json",
      info:
        "La Bibbia Riveduta in edizione aggiornata (circa 1990) si basa sulla tradizione protestante italiana della Riveduta del 1927; lingua e ortografia riflettono l’italiano del tardo Novecento.",
      infoUrl: "https://it.wikipedia.org/wiki/Bibbia_Riveduta",
    },
    {
      id: "sparv",
      lang: "es",
      label: "Reina-Valera 1909",
      path: "data/translations/spanish/SpaRV.json",
      info:
        "Reina-Valera (hier Ausgabe 1909): weit verbreitete spanische Bibeltradition. Wichtiger Bezug für hispanophone Textvergleiche.",
      infoUrl: "https://es.wikipedia.org/wiki/Reina-Valera",
    },
    {
      id: "vulgate",
      lang: "la",
      label: "Vulgata",
      path: "data/translations/latin/Vulgate.json",
      info:
        "Lateinische Vulgata (üblicherweise Hieronymus zugeschrieben): Jahrhunderte lang die maßgebliche lateinische Bibel in der abendländischen Kirche. Für historische und liturgische Bezüge.",
      infoUrl: "https://de.wikipedia.org/wiki/Vulgata",
    },
  ];
  const translationById = Object.create(null);
  TRANSLATIONS.forEach(function (t) {
    translationById[t.id] = t;
  });
  let activeTranslationId = TRANSLATIONS[0].id;
  const translationRawCache = Object.create(null);
  const translationVerseCache = Object.create(null);

  async function loadTranslationRaw(id) {
    if (translationRawCache[id]) return translationRawCache[id];
    const t = translationById[id];
    if (!t) throw new Error("Unbekannte Übersetzung: " + id);
    if (id === "elberfelder_1905" && Array.isArray(window.ELBERFELDER_DATA)) {
      translationRawCache[id] = window.ELBERFELDER_DATA;
      return translationRawCache[id];
    }
    const res = await fetch(t.path);
    if (!res.ok) throw new Error("Konnte Datei nicht laden (" + t.path + ")");
    const raw = await res.json();
    translationRawCache[id] = raw;
    return raw;
  }

  async function getVerseCache(id) {
    if (translationVerseCache[id]) return translationVerseCache[id];
    const SC = window.SYNOPTIC_COMPARE;
    if (!SC || typeof SC.initFromTranslationData !== "function") return null;
    const raw = await loadTranslationRaw(id);
    const cache = SC.initFromTranslationData(raw);
    translationVerseCache[id] = cache;
    return cache;
  }

  function activeTranslationLabel() {
    const t = translationById[activeTranslationId];
    return t ? t.label : "Unbekannt";
  }

  function activeTranslationIsSourceText() {
    const t = translationById[activeTranslationId];
    return !!(t && String(t.lang) === "el");
  }

  function compareModalColumnMetaHtml() {
    if (activeTranslationIsSourceText()) {
      return '<p class="compare-note compare-note--urtext">kritische Edition (SBLGNT)</p>';
    }
    return '<p class="compare-note">Übersetzung: ' + escapeHtml(activeTranslationLabel()) + "</p>";
  }

  function translationGroupLabel(langKey) {
    if (langKey === "_") return "Sonstige";
    const found = TRANSLATION_LANG_ORDER.find(function (g) {
      return g.key === langKey;
    });
    return found ? found.label : langKey;
  }

  function renderTranslationButtonRows() {
    const byLang = Object.create(null);
    TRANSLATIONS.forEach(function (t) {
      const k =
        t.lang != null && String(t.lang) !== "" ? String(t.lang) : "_";
      if (!byLang[k]) byLang[k] = [];
      byLang[k].push(t);
    });
    const keys = [];
    TRANSLATION_LANG_ORDER.forEach(function (g) {
      if (byLang[g.key] && byLang[g.key].length) keys.push(g.key);
    });
    Object.keys(byLang)
      .filter(function (k) {
        return k !== "_";
      })
      .sort()
      .forEach(function (k) {
        if (keys.indexOf(k) === -1) keys.push(k);
      });
    if (byLang["_"] && byLang["_"].length && keys.indexOf("_") === -1) {
      keys.push("_");
    }

    function renderOneLanguageGroup(langKey) {
      const items = byLang[langKey];
      if (!items || !items.length) return "";
      const grpLabel = translationGroupLabel(langKey);
      const labelRow =
        langKey === "el"
          ? `<div class="translation-lang-label translation-lang-label--urtext"><span class="translation-lang-urtext-mark" aria-hidden="true">Σ</span><span>${escapeHtml(
              grpLabel,
            )}</span></div>`
          : `<div class="translation-lang-label">${escapeHtml(grpLabel)}</div>`;
      const rows = items
        .map(function (t) {
          const active = t.id === activeTranslationId ? " active" : "";
          const infoBtn = t.info
            ? `<button type="button" class="translation-info-btn" data-translation-info="${escapeAttr(t.id)}" aria-label="Hinweis zu ${escapeAttr(t.label)}" title="Information">i</button>`
            : "";
          return `<div class="translation-option-row"><button type="button" data-translation="${escapeAttr(
            t.id,
          )}" class="translation-option-main${active}">${escapeHtml(t.label)}</button>${infoBtn}</div>`;
        })
        .join("");
      return `<div class="translation-lang-group" role="group" aria-label="${escapeAttr(grpLabel)}">${labelRow}${rows}</div>`;
    }

    const primaryChunks = [];
    const secondaryChunks = [];
    keys.forEach(function (langKey) {
      const html = renderOneLanguageGroup(langKey);
      if (!html) return;
      if (PRIMARY_LANG_KEYS.indexOf(langKey) !== -1) {
        primaryChunks.push(html);
      } else {
        secondaryChunks.push(html);
      }
    });

    let out = primaryChunks.join("");
    if (secondaryChunks.length) {
      const tAct = translationById[activeTranslationId];
      const secondaryOpen =
        tAct &&
        tAct.lang != null &&
        String(tAct.lang) !== "" &&
        PRIMARY_LANG_KEYS.indexOf(String(tAct.lang)) === -1;
      out +=
        '<details class="translation-lang-more"' +
        (secondaryOpen ? " open" : "") +
        '><summary class="translation-more-summary">Weitere Sprachen</summary><div class="translation-more-inner">' +
        secondaryChunks.join("") +
        "</div></details>";
    }
    return out;
  }

  function openTranslationInfoDialog(translationId) {
    const t = translationById[translationId];
    if (!t || !t.info) return;
    closeTranslationPicker();
    const dlg = document.getElementById("translation-info-dialog");
    document.getElementById("translation-info-dialog-title").textContent = t.label;
    const body = document.getElementById("translation-info-dialog-body");
    body.textContent = "";
    body.appendChild(document.createTextNode(t.info.trimEnd()));
    if (t.infoUrl) {
      body.appendChild(document.createTextNode(" Weitere Informationen: "));
      const a = document.createElement("a");
      a.href = t.infoUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      var linkLabel = "Link";
      try {
        linkLabel = new URL(t.infoUrl).hostname.replace(/^www\./, "");
      } catch (e) {}
      a.textContent = linkLabel;
      body.appendChild(a);
    }
    if (dlg && typeof dlg.showModal === "function") {
      dlg.showModal();
    }
  }

  function updateMobileTranslationLabel() {
    const lab = document.getElementById("translation-lang-mobile-label");
    if (lab) lab.textContent = activeTranslationLabel();
  }

  function syncTranslationButtons() {
    document.querySelectorAll("button[data-translation]").forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.translation === activeTranslationId);
    });
    updateMobileTranslationLabel();
  }

  function refreshTranslationUI() {
    const html = renderTranslationButtonRows();
    document.getElementById("compare-modal-translation-buttons").innerHTML = html;
    document.getElementById("translation-picker-body").innerHTML = html;
    syncTranslationButtons();
  }

  const translationPickerOverlay = document.getElementById("translation-picker-overlay");
  const translationLangMobileBtn = document.getElementById("translation-lang-mobile-btn");

  function isMobileTranslationUI() {
    return window.matchMedia("(max-width: 720px)").matches;
  }

  function closeTranslationPicker() {
    if (!translationPickerOverlay || translationPickerOverlay.hidden) return;
    translationPickerOverlay.setAttribute("hidden", "");
    if (translationLangMobileBtn) {
      translationLangMobileBtn.setAttribute("aria-expanded", "false");
    }
  }

  function openTranslationPicker() {
    if (!translationPickerOverlay || !isMobileTranslationUI()) return;
    translationPickerOverlay.removeAttribute("hidden");
    if (translationLangMobileBtn) {
      translationLangMobileBtn.setAttribute("aria-expanded", "true");
    }
    window.setTimeout(function () {
      const c = document.getElementById("translation-picker-close");
      if (c && typeof c.focus === "function") c.focus();
    }, 30);
  }

  const compareModal = document.getElementById("compare-modal");
  const compareModalBackdrop = document.getElementById("compare-modal-backdrop");
  const compareModalCloseBtn = document.getElementById("compare-modal-close");
  let compareModalRowId = null;
  let lastFocusBeforeModal = null;
  let translationSwapSeq = 0;

  function syncGreekScriptClass() {
    const panel = document.getElementById("compare-modal-panel");
    if (!panel) return;
    const t = translationById[activeTranslationId];
    panel.classList.toggle("is-greek-script", !!(t && String(t.lang) === "el"));
  }

  function closeCompareModal() {
    closeTranslationPicker();
    const infoDlg = document.getElementById("translation-info-dialog");
    if (infoDlg && infoDlg.open && typeof infoDlg.close === "function") {
      infoDlg.close();
    }
    const panel = document.getElementById("compare-modal-panel");
    if (panel) panel.classList.remove("is-greek-script");
    compareModal.classList.remove("is-open");
    compareModalRowId = null;
    translationSwapSeq += 1;
    const grid = document.getElementById("compare-modal-grid");
    grid.dataset.filled = "0";
    grid.classList.remove("is-swapping");
    grid.innerHTML = "";
    window.setTimeout(function () {
      compareModal.setAttribute("hidden", "");
    }, 450);
    document.body.style.overflow = "";
    if (lastFocusBeforeModal && typeof lastFocusBeforeModal.focus === "function") {
      lastFocusBeforeModal.focus();
    }
    lastFocusBeforeModal = null;
  }

  function openCompareModal(wrap) {
    const id = +wrap.dataset.rowId;
    const row = data.find(function (x) {
      return x.row_id === id;
    });
    if (!row) return;

    translationSwapSeq += 1;
    compareModalRowId = id;
    lastFocusBeforeModal = document.activeElement;

    document.getElementById("compare-modal-aland").textContent = "Aland " + row.aland_no;
    document.getElementById("compare-modal-title").textContent = row.title_de || row.title;
    document.getElementById("compare-modal-sec").textContent = row.section_de || row.section || "";

    const grid = document.getElementById("compare-modal-grid");
    grid.dataset.filled = "0";
    grid.classList.remove("is-swapping");
    grid.innerHTML = "";

    compareModal.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    compareModal.classList.add("is-open");

    fillCompareGrid(grid, row);
    window.setTimeout(function () {
      compareModalCloseBtn.focus();
    }, 50);
  }

  refreshTranslationUI();

  const translationPickerCloseBtn = document.getElementById("translation-picker-close");
  if (translationPickerCloseBtn) {
    translationPickerCloseBtn.addEventListener("click", function () {
      closeTranslationPicker();
      if (translationLangMobileBtn && typeof translationLangMobileBtn.focus === "function") {
        translationLangMobileBtn.focus();
      }
    });
  }

  if (translationLangMobileBtn) {
    translationLangMobileBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!isMobileTranslationUI()) return;
      openTranslationPicker();
    });
  }

  window.matchMedia("(max-width: 720px)").addEventListener("change", function (ev) {
    if (!ev.matches) closeTranslationPicker();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    const infoDlg = document.getElementById("translation-info-dialog");
    if (infoDlg && infoDlg.open) {
      e.preventDefault();
      if (typeof infoDlg.close === "function") infoDlg.close();
      return;
    }
    if (translationPickerOverlay && !translationPickerOverlay.hidden) {
      e.preventDefault();
      closeTranslationPicker();
      if (translationLangMobileBtn && typeof translationLangMobileBtn.focus === "function") {
        translationLangMobileBtn.focus();
      }
      return;
    }
    if (compareModal.classList.contains("is-open")) {
      e.preventDefault();
      closeCompareModal();
    }
  });

  compareModalBackdrop.addEventListener("click", closeCompareModal);
  compareModalCloseBtn.addEventListener("click", closeCompareModal);

  document.getElementById("translation-info-dialog-close").addEventListener("click", function () {
    const dlg = document.getElementById("translation-info-dialog");
    if (dlg && typeof dlg.close === "function") dlg.close();
  });

  document.addEventListener("click", function (e) {
    const infoBtn = e.target.closest("button[data-translation-info]");
    if (infoBtn) {
      e.preventDefault();
      e.stopPropagation();
      openTranslationInfoDialog(infoBtn.getAttribute("data-translation-info"));
      return;
    }
    const tBtn = e.target.closest("button[data-translation]");
    if (!tBtn) return;
    activeTranslationId = tBtn.dataset.translation;
    const tSel = translationById[activeTranslationId];
    if (
      tSel &&
      tSel.lang != null &&
      String(tSel.lang) !== "" &&
      PRIMARY_LANG_KEYS.indexOf(String(tSel.lang)) === -1
    ) {
      const det =
        document.querySelector("#translation-picker-body .translation-lang-more") ||
        document.querySelector("#compare-modal-translation-buttons .translation-lang-more");
      if (det) det.open = true;
    }
    invalidateOpenPanels();
    if (translationPickerOverlay && !translationPickerOverlay.hidden) {
      closeTranslationPicker();
      if (translationLangMobileBtn && typeof translationLangMobileBtn.focus === "function") {
        translationLangMobileBtn.focus();
      }
    }
  });

  async function fillCompareGrid(grid, r) {
    syncGreekScriptClass();
    if (!grid || grid.dataset.filled === "1") return;
    grid.innerHTML =
      '<p class="compare-note">' +
      (activeTranslationIsSourceText() ? "Lade griechischen Text …" : "Lade Übersetzung …") +
      "</p>";

    let cache = null;
    const SC = window.SYNOPTIC_COMPARE;
    try {
      cache = await getVerseCache(activeTranslationId);
    } catch (err) {
      if (compareModalRowId !== r.row_id) return;
      grid.innerHTML =
        '<p class="compare-note">' +
        (activeTranslationIsSourceText()
          ? "Der griechische Text konnte nicht geladen werden."
          : "Übersetzung konnte nicht geladen werden.") +
        "</p>";
      grid.dataset.filled = "1";
      return;
    }
    if (compareModalRowId !== r.row_id) return;
    if (!cache || !SC) {
      grid.innerHTML =
        '<p class="compare-note">' +
        (activeTranslationIsSourceText() ? "Keine Textdaten verfügbar." : "Übersetzungsdaten nicht verfügbar.") +
        "</p>";
      grid.dataset.filled = "1";
      return;
    }

    const { idx, maxV, aliases } = cache;
    const cols = [
      { book: 40, label: "Matthäus", cls: "mt", inKey: "in_matthew", refKey: "ref_matthew" },
      { book: 41, label: "Markus", cls: "mk", inKey: "in_mark", refKey: "ref_mark" },
      { book: 42, label: "Lukas", cls: "lk", inKey: "in_luke", refKey: "ref_luke" },
      { book: 43, label: "Johannes", cls: "jn", inKey: "in_john", refKey: "ref_john" },
    ];

    const active = cols.filter((c) => r[c.inKey]);
    if (!active.length) {
      grid.innerHTML =
        '<p class="compare-note">In dieser Zeile ist kein Evangelientext verknüpft.</p>';
      grid.dataset.filled = "1";
      grid.style.gridTemplateColumns = "";
      return;
    }

    const n = active.length;
    grid.style.gridTemplateColumns = "repeat(" + n + ", minmax(0, 1fr))";

    const colMeta = compareModalColumnMetaHtml();
    grid.innerHTML = active
      .map((c) => {
        const ref = r[c.refKey] || "";
        const body = SC.renderColumnHtml(c.book, c.label, ref, idx, maxV, aliases);
        return `<div class="text-col ${c.cls}"><h4>${c.label}<span class="ref-tag">${escapeHtml(ref)}</span></h4>${colMeta}<div class="text-col-body">${body}</div></div>`;
      })
      .join("");
    grid.dataset.filled = "1";
  }

  function invalidateOpenPanels() {
    syncTranslationButtons();
    if (!compareModal.classList.contains("is-open") || compareModalRowId === null) {
      return;
    }
    const grid = document.getElementById("compare-modal-grid");
    if (!grid) return;
    const seq = (translationSwapSeq += 1);
    grid.classList.add("is-swapping");
    window.setTimeout(function () {
      if (seq !== translationSwapSeq) return;
      if (!compareModal.classList.contains("is-open") || compareModalRowId === null) {
        grid.classList.remove("is-swapping");
        return;
      }
      grid.dataset.filled = "0";
      grid.innerHTML = "";
      const row = data.find(function (x) {
        return x.row_id === compareModalRowId;
      });
      if (!row) {
        grid.classList.remove("is-swapping");
        return;
      }
      fillCompareGrid(grid, row)
        .then(function () {
          if (seq !== translationSwapSeq) return;
          grid.classList.remove("is-swapping");
        })
        .catch(function () {
          grid.classList.remove("is-swapping");
        });
    }, 140);
  }

  function renderRow(r) {
    const title = escapeHtml(r.title_de || r.title);
    const sec = escapeHtml(r.section_de || r.section || "");
    return `
      <section class="row-wrap" data-row-id="${r.row_id}">
        <div class="row row-head" tabindex="0" role="button" aria-label="Versvergleich in Fenster öffnen">
          <div class="aland">${r.aland_no}</div>
          <div class="row-main">
            <h2>${title}</h2>
            <div class="sec">${sec}</div>
          </div>
          <div class="row-actions">
            <div class="gospels">
              ${pill("mt", "Mt", r.in_matthew, r.bold_matthew, r.ref_matthew)}
              ${pill("mk", "Mk", r.in_mark, r.bold_mark, r.ref_mark)}
              ${pill("lk", "Lk", r.in_luke, r.bold_luke, r.ref_luke)}
              ${pill("jn", "Jn", r.in_john, r.bold_john, r.ref_john)}
            </div>
            <span class="chev" aria-hidden="true">↗</span>
          </div>
        </div>
      </section>`;
  }

  function filter() {
    const q = document.getElementById("q").value.trim().toLowerCase();
    const sec = document.getElementById("section").value;

    const out = data.filter((r) => {
      if (!matchesPreset(r, activePreset)) return false;
      if (sec && r.section !== sec) return false;
      if (!q) return true;
      const hay = [
        r.title,
        r.title_de,
        r.section,
        r.section_de,
        r.ref_matthew,
        r.ref_mark,
        r.ref_luke,
        r.ref_john,
        String(r.aland_no),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });

    document.getElementById("count").textContent =
      out.length + " von " + n + " Zeilen" + (activePreset !== "all" ? " (Filter aktiv)" : "");

    const list = document.getElementById("list");
    if (!out.length) {
      list.innerHTML = '<div class="empty">Keine Treffer — Filter lockern oder Suche ändern.</div>';
      return;
    }
    list.innerHTML = out.map(renderRow).join("");
  }

  const listEl = document.getElementById("list");
  listEl.addEventListener("click", (e) => {
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

  document.getElementById("q").addEventListener("input", filter);
  document.getElementById("section").addEventListener("change", filter);

  presetEl.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-preset]");
    if (!b) return;
    activePreset = b.dataset.preset;
    presetEl.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.preset === activePreset);
    });
    filter();
  });

  filter();
  getVerseCache(activeTranslationId).catch(function () {
    // Erstes Laden kann bei lokalen file://-Setups scheitern; wir zeigen den Fehler erst im Panel.
  });
})();

(function () {
  const btn = document.getElementById("to-top");
  if (!btn) return;
  function sync() {
    btn.classList.toggle("visible", window.scrollY > 200);
  }
  window.addEventListener("scroll", sync, { passive: true });
  sync();
  btn.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

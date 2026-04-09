(function () {
  function createGreekCompareTools(options) {
    options = options || {};

    const t =
      options.t ||
      function (key) {
        return key;
      };
    const escapeHtml =
      options.escapeHtml ||
      function (value) {
        const div = document.createElement("div");
        div.textContent = String(value == null ? "" : value);
        return div.innerHTML;
      };
    const escapeAttr =
      options.escapeAttr ||
      function (value) {
        return String(value || "").replace(/"/g, "&quot;");
      };
    const getBookLabel =
      options.getBookLabel ||
      function (bookKey) {
        return bookKey;
      };
    const fetchJson = options.fetchJson || async function () {
      return null;
    };
    const effectiveTranslationId =
      options.effectiveTranslationId ||
      function () {
        return "";
      };
    const getCompareGridEl =
      options.getCompareGridEl ||
      function (which) {
        return document.getElementById(which === "modal" ? "compare-modal-grid" : "compare-main-grid");
      };
    const DISPLAY_READING = "reading";
    const DISPLAY_INTERLINEAR = "interlinear";
    const GOSPEL_BOOK_KEYS = {
      40: "matthew",
      41: "mark",
      42: "luke",
      43: "john",
    };
    const FALLBACK_TEXTS = {
      "js.greekTools.openVerse": "Interlinear",
      "js.greekTools.openVerseTitle": "Interlinear zu {ref} oeffnen",
      "js.greekTools.empty.verse": "Fuer diesen Vers ist keine Interlinear-Ansicht verfuegbar.",
      "js.greekTools.empty.interlinear": "Ein Wort antippen, um weitere Wortinfos zu sehen.",
      "js.greekTools.verseDialog.title": "Interlinear",
      "js.greekTools.verseDialog.original": "Griechischer Vers",
      "js.greekTools.verseDialog.interlinear": "Wort fuer Wort",
      "js.greekTools.verseDialog.hint": "Wort antippen fuer Analyse",
      "js.greekTools.labels.lemma": "Lemma",
      "js.greekTools.labels.morphology": "Morphologie",
      "js.greekTools.labels.transliteration": "Transliteration",
      "js.greekTools.labels.strong": "Strong",
      "js.greekTools.labels.gloss": "Gloss",
      "js.greekTools.labels.reference": "Stelle",
      "js.greekTools.labels.clause": "Klausel",
      "js.greekTools.labels.code": "Code",
      "js.greekTools.labels.otQuote": "AT-Zitat",
      "js.greekTools.labels.closeCard": "Wortinfos schliessen",
    };
    const MORPH_LABELS = {
      de: {
        noun: "Nomen",
        adjective: "Adjektiv",
        article: "Artikel",
        pronoun: "Pronomen",
        relativePronoun: "Relativpronomen",
        reciprocalPronoun: "Reziprokpronomen",
        demonstrativePronoun: "Demonstrativpronomen",
        reflexivePronoun: "Reflexivpronomen",
        interrogativePronoun: "Interrogativpronomen",
        indefinitePronoun: "Indefinitpronomen",
        correlativePronoun: "Korrelativpronomen",
        possessivePronoun: "Possessivpronomen",
        adverb: "Adverb",
        conjunction: "Konjunktion",
        preposition: "Praeposition",
        particle: "Partikel",
        interjection: "Interjektion",
        verb: "Verb",
        aramaic: "Aramaeisch",
        hebrew: "Hebraeisch",
        nominative: "Nominativ",
        genitive: "Genitiv",
        dative: "Dativ",
        accusative: "Akkusativ",
        vocative: "Vokativ",
        singular: "Singular",
        plural: "Plural",
        masculine: "Maskulin",
        feminine: "Feminin",
        neuter: "Neutrum",
        present: "Praesens",
        imperfect: "Imperfekt",
        future: "Futur",
        aorist: "Aorist",
        perfect: "Perfekt",
        pluperfect: "Plusquamperfekt",
        active: "Aktiv",
        middle: "Medium",
        passive: "Passiv",
        middlePassive: "Medium/Passiv",
        middleDeponent: "Medium deponens",
        passiveDeponent: "Passiv deponens",
        middlePassiveDeponent: "Medium/Passiv deponens",
        impersonalActive: "unpersoenlich aktiv",
        indicative: "Indikativ",
        subjunctive: "Konjunktiv",
        optative: "Optativ",
        imperative: "Imperativ",
        infinitive: "Infinitiv",
        participle: "Partizip",
        properName: "Eigenname",
        title: "Titel",
        location: "Ortsname",
        comparative: "Komparativ",
        superlative: "Superlativ",
        negative: "negativ",
        interrogative: "interrogativ",
        correlative: "korrelativ",
        firstPerson: "1. Person",
        secondPerson: "2. Person",
        thirdPerson: "3. Person",
        secondForm: "2. Form",
      },
      en: {
        noun: "Noun",
        adjective: "Adjective",
        article: "Article",
        pronoun: "Pronoun",
        relativePronoun: "Relative pronoun",
        reciprocalPronoun: "Reciprocal pronoun",
        demonstrativePronoun: "Demonstrative pronoun",
        reflexivePronoun: "Reflexive pronoun",
        interrogativePronoun: "Interrogative pronoun",
        indefinitePronoun: "Indefinite pronoun",
        correlativePronoun: "Correlative pronoun",
        possessivePronoun: "Possessive pronoun",
        adverb: "Adverb",
        conjunction: "Conjunction",
        preposition: "Preposition",
        particle: "Particle",
        interjection: "Interjection",
        verb: "Verb",
        aramaic: "Aramaic",
        hebrew: "Hebrew",
        nominative: "Nominative",
        genitive: "Genitive",
        dative: "Dative",
        accusative: "Accusative",
        vocative: "Vocative",
        singular: "Singular",
        plural: "Plural",
        masculine: "Masculine",
        feminine: "Feminine",
        neuter: "Neuter",
        present: "Present",
        imperfect: "Imperfect",
        future: "Future",
        aorist: "Aorist",
        perfect: "Perfect",
        pluperfect: "Pluperfect",
        active: "Active",
        middle: "Middle",
        passive: "Passive",
        middlePassive: "Middle/Passive",
        middleDeponent: "Middle deponent",
        passiveDeponent: "Passive deponent",
        middlePassiveDeponent: "Middle/Passive deponent",
        impersonalActive: "Impersonal active",
        indicative: "Indicative",
        subjunctive: "Subjunctive",
        optative: "Optative",
        imperative: "Imperative",
        infinitive: "Infinitive",
        participle: "Participle",
        properName: "Proper name",
        title: "Title",
        location: "Place name",
        comparative: "Comparative",
        superlative: "Superlative",
        negative: "Negative",
        interrogative: "Interrogative",
        correlative: "Correlative",
        firstPerson: "1st person",
        secondPerson: "2nd person",
        thirdPerson: "3rd person",
        secondForm: "2nd form",
      },
      fr: {
        noun: "Nom",
        adjective: "Adjectif",
        article: "Article",
        pronoun: "Pronom",
        relativePronoun: "Pronom relatif",
        reciprocalPronoun: "Pronom reciproque",
        demonstrativePronoun: "Pronom demonstratif",
        reflexivePronoun: "Pronom reflexif",
        interrogativePronoun: "Pronom interrogatif",
        indefinitePronoun: "Pronom indefini",
        correlativePronoun: "Pronom correlatif",
        possessivePronoun: "Pronom possessif",
        adverb: "Adverbe",
        conjunction: "Conjonction",
        preposition: "Preposition",
        particle: "Particule",
        interjection: "Interjection",
        verb: "Verbe",
        aramaic: "Arameen",
        hebrew: "Hebreu",
        nominative: "Nominatif",
        genitive: "Genitif",
        dative: "Datif",
        accusative: "Accusatif",
        vocative: "Vocatif",
        singular: "Singulier",
        plural: "Pluriel",
        masculine: "Masculin",
        feminine: "Feminin",
        neuter: "Neutre",
        present: "Present",
        imperfect: "Imparfait",
        future: "Futur",
        aorist: "Aoriste",
        perfect: "Parfait",
        pluperfect: "Plus-que-parfait",
        active: "Actif",
        middle: "Moyen",
        passive: "Passif",
        middlePassive: "Moyen/Passif",
        middleDeponent: "Moyen deponent",
        passiveDeponent: "Passif deponent",
        middlePassiveDeponent: "Moyen/Passif deponent",
        impersonalActive: "actif impersonnel",
        indicative: "Indicatif",
        subjunctive: "Subjonctif",
        optative: "Optatif",
        imperative: "Imperatif",
        infinitive: "Infinitif",
        participle: "Participe",
        properName: "Nom propre",
        title: "Titre",
        location: "Toponyme",
        comparative: "Comparatif",
        superlative: "Superlatif",
        negative: "negatif",
        interrogative: "interrogatif",
        correlative: "correlatif",
        firstPerson: "1re personne",
        secondPerson: "2e personne",
        thirdPerson: "3e personne",
        secondForm: "2e forme",
      },
      it: {
        noun: "Nome",
        adjective: "Aggettivo",
        article: "Articolo",
        pronoun: "Pronome",
        relativePronoun: "Pronome relativo",
        reciprocalPronoun: "Pronome reciproco",
        demonstrativePronoun: "Pronome dimostrativo",
        reflexivePronoun: "Pronome riflessivo",
        interrogativePronoun: "Pronome interrogativo",
        indefinitePronoun: "Pronome indefinito",
        correlativePronoun: "Pronome correlativo",
        possessivePronoun: "Pronome possessivo",
        adverb: "Avverbio",
        conjunction: "Congiunzione",
        preposition: "Preposizione",
        particle: "Particella",
        interjection: "Interiezione",
        verb: "Verbo",
        aramaic: "Aramaico",
        hebrew: "Ebraico",
        nominative: "Nominativo",
        genitive: "Genitivo",
        dative: "Dativo",
        accusative: "Accusativo",
        vocative: "Vocativo",
        singular: "Singolare",
        plural: "Plurale",
        masculine: "Maschile",
        feminine: "Femminile",
        neuter: "Neutro",
        present: "Presente",
        imperfect: "Imperfetto",
        future: "Futuro",
        aorist: "Aoristo",
        perfect: "Perfetto",
        pluperfect: "Piucheperfetto",
        active: "Attivo",
        middle: "Medio",
        passive: "Passivo",
        middlePassive: "Medio/Passivo",
        middleDeponent: "Medio deponente",
        passiveDeponent: "Passivo deponente",
        middlePassiveDeponent: "Medio/Passivo deponente",
        impersonalActive: "attivo impersonale",
        indicative: "Indicativo",
        subjunctive: "Congiuntivo",
        optative: "Ottativo",
        imperative: "Imperativo",
        infinitive: "Infinito",
        participle: "Participio",
        properName: "Nome proprio",
        title: "Titolo",
        location: "Toponimo",
        comparative: "Comparativo",
        superlative: "Superlativo",
        negative: "negativo",
        interrogative: "interrogativo",
        correlative: "correlativo",
        firstPerson: "1a persona",
        secondPerson: "2a persona",
        thirdPerson: "3a persona",
        secondForm: "2a forma",
      },
      es: {
        noun: "Sustantivo",
        adjective: "Adjetivo",
        article: "Articulo",
        pronoun: "Pronombre",
        relativePronoun: "Pronombre relativo",
        reciprocalPronoun: "Pronombre reciproco",
        demonstrativePronoun: "Pronombre demostrativo",
        reflexivePronoun: "Pronombre reflexivo",
        interrogativePronoun: "Pronombre interrogativo",
        indefinitePronoun: "Pronombre indefinido",
        correlativePronoun: "Pronombre correlativo",
        possessivePronoun: "Pronombre posesivo",
        adverb: "Adverbio",
        conjunction: "Conjuncion",
        preposition: "Preposicion",
        particle: "Particula",
        interjection: "Interjeccion",
        verb: "Verbo",
        aramaic: "Arameo",
        hebrew: "Hebreo",
        nominative: "Nominativo",
        genitive: "Genitivo",
        dative: "Dativo",
        accusative: "Acusativo",
        vocative: "Vocativo",
        singular: "Singular",
        plural: "Plural",
        masculine: "Masculino",
        feminine: "Femenino",
        neuter: "Neutro",
        present: "Presente",
        imperfect: "Imperfecto",
        future: "Futuro",
        aorist: "Aoristo",
        perfect: "Perfecto",
        pluperfect: "Pluscuamperfecto",
        active: "Activo",
        middle: "Medio",
        passive: "Pasivo",
        middlePassive: "Medio/Pasivo",
        middleDeponent: "Medio deponente",
        passiveDeponent: "Pasivo deponente",
        middlePassiveDeponent: "Medio/Pasivo deponente",
        impersonalActive: "activo impersonal",
        indicative: "Indicativo",
        subjunctive: "Subjuntivo",
        optative: "Optativo",
        imperative: "Imperativo",
        infinitive: "Infinitivo",
        participle: "Participio",
        properName: "Nombre propio",
        title: "Titulo",
        location: "Toponimo",
        comparative: "Comparativo",
        superlative: "Superlativo",
        negative: "negativo",
        interrogative: "interrogativo",
        correlative: "correlativo",
        firstPerson: "1.a persona",
        secondPerson: "2.a persona",
        thirdPerson: "3.a persona",
        secondForm: "2.a forma",
      },
    };

    const selectedTokenByPanel = {
      modal: null,
      main: null,
      verse: null,
    };
    const interlinearBookCache = Object.create(null);
    const interlinearBookPromises = Object.create(null);
    let activeDialogPanel = "";
    let activeVerseDialog = null;
    let suppressDialogCloseHandler = false;
    let suppressVerseDialogCloseHandler = false;
    let dialogCloseTimer = 0;
    let dialogSwapTimer = 0;
    let verseDialogCloseTimer = 0;
    let verseDialogSwapTimer = 0;
    let verseDialogRequestSeq = 0;
    const DIALOG_ANIMATION_MS = 220;

    function uiLang() {
      const lang = String(document.documentElement.lang || "de").slice(0, 2).toLowerCase();
      return MORPH_LABELS[lang] ? lang : "de";
    }

    function tt(key, vars) {
      const translated = t(key, vars);
      if (translated && translated !== key) return translated;
      const fallback = FALLBACK_TEXTS[key] || key;
      return String(fallback).replace(/\{(\w+)\}/g, function (_, name) {
        return vars && Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : "";
      });
    }

    function morphText(key) {
      const lang = uiLang();
      const table = MORPH_LABELS[lang] || MORPH_LABELS.de;
      return table[key] || MORPH_LABELS.en[key] || key;
    }

    function panelSupportsTools(which) {
      return effectiveTranslationId(which) === "greek_slb";
    }

    function wordDialogEl() {
      return document.getElementById("greek-word-dialog");
    }

    function wordDialogTitleEl() {
      return document.getElementById("greek-word-dialog-title");
    }

    function wordDialogRefEl() {
      return document.getElementById("greek-word-dialog-ref");
    }

    function wordDialogBodyEl() {
      return document.getElementById("greek-word-dialog-body");
    }

    function verseDialogWordEl() {
      return document.getElementById("greek-verse-dialog-word");
    }

    function verseDialogEl() {
      return document.getElementById("greek-verse-dialog");
    }

    function verseDialogTitleEl() {
      return document.getElementById("greek-verse-dialog-title");
    }

    function verseDialogRefEl() {
      return document.getElementById("greek-verse-dialog-ref");
    }

    function verseDialogBodyEl() {
      return document.getElementById("greek-verse-dialog-body");
    }

    function panelRootEl(which) {
      return which === "verse" ? verseDialogBodyEl() : getCompareGridEl(which);
    }

    function verseLabel(book, chapter, verse) {
      return getBookLabelByNumber(book) + " " + chapter + "," + verse;
    }

    function sameVerseTarget(a, b) {
      return !!(
        a &&
        b &&
        a.sourcePanel === b.sourcePanel &&
        a.book === b.book &&
        a.chapter === b.chapter &&
        a.verse === b.verse
      );
    }

    function syncOpenVerseState() {
      ["modal", "main"].forEach(function (which) {
        const grid = getCompareGridEl(which);
        if (!grid) return;
        grid.querySelectorAll("[data-greek-open-verse]").forEach(function (line) {
          const isOpen =
            !!activeVerseDialog &&
            line.getAttribute("data-greek-panel") === activeVerseDialog.sourcePanel &&
            line.getAttribute("data-greek-book") === String(activeVerseDialog.book) &&
            line.getAttribute("data-greek-chapter") === String(activeVerseDialog.chapter) &&
            line.getAttribute("data-greek-verse") === String(activeVerseDialog.verse);
          line.classList.toggle("is-open", isOpen);
          line.setAttribute("aria-pressed", isOpen ? "true" : "false");
        });
      });
    }

    function cleanGloss(raw) {
      return String(raw || "")
        .replace(/\[(.*?)\]/g, "$1")
        .replace(/\s+/g, " ")
        .trim();
    }

    function getBookLabelByNumber(book) {
      const bookKey = GOSPEL_BOOK_KEYS[book];
      return bookKey ? getBookLabel(bookKey) : String(book);
    }

    function localizeCase(code) {
      return {
        N: morphText("nominative"),
        G: morphText("genitive"),
        D: morphText("dative"),
        A: morphText("accusative"),
        V: morphText("vocative"),
      }[code] || "";
    }

    function localizeNumber(code) {
      return {
        S: morphText("singular"),
        P: morphText("plural"),
      }[code] || "";
    }

    function localizeGender(code) {
      return {
        M: morphText("masculine"),
        F: morphText("feminine"),
        N: morphText("neuter"),
      }[code] || "";
    }

    function localizePerson(code) {
      return {
        "1": morphText("firstPerson"),
        "2": morphText("secondPerson"),
        "3": morphText("thirdPerson"),
      }[code] || "";
    }

    function localizeExtra(code) {
      return {
        P: morphText("properName"),
        T: morphText("title"),
        L: morphText("location"),
        C: morphText("comparative"),
        S: morphText("superlative"),
        N: morphText("negative"),
        I: morphText("interrogative"),
        K: morphText("correlative"),
      }[code] || "";
    }

    function parseCaseNumberGender(triple) {
      if (!triple || triple.length < 3) return [];
      return [localizeCase(triple.charAt(0)), localizeNumber(triple.charAt(1)), localizeGender(triple.charAt(2))].filter(Boolean);
    }

    function describeMorphology(code) {
      const raw = String(code || "").trim();
      if (!raw) return { summary: "", raw: "" };
      const parts = raw.split("-");
      const prefix = parts[0] || "";
      const summary = [];
      const extras = [];

      function addPos(labelKey) {
        const value = morphText(labelKey);
        if (value) summary.push(value);
      }

      if (prefix === "V") {
        addPos("verb");
        let tvm = parts[1] || "";
        if (/^2/.test(tvm)) {
          extras.push(morphText("secondForm"));
          tvm = tvm.slice(1);
        }
        const tense = {
          P: morphText("present"),
          I: morphText("imperfect"),
          F: morphText("future"),
          A: morphText("aorist"),
          X: morphText("perfect"),
          Y: morphText("pluperfect"),
        }[tvm.charAt(0)] || "";
        const voice = {
          A: morphText("active"),
          M: morphText("middle"),
          P: morphText("passive"),
          E: morphText("middlePassive"),
          D: morphText("middleDeponent"),
          O: morphText("passiveDeponent"),
          N: morphText("middlePassiveDeponent"),
          Q: morphText("impersonalActive"),
        }[tvm.charAt(1)] || "";
        const moodCode = tvm.charAt(2);
        const mood = {
          I: morphText("indicative"),
          S: morphText("subjunctive"),
          O: morphText("optative"),
          M: morphText("imperative"),
          N: morphText("infinitive"),
          P: morphText("participle"),
        }[moodCode] || "";
        [tense, voice, mood].forEach(function (value) {
          if (value) summary.push(value);
        });
        const detail = parts[2] || "";
        if (moodCode === "P") {
          summary.push.apply(summary, parseCaseNumberGender(detail));
        } else if (/^[123][SP]$/.test(detail)) {
          summary.push(localizePerson(detail.charAt(0)), localizeNumber(detail.charAt(1)));
        }
      } else {
        const posMap = {
          N: "noun",
          A: "adjective",
          T: "article",
          P: "pronoun",
          R: "relativePronoun",
          C: "reciprocalPronoun",
          D: "demonstrativePronoun",
          F: "reflexivePronoun",
          I: "interrogativePronoun",
          X: "indefinitePronoun",
          Q: "correlativePronoun",
          K: "correlativePronoun",
          S: "possessivePronoun",
          ADV: "adverb",
          CONJ: "conjunction",
          PREP: "preposition",
          PRT: "particle",
          INJ: "interjection",
          ARAM: "aramaic",
          HEB: "hebrew",
        };
        if (posMap[prefix]) addPos(posMap[prefix]);
        const detail = parts[1] || "";
        if (prefix === "S" && /^[123][SP][NGDAV][SP][MFN]$/.test(detail)) {
          summary.push(localizePerson(detail.charAt(0)), localizeNumber(detail.charAt(1)));
          summary.push.apply(summary, parseCaseNumberGender(detail.slice(2)));
        } else if (/^[123][NGDAV][SP][MFN]$/.test(detail)) {
          summary.push(localizePerson(detail.charAt(0)));
          summary.push.apply(summary, parseCaseNumberGender(detail.slice(1)));
        } else if (/^[123][NGDAV][SP]$/.test(detail)) {
          summary.push(localizePerson(detail.charAt(0)), localizeCase(detail.charAt(1)), localizeNumber(detail.charAt(2)));
        } else if (/^[NGDAV][SP][MFN]$/.test(detail)) {
          summary.push.apply(summary, parseCaseNumberGender(detail));
        }
        parts.slice(2).forEach(function (extraCode) {
          const localized = localizeExtra(extraCode);
          if (localized) extras.push(localized);
        });
        if ((prefix === "ADV" || prefix === "CONJ" || prefix === "PRT") && detail.length === 1) {
          const localizedModifier = localizeExtra(detail);
          if (localizedModifier) extras.push(localizedModifier);
        }
      }

      return {
        summary: summary.filter(Boolean).concat(extras.filter(Boolean)).join(" · "),
        raw: raw,
      };
    }

    function tokenTitle(token) {
      const gloss = cleanGloss(token.gl || token.g || token.lt || "");
      const parts = [token.w || "", token.l || "", gloss].filter(Boolean);
      return parts.join(" - ");
    }

    function getTokenFromSelection(selection) {
      if (!selection) return null;
      const bookData = interlinearBookCache[String(selection.book)];
      const verseTokens =
        bookData &&
        bookData.verses &&
        bookData.verses[selection.chapter + ":" + selection.verse];
      return verseTokens && verseTokens[selection.index] ? verseTokens[selection.index] : null;
    }

    function renderCardHtml(which) {
      const selection = selectedTokenByPanel[which];
      const token = getTokenFromSelection(selection);
      if (!token) {
        return '<div class="compare-greek-card compare-greek-card--empty"><p>' + escapeHtml(tt("js.greekTools.empty.interlinear")) + "</p></div>";
      }

      const morph = describeMorphology(token.m);
      const gloss = cleanGloss(token.gl || token.g || token.lt || token.st || "");

      return (
        '<div class="compare-greek-card compare-greek-card--dialog">' +
        '<div class="greek-word-sheet">' +
        renderSheetField("gloss", gloss || "", "greek-word-sheet__panel greek-word-sheet__panel--gloss", "greek-word-sheet__value greek-word-sheet__value--gloss") +
        renderMorphologyField(morph.summary || "") +
        renderSheetField("lemma", token.l || "", "greek-word-sheet__panel greek-word-sheet__panel--lemma", "greek-word-sheet__value greek-word-sheet__value--lemma") +
        renderSheetField(
          "strong",
          token.s || "",
          "greek-word-sheet__panel greek-word-sheet__panel--strong",
          "greek-word-sheet__value greek-word-sheet__value--strong"
        ) +
        "</div>" +
        "</div>"
      );
    }

    function clearPanelSelection(which) {
      selectedTokenByPanel[which] = null;
      syncSelectedTokenState(which);
    }

    function closeWordDialog(options) {
      const dialog = wordDialogEl();
      const panel = activeDialogPanel;
      if (dialogSwapTimer) {
        window.clearTimeout(dialogSwapTimer);
        dialogSwapTimer = 0;
      }
      if (dialogCloseTimer) {
        window.clearTimeout(dialogCloseTimer);
        dialogCloseTimer = 0;
      }
      if (dialog && dialog.open && typeof dialog.close === "function") {
        dialog.classList.remove("is-visible");
        dialog.classList.add("is-closing");
        dialogCloseTimer = window.setTimeout(function () {
          suppressDialogCloseHandler = true;
          dialog.close();
          suppressDialogCloseHandler = false;
          dialog.classList.remove("is-closing");
          dialogCloseTimer = 0;
        }, DIALOG_ANIMATION_MS);
      } else if (dialog) {
        dialog.classList.remove("is-visible");
        dialog.classList.remove("is-closing");
      }
      activeDialogPanel = "";
      if (!(options && options.preserveSelection) && panel) {
        clearPanelSelection(panel);
      }
    }

    function closeVerseDialog(options) {
      const dialog = verseDialogEl();
      if (activeDialogPanel === "verse") {
        closeWordDialog();
      } else if (!(options && options.preserveSelection)) {
        clearPanelSelection("verse");
      }
      if (verseDialogSwapTimer) {
        window.clearTimeout(verseDialogSwapTimer);
        verseDialogSwapTimer = 0;
      }
      if (verseDialogCloseTimer) {
        window.clearTimeout(verseDialogCloseTimer);
        verseDialogCloseTimer = 0;
      }
      activeVerseDialog = null;
      syncOpenVerseState();
      if (dialog && dialog.open && typeof dialog.close === "function") {
        dialog.classList.remove("is-visible");
        dialog.classList.add("is-closing");
        verseDialogCloseTimer = window.setTimeout(function () {
          suppressVerseDialogCloseHandler = true;
          dialog.close();
          suppressVerseDialogCloseHandler = false;
          dialog.classList.remove("is-closing");
          verseDialogCloseTimer = 0;
        }, DIALOG_ANIMATION_MS);
      } else if (dialog) {
        dialog.classList.remove("is-visible");
        dialog.classList.remove("is-closing");
      }
    }

    function syncWordDialogFromSelection(which) {
      const dialog = wordDialogEl();
      const body = wordDialogBodyEl();
      const title = wordDialogTitleEl();
      const refEl = wordDialogRefEl();
      if (!dialog || !body || !title || !refEl) return;
      const selection = selectedTokenByPanel[which];
      const token = getTokenFromSelection(selection);
      if (!selection || !token) {
        closeWordDialog();
        return;
      }
      if (dialogCloseTimer) {
        window.clearTimeout(dialogCloseTimer);
        dialogCloseTimer = 0;
      }
      const refLabel = getBookLabelByNumber(selection.book) + " " + selection.chapter + "," + selection.verse;
      title.innerHTML = renderDialogTitle(token.w || "", token.t || "");
      refEl.textContent = refLabel;
      body.innerHTML = renderCardHtml(which);
      body.classList.remove("is-swapping");
      void body.offsetWidth;
      body.classList.add("is-swapping");
      if (dialogSwapTimer) window.clearTimeout(dialogSwapTimer);
      dialogSwapTimer = window.setTimeout(function () {
        body.classList.remove("is-swapping");
        dialogSwapTimer = 0;
      }, DIALOG_ANIMATION_MS);
      activeDialogPanel = which;
      if (!dialog.open) {
        if (typeof dialog.showModal === "function") dialog.showModal();
        else if (typeof dialog.show === "function") dialog.show();
        dialog.classList.remove("is-closing");
        window.requestAnimationFrame(function () {
          dialog.classList.add("is-visible");
        });
      } else {
        dialog.classList.remove("is-closing");
        dialog.classList.add("is-visible");
      }
    }

    function bindWordDialog() {
      const dialog = wordDialogEl();
      if (!dialog || dialog.dataset.greekWordBound === "1") return;
      dialog.dataset.greekWordBound = "1";
      const closeBtn = document.getElementById("greek-word-dialog-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", function () {
          closeWordDialog();
        });
      }
      dialog.addEventListener("cancel", function (event) {
        event.preventDefault();
        closeWordDialog();
      });
      dialog.addEventListener("click", function (event) {
        if (event.target === dialog) closeWordDialog();
      });
      dialog.addEventListener("close", function () {
        if (suppressDialogCloseHandler) return;
        const panel = activeDialogPanel;
        activeDialogPanel = "";
        if (panel) clearPanelSelection(panel);
      });
    }

    function bindVerseDialog() {
      const dialog = verseDialogEl();
      if (!dialog || dialog.dataset.greekVerseBound === "1") return;
      dialog.dataset.greekVerseBound = "1";
      const closeBtn = document.getElementById("greek-verse-dialog-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", function () {
          closeVerseDialog();
        });
      }
      dialog.addEventListener("cancel", function (event) {
        event.preventDefault();
        closeVerseDialog();
      });
      dialog.addEventListener("click", function (event) {
        if (event.target === dialog) closeVerseDialog();
      });
      dialog.addEventListener("close", function () {
        if (suppressVerseDialogCloseHandler) return;
        activeVerseDialog = null;
        syncOpenVerseState();
        clearPanelSelection("verse");
      });
    }

    function renderMorphologyField(value) {
      const summary = String(value || "").trim();
      if (!summary) return "";

      return (
        '<section class="greek-word-sheet__panel greek-word-sheet__panel--morphology">' +
        '<p class="greek-word-sheet__label">' +
        escapeHtml(tt("js.greekTools.labels.morphology")) +
        "</p>" +
        '<p class="greek-word-sheet__morph-summary">' +
        escapeHtml(summary) +
        "</p>" +
        "</section>"
      );
    }

    function renderDialogTitle(word, transliteration) {
      const wordLabel = String(word || "").trim();
      const translitLabel = String(transliteration || "").trim();
      if (!translitLabel) {
        return '<span class="greek-word-dialog__title-main">' + escapeHtml(wordLabel) + "</span>";
      }
      return (
        '<span class="greek-word-dialog__title-main">' +
        escapeHtml(wordLabel) +
        "</span>" +
        '<span class="greek-word-dialog__title-separator" aria-hidden="true">·</span>' +
        '<span class="greek-word-dialog__title-meta">(' +
        escapeHtml(translitLabel) +
        ")</span>"
      );
    }

    function renderSheetField(labelKey, value, panelClassName, valueClassName) {
      if (!value) return "";
      return (
        '<section class="' +
        escapeAttr(panelClassName || "greek-word-sheet__panel") +
        '">' +
        '<p class="greek-word-sheet__label">' +
        escapeHtml(tt("js.greekTools.labels." + labelKey)) +
        "</p>" +
        '<p class="' +
        escapeAttr(valueClassName || "greek-word-sheet__value") +
        '">' +
        escapeHtml(value) +
        "</p>" +
        "</section>"
      );
    }

    function decorateVerseLines(which) {
      const grid = getCompareGridEl(which);
      if (!grid) return;
      const bookByClass = {
        mt: 40,
        mk: 41,
        lk: 42,
        jn: 43,
      };
      grid.querySelectorAll(".text-col").forEach(function (column) {
        let book = null;
        Object.keys(bookByClass).some(function (cls) {
          if (column.classList.contains(cls)) {
            book = bookByClass[cls];
            return true;
          }
          return false;
        });
        if (!book) return;
        column.querySelectorAll(".verse-line").forEach(function (line) {
          const addrEl = line.querySelector(".verse-addr");
          const parts = addrEl ? String(addrEl.textContent || "").split(",") : [];
          const chapter = Number(parts[0]);
          const verse = Number(parts[1]);
          if (!Number.isFinite(chapter) || !Number.isFinite(verse)) return;
          line.setAttribute("data-greek-open-verse", "1");
          line.setAttribute("data-greek-panel", which);
          line.setAttribute("data-greek-book", String(book));
          line.setAttribute("data-greek-chapter", String(chapter));
          line.setAttribute("data-greek-verse", String(verse));
          line.setAttribute("role", "button");
          line.setAttribute("tabindex", "0");
          line.setAttribute("aria-haspopup", "dialog");
          line.setAttribute("aria-pressed", "false");
          line.setAttribute("title", tt("js.greekTools.openVerseTitle", { ref: verseLabel(book, chapter, verse) }));
        });
      });
    }

    function renderTools(which) {
      if (!panelSupportsTools(which)) {
        if (activeDialogPanel === which) closeWordDialog();
        if (activeVerseDialog && activeVerseDialog.sourcePanel === which) closeVerseDialog();
        return;
      }
      decorateVerseLines(which);
      syncOpenVerseState();
    }

    function sameSelection(a, b) {
      return !!(
        a &&
        b &&
        a.book === b.book &&
        a.chapter === b.chapter &&
        a.verse === b.verse &&
        a.index === b.index
      );
    }

    function syncSelectedTokenState(which) {
      const root = panelRootEl(which);
      const selection = selectedTokenByPanel[which];
      if (root) {
        root.querySelectorAll("[data-greek-token-index]").forEach(function (button) {
          const matches =
            !!selection &&
            button.getAttribute("data-greek-book") === String(selection.book) &&
            button.getAttribute("data-greek-chapter") === String(selection.chapter) &&
            button.getAttribute("data-greek-verse") === String(selection.verse) &&
            button.getAttribute("data-greek-token-index") === String(selection.index);
          const related =
            !!selection &&
            !matches &&
            selection.clause &&
            button.getAttribute("data-greek-clause") === selection.clause &&
            button.getAttribute("data-greek-book") === String(selection.book) &&
            button.getAttribute("data-greek-chapter") === String(selection.chapter) &&
            button.getAttribute("data-greek-verse") === String(selection.verse);
          button.classList.toggle("is-selected", matches);
          button.classList.toggle("is-related", related);
        });
      }
      if (which === "verse") syncVerseWordPane();
    }

    function clearSelection(which) {
      if (which === "verse") {
        if (activeDialogPanel === "verse") {
          closeWordDialog();
          return;
        }
        clearPanelSelection("verse");
        return;
      }
      if (activeVerseDialog && activeVerseDialog.sourcePanel === which) {
        closeVerseDialog();
        return;
      }
      if (activeDialogPanel === which) {
        closeWordDialog();
        return;
      }
      clearPanelSelection(which);
    }

    function setSelectedToken(which, selection) {
      if (!selection || (which !== "verse" && !panelSupportsTools(which))) return;
      if (sameSelection(selectedTokenByPanel[which], selection)) return;
      selectedTokenByPanel[which] = selection;
      syncSelectedTokenState(which);
    }

    function selectionFromButton(button) {
      if (!button) return null;
      const which = button.getAttribute("data-greek-panel") || "";
      const book = Number(button.getAttribute("data-greek-book"));
      const chapter = Number(button.getAttribute("data-greek-chapter"));
      const verse = Number(button.getAttribute("data-greek-verse"));
      const index = Number(button.getAttribute("data-greek-token-index"));
      if (!which || !Number.isFinite(book) || !Number.isFinite(chapter) || !Number.isFinite(verse) || !Number.isFinite(index)) {
        return null;
      }
      return {
        book: book,
        chapter: chapter,
        verse: verse,
        index: index,
        clause: button.getAttribute("data-greek-clause") || "",
      };
    }

    async function ensureInterlinearBook(book) {
      const key = String(book);
      if (interlinearBookCache[key]) return interlinearBookCache[key];
      if (interlinearBookPromises[key]) return interlinearBookPromises[key];
      interlinearBookPromises[key] = fetchJson("/data/interlinear/opengnt-gospels/" + key + ".json")
        .then(function (json) {
          interlinearBookCache[key] = json || null;
          delete interlinearBookPromises[key];
          return interlinearBookCache[key];
        })
        .catch(function () {
          interlinearBookCache[key] = null;
          delete interlinearBookPromises[key];
          return null;
        });
      return interlinearBookPromises[key];
    }

    function interlinearMaxVerseMap(book, bookData) {
      if (!bookData || !bookData.verses) return Object.create(null);
      if (bookData._maxVerseMap) return bookData._maxVerseMap;
      const maxV = Object.create(null);
      Object.keys(bookData.verses).forEach(function (verseKey) {
        const parts = verseKey.split(":");
        if (parts.length !== 2) return;
        const chapter = Number(parts[0]);
        const verse = Number(parts[1]);
        if (!Number.isFinite(chapter) || !Number.isFinite(verse)) return;
        const key = String(book) + ":" + String(chapter);
        maxV[key] = Math.max(maxV[key] || 0, verse);
      });
      bookData._maxVerseMap = maxV;
      return maxV;
    }

    function resolveInterlinearBlocks(compareApi, args, bookData) {
      if (!compareApi || typeof compareApi.expandRefToVerses !== "function") return null;
      const ex = compareApi.expandRefToVerses(args.ref, args.book, interlinearMaxVerseMap(args.book, bookData));
      if (!ex.ok) {
        return { ok: false, note: ex.note || "" };
      }
      if (!ex.verses || !ex.verses.length) {
        return { ok: false, note: "Keine Versangaben." };
      }
      return {
        ok: true,
        blocks: ex.verses.map(function (pair) {
          return { ch: pair[0], v: pair[1], text: null };
        }),
      };
    }

    function renderTokenContentHtml(token, mode) {
      const gloss = cleanGloss(token.gl || token.g || "");
      const wordInner =
        (token.p ? '<span class="compare-greek-token__punct compare-greek-token__punct--before">' + escapeHtml(token.p) + "</span>" : "") +
        '<span class="compare-greek-token__word">' + escapeHtml(token.w || "") + "</span>" +
        (token.q ? '<span class="compare-greek-token__punct compare-greek-token__punct--after">' + escapeHtml(token.q) + "</span>" : "");
      return (
        '<span class="compare-greek-token__surface">' +
        wordInner +
        "</span>" +
        (mode === DISPLAY_INTERLINEAR && gloss
          ? '<span class="compare-greek-token__gloss">' + escapeHtml(gloss) + "</span>"
          : "")
      );
    }

    function renderStaticTokenHtml(token) {
      return '<span class="compare-greek-token compare-greek-token--static">' + renderTokenContentHtml(token, DISPLAY_READING) + "</span>";
    }

    function renderTokenHtml(token, book, chapter, verse, index, which, mode) {
      return (
        '<button type="button" class="compare-greek-token compare-greek-token--' +
        escapeAttr(mode) +
        '" data-greek-panel="' +
        escapeAttr(which) +
        '" data-greek-book="' +
        escapeAttr(book) +
        '" data-greek-chapter="' +
        escapeAttr(chapter) +
        '" data-greek-verse="' +
        escapeAttr(verse) +
        '" data-greek-token-index="' +
        escapeAttr(index) +
        '"' +
        (token.cl ? ' data-greek-clause="' + escapeAttr(token.cl) + '"' : "") +
        ' title="' +
        escapeAttr(tokenTitle(token)) +
        '">' +
        renderTokenContentHtml(token, mode) +
        "</button>"
      );
    }

    function renderVerseWordFactHtml(labelKey, value, valueClassName) {
      if (!value) return "";
      return (
        '<div class="greek-verse-word__fact">' +
        '<dt class="greek-verse-word__term">' +
        escapeHtml(tt("js.greekTools.labels." + labelKey)) +
        "</dt>" +
        '<dd class="greek-verse-word__value' +
        (valueClassName ? " " + escapeAttr(valueClassName) : "") +
        '">' +
        escapeHtml(value) +
        "</dd>" +
        "</div>"
      );
    }

    function renderVerseWordPaneHtml() {
      const selection = selectedTokenByPanel.verse;
      const token = getTokenFromSelection(selection);
      if (!selection || !token) {
        return '<div class="greek-verse-word greek-verse-word--empty"><p>' + escapeHtml(tt("js.greekTools.empty.interlinear")) + "</p></div>";
      }

      const morph = describeMorphology(token.m);
      const gloss = cleanGloss(token.gl || token.g || token.lt || token.st || "");
      const word = String(token.w || "").trim();
      const transliteration = String(token.t || "").trim();

      return (
        '<div class="greek-verse-word">' +
        '<h3 class="greek-verse-word__title">' +
        '<span class="greek-verse-word__title-main">' +
        escapeHtml(word) +
        "</span>" +
        (transliteration
          ? '<span class="greek-verse-word__title-meta">(' + escapeHtml(transliteration) + ")</span>"
          : "") +
        "</h3>" +
        (gloss ? '<p class="greek-verse-word__gloss">' + escapeHtml(gloss) + "</p>" : "") +
        '<dl class="greek-verse-word__facts">' +
        renderVerseWordFactHtml("morphology", morph.summary || "") +
        renderVerseWordFactHtml("lemma", token.l || "", "greek-verse-word__value--lemma") +
        renderVerseWordFactHtml("strong", token.s || "", "greek-verse-word__value--strong") +
        "</dl>" +
        "</div>"
      );
    }

    function syncVerseWordPane() {
      const wordPane = verseDialogWordEl();
      if (!wordPane) return;
      wordPane.innerHTML = renderVerseWordPaneHtml();
    }

    function ensureVerseSelection(target, tokens) {
      if (!Array.isArray(tokens) || !tokens.length) return null;
      const existing = selectedTokenByPanel.verse;
      if (
        existing &&
        existing.book === target.book &&
        existing.chapter === target.chapter &&
        existing.verse === target.verse &&
        existing.index >= 0 &&
        existing.index < tokens.length
      ) {
        return existing;
      }
      return {
        book: target.book,
        chapter: target.chapter,
        verse: target.verse,
        index: 0,
        clause: tokens[0] && tokens[0].cl ? tokens[0].cl : "",
      };
    }

    function renderVerseDialogHtml(target, tokens) {
      if (!Array.isArray(tokens) || !tokens.length) {
        return '<div class="compare-greek-card compare-greek-card--empty"><p>' + escapeHtml(tt("js.greekTools.empty.verse")) + "</p></div>";
      }
      return (
        '<div class="greek-verse-layout">' +
        '<section class="greek-verse-layout__verse">' +
        '<p class="greek-verse-layout__hint">' +
        escapeHtml(tt("js.greekTools.verseDialog.hint")) +
        "</p>" +
        '<div class="compare-greek-verse compare-greek-verse--interlinear greek-verse-layout__tokens">' +
        tokens
          .map(function (token, index) {
            return renderTokenHtml(token, target.book, target.chapter, target.verse, index, "verse", DISPLAY_INTERLINEAR);
          })
          .join("") +
        "</div>" +
        "</section>" +
        '<aside class="greek-verse-layout__sidebar">' +
        '<div class="greek-verse-layout__word-pane" id="greek-verse-dialog-word">' +
        renderVerseWordPaneHtml() +
        "</div>" +
        "</aside>" +
        "</div>"
      );
    }

    function verseTargetFromElement(element) {
      if (!element) return null;
      const sourcePanel = element.getAttribute("data-greek-panel") || "";
      const book = Number(element.getAttribute("data-greek-book"));
      const chapter = Number(element.getAttribute("data-greek-chapter"));
      const verse = Number(element.getAttribute("data-greek-verse"));
      if (!sourcePanel || !Number.isFinite(book) || !Number.isFinite(chapter) || !Number.isFinite(verse)) {
        return null;
      }
      return {
        sourcePanel: sourcePanel,
        book: book,
        chapter: chapter,
        verse: verse,
      };
    }

    async function openVerseDialogFromTarget(target) {
      const dialog = verseDialogEl();
      const body = verseDialogBodyEl();
      const title = verseDialogTitleEl();
      const refEl = verseDialogRefEl();
      if (!target || !dialog || !body || !title || !refEl) return;
      if (sameVerseTarget(activeVerseDialog, target) && dialog.open) return;

      const requestSeq = ++verseDialogRequestSeq;
      if (activeDialogPanel === "verse") closeWordDialog();
      clearPanelSelection("verse");
      activeVerseDialog = target;
      syncOpenVerseState();

      if (verseDialogCloseTimer) {
        window.clearTimeout(verseDialogCloseTimer);
        verseDialogCloseTimer = 0;
      }
      refEl.textContent = tt("js.greekTools.verseDialog.title");
      title.textContent = verseLabel(target.book, target.chapter, target.verse);

      body.innerHTML = '<p class="compare-note">' + escapeHtml(tt("js.loadingGreek")) + "</p>";
      if (!dialog.open) {
        if (typeof dialog.showModal === "function") dialog.showModal();
        else if (typeof dialog.show === "function") dialog.show();
        dialog.classList.remove("is-closing");
        window.requestAnimationFrame(function () {
          dialog.classList.add("is-visible");
        });
      } else {
        dialog.classList.remove("is-closing");
        dialog.classList.add("is-visible");
      }

      const bookData = await ensureInterlinearBook(target.book);
      if (requestSeq !== verseDialogRequestSeq || !sameVerseTarget(activeVerseDialog, target)) return;
      const verseMap = bookData && bookData.verses ? bookData.verses : null;
      const tokens = verseMap ? verseMap[target.chapter + ":" + target.verse] : null;
      selectedTokenByPanel.verse = ensureVerseSelection(target, tokens);
      body.innerHTML = renderVerseDialogHtml(target, tokens);
      body.classList.remove("is-swapping");
      void body.offsetWidth;
      body.classList.add("is-swapping");
      if (verseDialogSwapTimer) window.clearTimeout(verseDialogSwapTimer);
      verseDialogSwapTimer = window.setTimeout(function () {
        body.classList.remove("is-swapping");
        verseDialogSwapTimer = 0;
      }, DIALOG_ANIMATION_MS);
      syncSelectedTokenState("verse");
    }

    async function renderColumnHtml(args) {
      const compareApi = window.SYNOPTIC_COMPARE;
      return compareApi && typeof compareApi.renderColumnHtml === "function"
        ? compareApi.renderColumnHtml(args.book, args.label, args.ref, args.cache.idx, args.cache.maxV, args.cache.aliases)
        : "";
    }

    document.addEventListener("click", function (event) {
      const verseLine = event.target.closest("[data-greek-open-verse]");
      if (verseLine) {
        const target = verseTargetFromElement(verseLine);
        if (!target) return;
        event.preventDefault();
        openVerseDialogFromTarget(target);
        return;
      }

      const tokenButton = event.target.closest("[data-greek-token-index]");
      if (!tokenButton) return;
      const selection = selectionFromButton(tokenButton);
      if (!selection) return;
      event.preventDefault();
      const which = tokenButton.getAttribute("data-greek-panel") || "modal";
      setSelectedToken(which, selection);
      if (which !== "verse") syncWordDialogFromSelection(which);
    });

    document.addEventListener("keydown", function (event) {
      const verseLine = event.target.closest("[data-greek-open-verse]");
      if (!verseLine) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      const target = verseTargetFromElement(verseLine);
      if (!target) return;
      event.preventDefault();
      openVerseDialogFromTarget(target);
    });

    bindWordDialog();
    bindVerseDialog();

    return {
      syncPanel: function (which) {
        renderTools(which);
        syncSelectedTokenState(which);
      },
      clearSelection: clearSelection,
      renderColumnHtml: renderColumnHtml,
      supportsEnhancedMode: function (which) {
        return false;
      },
      suppressesVerseMarkers: function (which) {
        return false;
      },
    };
  }

  window.SYNOPSE_GREEK_TOOLS = {
    createGreekCompareTools: createGreekCompareTools,
  };
})();

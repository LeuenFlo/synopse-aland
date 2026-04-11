(function () {
  function createTranslationTools(options) {
    options = options || {};

    var translationLangOrder = options.translationLangOrder || [];
    var translations = options.translations || [];
    var quickTranslationDe = options.quickTranslationDe || "elberfelder_1905";
    var quickTranslationEn = options.quickTranslationEn || "web";
    var quickTranslationFr = options.quickTranslationFr || "segond_1910";
    var quickTranslationIt = options.quickTranslationIt || "riveduta_1927";
    var quickTranslationEs = options.quickTranslationEs || "sparv";
    var quickTranslationLa = options.quickTranslationLa || "vulgate";
    var quickTranslationEl = options.quickTranslationEl || "greek_slb";
    var isCompareHome = !!options.isCompareHome;
    var initialHomeDemoTranslationId = options.initialHomeDemoTranslationId || "";
    var getUiLang =
      options.getUiLang ||
      function () {
        return "de";
      };
    var escapeHtml = options.escapeHtml || function (value) {
      var div = document.createElement("div");
      div.textContent = String(value == null ? "" : value);
      return div.innerHTML;
    };
    var escapeAttr = options.escapeAttr || function (value) {
      return String(value || "").replace(/"/g, "&quot;");
    };
    var lockPageScroll = options.lockPageScroll || function () {};
    var unlockPageScroll = options.unlockPageScroll || function () {};
    var t =
      options.t ||
      function (key, vars) {
        var values = {
          "js.translationUi.unknownTranslation": "Unbekannte Übersetzung",
          "js.translationUi.unknown": "Unbekannt",
          "js.translationUi.invalidJson": "Ungültiges JSON in {path}",
          "js.translationUi.quickRemove": "{label} aus Schnellwahl entfernen",
          "js.translationUi.quickRemoveTitle": "Aus Schnellwahl entfernen",
          "js.translationUi.quickAria": "Lesetext wählen",
          "js.translationUi.morePickerLabelAdd": "Weitere Übersetzungen zur Schnellwahl hinzufügen",
          "js.translationUi.morePickerLabelReplace": "Übersetzungen in der Schnellwahl wechseln",
          "js.translationUi.morePickerTitleAdd": "Weitere Übersetzungen hinzufügen",
          "js.translationUi.morePickerTitleReplace": "Weitere Übersetzungen auswählen oder eine ersetzen",
          "js.translationUi.quickOpenPickerTitle": "Übersetzung ändern",
          "js.translationUi.moreTranslations": "Weitere Übersetzungen",
          "js.translationUi.germanTranslations": "Deutsche Übersetzungen",
          "js.translationUi.ancientLanguages": "Alte Sprachen",
          "js.translationUi.moreLanguages": "Weitere Sprachen",
          "js.translationUi.greek": "Griechisch",
          "js.translationUi.latin": "Latein",
          "js.translationUi.learnMore": "Mehr erfahren",
          "js.translationUi.other": "Sonstige",
          "js.translationUi.shortInfo": "Kurzinfo",
          "js.translationUi.hintFor": "Hinweis zu {label}",
          "js.translationUi.moreInfoPrefix": " Weitere Informationen: ",
          "js.translationPrefix": "Übersetzung: {label}",
          "js.byzantineMeta": "byzantinischer Mehrheitstext (Byz 2013)",
          "js.sblMeta": "textkritische Ausgabe der Society of Biblical Literature",
          "js.greekReferenceMeta": "griechischer Referenztext",
        };
        return String(values[key] || key).replace(/\{(\w+)\}/g, function (_, name) {
          return vars && Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : "";
        });
      };
    var getTranslationLangLabel =
      options.getTranslationLangLabel ||
      function (_, fallback) {
        return fallback || "";
      };

    var translationById = Object.create(null);
    var translationOrderIndexById = Object.create(null);
    translations.forEach(function (translation, index) {
      translationById[translation.id] = translation;
      translationOrderIndexById[translation.id] = index;
    });
    var translationPreferredOrderByLang = {
      de: ["elberfelder_1905", "luther_1912", "zurcher_1931", "menge"],
    };
    var translationPortraitById = {
      menge: { src: "/portraits/menge.jpg", focus: "50% 18%", figure: "Hermann Menge" },
      leonberger_na28: { src: "/portraits/riesner.jpg", focus: "50% 18%", figure: "Rainer Riesner" },
      offene_bibel_studienausgabe: { src: "/portraits/offene-bibel.png", focus: "50% 50%", figure: "Offene-Bibel-Projekt" },
      elberfelder_1905: { src: "/portraits/brockhaus.jpg", focus: "50% 20%", figure: "Carl Brockhaus" },
      luther_1912: { src: "/portraits/luther.jpg", focus: "50% 18%", figure: "Martin Luther" },
      zurcher_1931: { src: "/portraits/zwingli.jpg", focus: "50% 18%", figure: "Huldrych Zwingli" },
      volxbibel_nt: { src: "/portraits/dreyer.jpg", focus: "50% 18%", figure: "Martin Dreyer" },
      greek_slb: { src: "/portraits/text-critical.jpg", focus: "50% 50%", figure: "Michael W. Holmes" },
      byz_2013: { src: "/portraits/byzantine.jpg", focus: "50% 38%", figure: "Maurice A. Robinson · William G. Pierpont" },
      web: { src: "/portraits/web.jpg", focus: "50% 18%", figure: "Michael Paul Johnson" },
      kjv: { src: "/portraits/king-james.jpg", focus: "50% 20%", figure: "King James I" },
      asv: { src: "/portraits/schaff.jpg", focus: "50% 18%", figure: "Philip Schaff" },
      segond_1910: { src: "/portraits/segond.png", focus: "50% 18%", figure: "Louis Segond" },
      riveduta_1927: { src: "/portraits/luzzi.jpeg", focus: "50% 18%", figure: "Giovanni Luzzi" },
      sparv: { src: "/portraits/casiodoro-de-reina_2.jpeg", focus: "50% 18%", figure: "Casiodoro de Reina" },
      vulgate: { src: "/portraits/hieronymus.jpg", focus: "50% 24%", figure: "Hieronymus" },
    };

    function localizedTranslationShortLabel(translation) {
      if (!translation) return "";
      if (translation.id === "greek_slb") {
        return getTranslationLangLabel("el", translation.label);
      }
      return translation.label;
    }

    function localizedTranslationVerboseLabel(translation) {
      if (!translation) return "";
      if (translation.labelLong) return translation.labelLong;
      return localizedTranslationShortLabel(translation);
    }

    function getPrimaryQuickTranslationId() {
      var uiLang = getUiLang();
      var candidate =
        uiLang === "en"
          ? quickTranslationEn
          : uiLang === "fr"
            ? quickTranslationFr
            : uiLang === "it"
              ? quickTranslationIt
              : uiLang === "es"
                ? quickTranslationEs
                : uiLang === "la"
                  ? quickTranslationLa
                  : uiLang === "el"
                    ? quickTranslationEl
                    : quickTranslationDe;
      return translationById[candidate] ? candidate : quickTranslationDe;
    }

    var PINNED_QUICK_STORAGE_KEY = "synopse-pinned-quick-translations";
    var PINNED_QUICK_LEGACY_KEY = "synopse-pinned-quick-translation";
    var MAX_PINNED_QUICK_TRANSLATIONS = 2;

    var pinnedQuickTranslationIds = [];
    var activeTranslationId = getPrimaryQuickTranslationId();
    var homeDemoTranslationId =
      initialHomeDemoTranslationId && translationById[initialHomeDemoTranslationId]
        ? initialHomeDemoTranslationId
        : getPrimaryQuickTranslationId();

    var translationRawCache = Object.create(null);
    var translationVerseCache = Object.create(null);

    var translationPickerOverlay = document.getElementById("translation-picker-overlay");
    var translationPickerCloseTimer = null;
    var reopenPickerAfterInfoClose = false;

    function isQuickPairTranslationId(id) {
      return id === getPrimaryQuickTranslationId() || id === quickTranslationEl;
    }

    function sanitizePinnedQuickIds(arr) {
      var seen = Object.create(null);
      var out = [];
      (arr || []).forEach(function (id) {
        if (!id || seen[id] || !translationById[id] || isQuickPairTranslationId(id)) return;
        seen[id] = true;
        out.push(id);
      });
      return out.slice(0, MAX_PINNED_QUICK_TRANSLATIONS);
    }

    function loadPinnedQuickTranslations() {
      try {
        var raw = localStorage.getItem(PINNED_QUICK_STORAGE_KEY);
        if (raw) {
          var parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            pinnedQuickTranslationIds = sanitizePinnedQuickIds(parsed);
            return;
          }
        }
        var legacy = localStorage.getItem(PINNED_QUICK_LEGACY_KEY);
        if (legacy && translationById[legacy] && !isQuickPairTranslationId(legacy)) {
          pinnedQuickTranslationIds = [legacy];
        }
      } catch (e) {
        /* ignore */
      }
    }

    function persistPinnedQuickTranslations() {
      try {
        localStorage.setItem(PINNED_QUICK_STORAGE_KEY, JSON.stringify(pinnedQuickTranslationIds));
        localStorage.removeItem(PINNED_QUICK_LEGACY_KEY);
      } catch (e) {
        /* ignore */
      }
    }

    function notePinnedTranslationChoice(id) {
      if (isQuickPairTranslationId(id) || !translationById[id]) return;
      if (pinnedQuickTranslationIds.indexOf(id) !== -1) return;
      if (pinnedQuickTranslationIds.length < MAX_PINNED_QUICK_TRANSLATIONS) {
        pinnedQuickTranslationIds.push(id);
      } else {
        pinnedQuickTranslationIds.shift();
        pinnedQuickTranslationIds.push(id);
      }
      persistPinnedQuickTranslations();
    }

    function removePinnedQuickTranslation(id) {
      pinnedQuickTranslationIds = pinnedQuickTranslationIds.filter(function (entry) {
        return entry !== id;
      });
      persistPinnedQuickTranslations();
      if (activeTranslationId === id) {
        activeTranslationId = getPrimaryQuickTranslationId();
      }
    }

    function loadPinnedQuickTranslationsWithMigration() {
      loadPinnedQuickTranslations();
      try {
        if (localStorage.getItem(PINNED_QUICK_LEGACY_KEY) && pinnedQuickTranslationIds.length) {
          persistPinnedQuickTranslations();
        }
      } catch (e) {
        /* ignore */
      }
    }

    async function loadTranslationRaw(id) {
      if (translationRawCache[id]) return translationRawCache[id];
      var translation = translationById[id];
      if (!translation) throw new Error(t("js.translationUi.unknownTranslation") + ": " + id);
      if (id === "elberfelder_1905" && Array.isArray(window.ELBERFELDER_DATA)) {
        translationRawCache[id] = window.ELBERFELDER_DATA;
        return translationRawCache[id];
      }
      var res = await fetch(translation.path);
      if (!res.ok) throw new Error("Konnte Datei nicht laden (" + translation.path + ")");
      var text = await res.text();
      var raw;
      try {
        raw = JSON.parse(text.replace(/^\uFEFF/, ""));
      } catch (parseErr) {
        throw new Error(t("js.translationUi.invalidJson", { path: translation.path }) + (parseErr && parseErr.message ? ": " + parseErr.message : ""));
      }
      translationRawCache[id] = raw;
      return raw;
    }

    async function getVerseCache(id) {
      if (translationVerseCache[id]) return translationVerseCache[id];
      var compareApi = window.SYNOPTIC_COMPARE;
      if (!compareApi || typeof compareApi.initFromTranslationData !== "function") return null;
      var raw = await loadTranslationRaw(id);
      var cache = compareApi.initFromTranslationData(raw);
      translationVerseCache[id] = cache;
      return cache;
    }

    function getActiveTranslationId() {
      return activeTranslationId;
    }

    function setActiveTranslationId(id) {
      if (!translationById[id]) return;
      activeTranslationId = id;
    }

    function getHomeDemoTranslationId() {
      return homeDemoTranslationId;
    }

    function effectiveTranslationId(which) {
      if (isCompareHome && which === "main") return homeDemoTranslationId;
      return activeTranslationId;
    }

    function activeTranslationLabel() {
      var translation = translationById[activeTranslationId];
      return translation ? localizedTranslationShortLabel(translation) : t("js.translationUi.unknown");
    }

    function translationVerboseLabelForId(translationId) {
      var translation = translationById[translationId];
      if (!translation) return t("js.translationUi.unknown");
      return localizedTranslationVerboseLabel(translation);
    }

    function translationIsSourceTextForId(translationId) {
      var translation = translationById[translationId];
      return !!(translation && String(translation.lang) === "el");
    }

    function compareColumnMetaHtmlForTranslation(translationId) {
      if (translationId === "byz_2013") {
        return '<p class="compare-note compare-note--urtext">' + escapeHtml(t("js.byzantineMeta")) + "</p>";
      }
      if (translationId === "greek_slb") {
        return '<p class="compare-note compare-note--urtext">' + escapeHtml(t("js.sblMeta")) + "</p>";
      }
      if (translationIsSourceTextForId(translationId)) {
        return '<p class="compare-note compare-note--urtext">' + escapeHtml(t("js.greekReferenceMeta")) + "</p>";
      }
      return '<p class="compare-note">' + escapeHtml(t("js.translationPrefix", { label: translationVerboseLabelForId(translationId) })) + "</p>";
    }

    function translationGroupLabel(langKey) {
      if (langKey === "_") return t("js.translationUi.other");
      return getTranslationLangLabel(langKey, langKey);
    }

    function translationTeaser(translation) {
      var text = String(translation && translation.info ? translation.info : "")
        .replace(/\s+/g, " ")
        .trim();
      if (!text) return "";
      var sentenceMatch = text.match(/^(.{40,180}?[.!?])(?:\s|$)/);
      var excerpt = sentenceMatch ? sentenceMatch[1] : text;
      if (excerpt.length > 156) {
        excerpt = excerpt.slice(0, 153).replace(/\s+\S*$/, "") + "…";
      }
      return excerpt;
    }

    function translationFigureLabel(translation) {
      var portrait = translation && translation.id ? translationPortraitById[translation.id] : null;
      return portrait && portrait.figure ? portrait.figure : "";
    }

    function translationMetaLabel(translation) {
      if (!translation) return "";
      var parts = [];
      if (translation.lang === "el") parts.push(t("js.translationUi.greek"));
      else if (translation.lang === "la") parts.push(t("js.translationUi.latin"));
      else parts.push(translationGroupLabel(translation.lang || "_"));
      var label = String(translation.labelLong || translation.label || "");
      var yearMatch = label.match(/\b(1[0-9]{3}|20[0-9]{2})\b/);
      if (yearMatch) parts.push(yearMatch[1]);
      return parts.filter(Boolean).join(" · ");
    }

    function translationInfoParagraphs(translation) {
      return String(translation && translation.info ? translation.info : "")
        .split(/\n\s*\n/)
        .map(function (paragraph) {
          return paragraph.replace(/\s+/g, " ").trim();
        })
        .filter(Boolean);
    }

    function translationUsesGreekLabelFont(translation) {
      return !!(
        translation &&
        String(translation.lang) === "el" &&
        translation.id !== "greek_slb"
      );
    }

    function translationLabelClass(translation) {
      return translationUsesGreekLabelFont(translation) ? " translation-label--greek" : "";
    }

    function translationGroupLabelClass(langKey) {
      return "";
    }

    function sortTranslationsForLang(langKey, items) {
      var list = Array.isArray(items) ? items.slice() : [];
      var preferred = translationPreferredOrderByLang[langKey] || [];
      var preferredRankById = Object.create(null);
      preferred.forEach(function (id, index) {
        preferredRankById[id] = index;
      });
      list.sort(function (a, b) {
        var aRank = Object.prototype.hasOwnProperty.call(preferredRankById, a.id) ? preferredRankById[a.id] : Infinity;
        var bRank = Object.prototype.hasOwnProperty.call(preferredRankById, b.id) ? preferredRankById[b.id] : Infinity;
        if (aRank !== bRank) return aRank - bRank;
        return (translationOrderIndexById[a.id] || 0) - (translationOrderIndexById[b.id] || 0);
      });
      return list;
    }

    function getTranslationsByLang() {
      var byLang = Object.create(null);
      translations.forEach(function (translation) {
        var key = translation.lang != null && String(translation.lang) !== "" ? String(translation.lang) : "_";
        if (!byLang[key]) byLang[key] = [];
        byLang[key].push(translation);
      });
      Object.keys(byLang).forEach(function (langKey) {
        byLang[langKey] = sortTranslationsForLang(langKey, byLang[langKey]);
      });
      return byLang;
    }

    function renderTranslationQuickStrip() {
      var extraHtml = "";
      var primaryQuickTranslation = translationById[getPrimaryQuickTranslationId()] || translationById[quickTranslationDe];
      var greekQuickTranslation = translationById[quickTranslationEl];
      pinnedQuickTranslationIds.forEach(function (pinId) {
        var translation = translationById[pinId];
        if (!translation || isQuickPairTranslationId(pinId)) return;
        extraHtml +=
          '<div class="translation-quick__pin-wrap">' +
          '<button type="button" class="translation-quick__btn translation-quick__btn--extra" data-translation="' +
          escapeAttr(translation.id) +
          '" title="' +
          escapeAttr(localizedTranslationShortLabel(translation)) +
          '">' +
          '<span class="translation-quick__primary' + translationLabelClass(translation) + '">' +
          escapeHtml(localizedTranslationShortLabel(translation)) +
          "</span>" +
          "</button>" +
          '<button type="button" class="translation-quick__unpin" data-remove-pinned-translation="' +
          escapeAttr(translation.id) +
          '" aria-label="' +
          escapeAttr(t("js.translationUi.quickRemove", { label: localizedTranslationShortLabel(translation) })) +
          '" title="' +
          escapeAttr(t("js.translationUi.quickRemoveTitle")) +
          '">×</button>' +
          "</div>";
      });
      return (
        '<div class="translation-quick" role="group" aria-label="' + escapeAttr(t("js.translationUi.quickAria")) + '">' +
        '<button type="button" class="translation-quick__btn" data-translation="' +
        escapeAttr(primaryQuickTranslation.id) +
        '">' +
        '<span class="translation-quick__primary' + translationLabelClass(primaryQuickTranslation) + '">' + escapeHtml(localizedTranslationShortLabel(primaryQuickTranslation)) + "</span>" +
        "</button>" +
        (greekQuickTranslation && greekQuickTranslation.id !== primaryQuickTranslation.id
          ? '<button type="button" class="translation-quick__btn" data-translation="' +
            escapeAttr(greekQuickTranslation.id) +
            '">' +
            '<span class="translation-quick__primary' + translationLabelClass(greekQuickTranslation) + '">' +
            escapeHtml(localizedTranslationShortLabel(greekQuickTranslation)) +
            "</span>" +
            "</button>"
          : "") +
        extraHtml +
        "</div>"
      );
    }

    function renderTranslationPickerFull() {
      var byLang = getTranslationsByLang();
      var MODERN_LANG_KEYS = ["en", "fr", "it", "es"];
      var ANCIENT_LANG_KEYS = ["el", "la"];

      function renderOneCard(translation) {
        var active = translation.id === activeTranslationId ? " active" : "";
        var teaser = translationTeaser(translation);
        var figure = translationFigureLabel(translation);
        var infoBtn = translation.info
          ? '<button type="button" class="translation-info-btn translation-info-btn--card" data-translation-info="' +
            escapeAttr(translation.id) +
            '" aria-label="' +
            escapeAttr(t("js.translationUi.hintFor", { label: localizedTranslationShortLabel(translation) })) +
            '" title="' +
            escapeAttr(t("js.translationUi.shortInfo")) +
            '">i</button>'
          : "";
        return (
          '<div class="translation-picker-row">' +
          '<button type="button" class="translation-picker-card' +
          active +
          '" data-translation="' +
          escapeAttr(translation.id) +
          '" aria-label="' +
          escapeAttr(localizedTranslationVerboseLabel(translation)) +
          '">' +
          '<span class="translation-picker-card__body">' +
          '<span class="translation-picker-card__name' +
          translationLabelClass(translation) +
          '">' +
          escapeHtml(localizedTranslationVerboseLabel(translation)) +
          "</span>" +
          (figure
            ? '<span class="translation-picker-card__figure">' + escapeHtml(figure) + "</span>"
            : "") +
          (teaser
            ? '<span class="translation-picker-card__summary">' + escapeHtml(teaser) + "</span>"
            : "") +
          "</span>" +
          "</button>" +
          infoBtn +
          "</div>"
        );
      }

      function sectionForLang(langKey, title) {
        var items = byLang[langKey];
        if (!items || !items.length) return "";
        var cards = items.map(renderOneCard).join("");
        var groupId = langKey === "_" ? "sonstige" : langKey;
        return (
          '<section class="translation-picker-group" aria-labelledby="tp-g-' +
          escapeAttr(groupId) +
          '">' +
          '<h3 class="translation-picker-group__title' + translationGroupLabelClass(langKey) + '" id="tp-g-' +
          escapeAttr(groupId) +
          '">' +
          escapeHtml(title) +
          "</h3>" +
          '<div class="translation-picker-grid">' +
          cards +
          "</div>" +
          "</section>"
        );
      }

      function gridOnlyForLang(langKey) {
        var items = byLang[langKey];
        if (!items || !items.length) return "";
        return items.map(renderOneCard).join("");
      }

      function megaSection(megaId, megaTitle, innerHtml) {
        var body = String(innerHtml || "").trim();
        if (!body) return "";
        return (
          '<section class="translation-picker-mega" aria-labelledby="tp-mega-' +
          escapeAttr(megaId) +
          '">' +
          '<h2 class="translation-picker-mega__title" id="tp-mega-' +
          escapeAttr(megaId) +
          '">' +
          escapeHtml(megaTitle) +
          "</h2>" +
          '<div class="translation-picker-mega__body">' +
          body +
          "</div>" +
          "</section>"
        );
      }

      var blocks = [];
      var deGrid = gridOnlyForLang("de");
      if (deGrid) {
        blocks.push(
          megaSection("de", t("js.translationUi.germanTranslations"), '<div class="translation-picker-grid">' + deGrid + "</div>"),
        );
      }

      var ancientInner = "";
      ANCIENT_LANG_KEYS.forEach(function (key) {
        var title = key === "el" ? t("js.translationUi.greek") : key === "la" ? t("js.translationUi.latin") : translationGroupLabel(key);
        ancientInner += sectionForLang(key, title);
      });
      if (ancientInner) {
        blocks.push(megaSection("ancient", t("js.translationUi.ancientLanguages"), ancientInner));
      }

      var modernInner = "";
      MODERN_LANG_KEYS.forEach(function (key) {
        var block = sectionForLang(key, translationGroupLabel(key));
        if (block) modernInner += block;
      });
      Object.keys(byLang)
        .filter(function (key) {
          if (key === "_" || key === "de") return false;
          if (ANCIENT_LANG_KEYS.indexOf(key) !== -1) return false;
          return MODERN_LANG_KEYS.indexOf(key) === -1;
        })
        .sort()
        .forEach(function (langKey) {
          var block = sectionForLang(langKey, translationGroupLabel(langKey));
          if (block) modernInner += block;
        });
      if (byLang._ && byLang._.length) {
        modernInner += sectionForLang("_", t("js.translationUi.other"));
      }
      if (modernInner) {
        blocks.push(megaSection("more", t("js.translationUi.moreLanguages"), modernInner));
      }

      return '<div class="translation-picker-overview translation-picker-overview--mega">' + blocks.join("") + "</div>";
    }

    function updateMobileTranslationLabel() {
      var labelEl = document.getElementById("translation-lang-mobile-label");
      if (labelEl) labelEl.textContent = activeTranslationLabel();
    }

    function syncTranslationButtons() {
      document.querySelectorAll("button[data-translation]").forEach(function (button) {
        var isActive = button.dataset.translation === activeTranslationId;
        var isQuickButton = button.classList.contains("translation-quick__btn");
        var buttonLabel = String(button.textContent || "").trim();
        var opensPicker = isQuickButton && isActive;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
        button.classList.toggle("translation-quick__btn--opens-picker", opensPicker);
        if (isQuickButton) {
          if (opensPicker) {
            var pickerTitle = t("js.translationUi.quickOpenPickerTitle");
            button.setAttribute("aria-haspopup", "dialog");
            button.setAttribute("aria-controls", "translation-picker-overlay");
            button.setAttribute(
              "aria-expanded",
              translationPickerOverlay && !translationPickerOverlay.hasAttribute("hidden") ? "true" : "false",
            );
            button.setAttribute("title", pickerTitle);
            button.setAttribute("aria-label", buttonLabel + " - " + pickerTitle);
          } else {
            button.removeAttribute("aria-haspopup");
            button.removeAttribute("aria-controls");
            button.removeAttribute("aria-expanded");
            button.setAttribute("title", buttonLabel);
            button.setAttribute("aria-label", buttonLabel);
          }
        }
      });
      document.querySelectorAll(".translation-lang-pick").forEach(function (details) {
        details.open = !!details.querySelector("button[data-translation].active");
      });
      updateMobileTranslationLabel();
    }

    function refreshQuickStripOnly() {
      var quickHtml = renderTranslationQuickStrip();
      var modalButtons = document.getElementById("compare-modal-translation-buttons");
      var mainButtons = document.getElementById("compare-main-translation-buttons");
      if (modalButtons) modalButtons.innerHTML = quickHtml;
      if (mainButtons) mainButtons.innerHTML = quickHtml;
    }

    function refreshTranslationUI() {
      refreshQuickStripOnly();
      var pickerBody = document.getElementById("translation-picker-body");
      if (pickerBody) pickerBody.innerHTML = renderTranslationPickerFull();
      syncTranslationButtons();
    }

    function getTranslationMoreButtons() {
      return document.querySelectorAll("[data-open-translation-picker], .translation-quick__btn--opens-picker");
    }

    function closeTranslationPicker() {
      if (!translationPickerOverlay || translationPickerOverlay.hasAttribute("hidden")) return;
      getTranslationMoreButtons().forEach(function (button) {
        button.setAttribute("aria-expanded", "false");
      });
      translationPickerOverlay.classList.remove("is-visible");
      unlockPageScroll();
      if (translationPickerCloseTimer) {
        clearTimeout(translationPickerCloseTimer);
        translationPickerCloseTimer = null;
      }
      translationPickerCloseTimer = window.setTimeout(function () {
        translationPickerCloseTimer = null;
        translationPickerOverlay.setAttribute("hidden", "");
      }, 380);
    }

    function focusTranslationQuickControl() {
      var trigger = document.querySelector(".translation-quick__btn--opens-picker, [data-open-translation-picker]");
      if (trigger && typeof trigger.focus === "function") {
        trigger.focus();
      }
    }

    function isTranslationPickerOpen() {
      return !!(translationPickerOverlay && !translationPickerOverlay.hasAttribute("hidden"));
    }

    function handleTranslationInfoDialogClose() {
      if (!reopenPickerAfterInfoClose) return;
      reopenPickerAfterInfoClose = false;
      openTranslationPicker();
    }

    function openTranslationInfoDialog(translationId) {
      var translation = translationById[translationId];
      if (!translation || !translation.info) return;
      reopenPickerAfterInfoClose = isTranslationPickerOpen();
      if (reopenPickerAfterInfoClose) {
        closeTranslationPicker();
      }
      var dialog = document.getElementById("translation-info-dialog");
      document.getElementById("translation-info-dialog-title").textContent = localizedTranslationVerboseLabel(translation);
      var kicker = document.getElementById("translation-info-dialog-kicker");
      if (kicker) {
        var metaLabel = translationMetaLabel(translation);
        kicker.textContent = metaLabel;
        kicker.hidden = !metaLabel;
      }
      var figure = document.getElementById("translation-info-dialog-figure");
      if (figure) {
        var figureLabel = translationFigureLabel(translation);
        figure.textContent = figureLabel;
        figure.hidden = !figureLabel;
      }
      var media = document.getElementById("translation-info-dialog-media");
      var image = document.getElementById("translation-info-dialog-image");
      var portrait = translationPortraitById[translation.id];
      if (media && image) {
        if (portrait && portrait.src) {
          image.src = portrait.src;
          image.alt = portrait.figure ? portrait.figure : localizedTranslationVerboseLabel(translation);
          image.style.objectPosition = portrait.focus || "50% 20%";
          media.hidden = false;
        } else {
          image.removeAttribute("src");
          image.alt = "";
          image.style.objectPosition = "";
          media.hidden = true;
        }
      }
      var body = document.getElementById("translation-info-dialog-body");
      body.textContent = "";
      translationInfoParagraphs(translation).forEach(function (paragraphText) {
        var textParagraph = document.createElement("p");
        textParagraph.textContent = paragraphText;
        body.appendChild(textParagraph);
      });
      if (translation.infoUrl) {
        var footer = document.createElement("p");
        footer.className = "translation-info-dialog-actions";
        var link = document.createElement("a");
        link.href = translation.infoUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.className = "translation-info-dialog-link";
        var linkLabel = t("js.translationUi.learnMore");
        try {
          linkLabel += " · " + new URL(translation.infoUrl).hostname.replace(/^www\./, "");
        } catch (e) {
          /* ignore */
        }
        link.textContent = linkLabel;
        footer.appendChild(link);
        body.appendChild(footer);
      }
      if (dialog && typeof dialog.showModal === "function") {
        dialog.showModal();
      }
    }

    function openTranslationPicker() {
      if (!translationPickerOverlay) return;
      if (translationPickerCloseTimer) {
        clearTimeout(translationPickerCloseTimer);
        translationPickerCloseTimer = null;
      }
      var pickerBody = document.getElementById("translation-picker-body");
      if (pickerBody) {
        pickerBody.innerHTML = renderTranslationPickerFull();
        syncTranslationButtons();
      }
      translationPickerOverlay.classList.remove("is-visible");
      translationPickerOverlay.removeAttribute("hidden");
      lockPageScroll();
      getTranslationMoreButtons().forEach(function (button) {
        button.setAttribute("aria-expanded", "true");
      });
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          translationPickerOverlay.classList.add("is-visible");
        });
      });
      window.setTimeout(function () {
        var closeButton = document.getElementById("translation-picker-close");
        if (closeButton && typeof closeButton.focus === "function") closeButton.focus();
      }, 120);
    }

    loadPinnedQuickTranslationsWithMigration();

    return {
      translationById: translationById,
      getPrimaryQuickTranslationId: getPrimaryQuickTranslationId,
      getActiveTranslationId: getActiveTranslationId,
      setActiveTranslationId: setActiveTranslationId,
      getHomeDemoTranslationId: getHomeDemoTranslationId,
      effectiveTranslationId: effectiveTranslationId,
      isQuickPairTranslationId: isQuickPairTranslationId,
      notePinnedTranslationChoice: notePinnedTranslationChoice,
      removePinnedQuickTranslation: removePinnedQuickTranslation,
      getVerseCache: getVerseCache,
      translationVerboseLabelForId: translationVerboseLabelForId,
      translationIsSourceTextForId: translationIsSourceTextForId,
      compareColumnMetaHtmlForTranslation: compareColumnMetaHtmlForTranslation,
      refreshQuickStripOnly: refreshQuickStripOnly,
      refreshTranslationUI: refreshTranslationUI,
      syncTranslationButtons: syncTranslationButtons,
      openTranslationPicker: openTranslationPicker,
      closeTranslationPicker: closeTranslationPicker,
      openTranslationInfoDialog: openTranslationInfoDialog,
      handleTranslationInfoDialogClose: handleTranslationInfoDialogClose,
      focusTranslationQuickControl: focusTranslationQuickControl,
    };
  }

  window.SYNOPSE_TRANSLATIONS = {
    createTranslationTools: createTranslationTools,
  };
})();

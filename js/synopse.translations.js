(function () {
  function createTranslationTools(options) {
    options = options || {};

    var translationLangOrder = options.translationLangOrder || [];
    var translations = options.translations || [];
    var quickTranslationDe = options.quickTranslationDe || "elberfelder_1905";
    var quickTranslationEl = options.quickTranslationEl || "greek_slb";
    var isCompareHome = !!options.isCompareHome;
    var initialHomeDemoTranslationId = options.initialHomeDemoTranslationId || "";
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

    var translationById = Object.create(null);
    translations.forEach(function (translation) {
      translationById[translation.id] = translation;
    });

    var PINNED_QUICK_STORAGE_KEY = "synopse-pinned-quick-translations";
    var PINNED_QUICK_LEGACY_KEY = "synopse-pinned-quick-translation";
    var MAX_PINNED_QUICK_TRANSLATIONS = 2;

    var pinnedQuickTranslationIds = [];
    var activeTranslationId = quickTranslationDe;
    var homeDemoTranslationId =
      initialHomeDemoTranslationId && translationById[initialHomeDemoTranslationId]
        ? initialHomeDemoTranslationId
        : quickTranslationDe;

    var translationRawCache = Object.create(null);
    var translationVerseCache = Object.create(null);

    var translationPickerOverlay = document.getElementById("translation-picker-overlay");
    var translationPickerCloseTimer = null;

    function isQuickPairTranslationId(id) {
      return id === quickTranslationDe || id === quickTranslationEl;
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
        activeTranslationId = quickTranslationDe;
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
      if (!translation) throw new Error("Unbekannte Übersetzung: " + id);
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
        throw new Error(
          "Ungültiges JSON in " +
            translation.path +
            (parseErr && parseErr.message ? ": " + parseErr.message : ""),
        );
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
      return translation ? translation.label : "Unbekannt";
    }

    function translationVerboseLabelForId(translationId) {
      var translation = translationById[translationId];
      if (!translation) return "Unbekannt";
      return translation.labelLong || translation.label;
    }

    function translationIsSourceTextForId(translationId) {
      var translation = translationById[translationId];
      return !!(translation && String(translation.lang) === "el");
    }

    function compareColumnMetaHtmlForTranslation(translationId) {
      if (translationId === "byz_2013") {
        return '<p class="compare-note compare-note--urtext">byzantinischer Mehrheitstext (Byz 2013)</p>';
      }
      if (translationId === "greek_slb") {
        return '<p class="compare-note compare-note--urtext">textkritische Ausgabe der Society of Biblical Literature</p>';
      }
      if (translationIsSourceTextForId(translationId)) {
        return '<p class="compare-note compare-note--urtext">griechischer Referenztext</p>';
      }
      return '<p class="compare-note">Übersetzung: ' + escapeHtml(translationVerboseLabelForId(translationId)) + "</p>";
    }

    function translationGroupLabel(langKey) {
      if (langKey === "_") return "Sonstige";
      var found = translationLangOrder.find(function (group) {
        return group.key === langKey;
      });
      return found ? found.label : langKey;
    }

    function getTranslationsByLang() {
      var byLang = Object.create(null);
      translations.forEach(function (translation) {
        var key = translation.lang != null && String(translation.lang) !== "" ? String(translation.lang) : "_";
        if (!byLang[key]) byLang[key] = [];
        byLang[key].push(translation);
      });
      return byLang;
    }

    function renderTranslationQuickStrip() {
      var extraHtml = "";
      pinnedQuickTranslationIds.forEach(function (pinId) {
        var translation = translationById[pinId];
        if (!translation || isQuickPairTranslationId(pinId)) return;
        extraHtml +=
          '<div class="translation-quick__pin-wrap">' +
          '<button type="button" class="translation-quick__btn translation-quick__btn--extra" data-translation="' +
          escapeAttr(translation.id) +
          '" title="' +
          escapeAttr(translation.label) +
          '">' +
          '<span class="translation-quick__primary">' +
          escapeHtml(translation.label) +
          "</span>" +
          "</button>" +
          '<button type="button" class="translation-quick__unpin" data-remove-pinned-translation="' +
          escapeAttr(translation.id) +
          '" aria-label="' +
          escapeAttr(translation.label + " aus Schnellwahl entfernen") +
          '" title="Aus Schnellwahl entfernen">×</button>' +
          "</div>";
      });
      var extraPinCount = pinnedQuickTranslationIds.filter(function (id) {
        return !isQuickPairTranslationId(id);
      }).length;
      var pinnedQuickSlotsFull = extraPinCount >= MAX_PINNED_QUICK_TRANSLATIONS;
      var morePickerLabel = pinnedQuickSlotsFull
        ? "Übersetzungen in der Schnellwahl wechseln"
        : "Weitere Übersetzungen zur Schnellwahl hinzufügen";
      var morePickerTitle = pinnedQuickSlotsFull
        ? "Weitere Übersetzungen auswählen oder eine ersetzen"
        : "Weitere Übersetzungen hinzufügen";
      var moreButtonInner = '<span class="translation-quick__more-label">Weitere Übersetzungen</span>';
      return (
        '<div class="translation-quick" role="group" aria-label="Lesetext wählen">' +
        '<button type="button" class="translation-quick__btn" data-translation="' +
        escapeAttr(quickTranslationDe) +
        '">' +
        '<span class="translation-quick__primary">Elberfelder 1905</span>' +
        "</button>" +
        '<button type="button" class="translation-quick__btn" data-translation="' +
        escapeAttr(quickTranslationEl) +
        '">' +
        '<span class="translation-quick__primary">Griechisch (Urtext)</span>' +
        "</button>" +
        extraHtml +
        '<button type="button" class="translation-quick__more" data-open-translation-picker ' +
        'aria-haspopup="dialog" aria-expanded="false" aria-controls="translation-picker-overlay" ' +
        'aria-label="' +
        escapeAttr(morePickerLabel) +
        '" title="' +
        escapeAttr(morePickerTitle) +
        '">' +
        moreButtonInner +
        "</button>" +
        "</div>"
      );
    }

    function renderTranslationPickerFull() {
      var byLang = getTranslationsByLang();
      var MODERN_LANG_KEYS = ["en", "fr", "it", "es"];
      var ANCIENT_LANG_KEYS = ["el", "la"];

      function renderOneCard(translation) {
        var active = translation.id === activeTranslationId ? " active" : "";
        var infoBtn = translation.info
          ? '<button type="button" class="translation-info-btn" data-translation-info="' +
            escapeAttr(translation.id) +
            '" aria-label="Hinweis zu ' +
            escapeAttr(translation.label) +
            '" title="Kurzinfo">i</button>'
          : "";
        return (
          '<div class="translation-picker-row">' +
          '<button type="button" class="translation-picker-card' +
          active +
          '" data-translation="' +
          escapeAttr(translation.id) +
          '">' +
          '<span class="translation-picker-card__name">' +
          escapeHtml(translation.labelLong || translation.label) +
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
          '<h3 class="translation-picker-group__title" id="tp-g-' +
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
          megaSection("de", "Deutsche Übersetzungen", '<div class="translation-picker-grid">' + deGrid + "</div>"),
        );
      }

      var ancientInner = "";
      ANCIENT_LANG_KEYS.forEach(function (key) {
        var title = key === "el" ? "Griechisch" : key === "la" ? "Latein" : translationGroupLabel(key);
        ancientInner += sectionForLang(key, title);
      });
      if (ancientInner) {
        blocks.push(megaSection("ancient", "Alte Sprachen", ancientInner));
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
        modernInner += sectionForLang("_", "Sonstige");
      }
      if (modernInner) {
        blocks.push(megaSection("more", "Weitere Sprachen", modernInner));
      }

      return '<div class="translation-picker-overview translation-picker-overview--mega">' + blocks.join("") + "</div>";
    }

    function updateMobileTranslationLabel() {
      var labelEl = document.getElementById("translation-lang-mobile-label");
      if (labelEl) labelEl.textContent = activeTranslationLabel();
    }

    function syncTranslationButtons() {
      document.querySelectorAll("button[data-translation]").forEach(function (button) {
        button.classList.toggle("active", button.dataset.translation === activeTranslationId);
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
      return document.querySelectorAll("[data-open-translation-picker]");
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
      var more = document.querySelector("[data-open-translation-picker]");
      if (more && typeof more.focus === "function") {
        more.focus();
      }
    }

    function openTranslationInfoDialog(translationId) {
      var translation = translationById[translationId];
      if (!translation || !translation.info) return;
      closeTranslationPicker();
      var dialog = document.getElementById("translation-info-dialog");
      document.getElementById("translation-info-dialog-title").textContent = translation.labelLong || translation.label;
      var body = document.getElementById("translation-info-dialog-body");
      body.textContent = "";
      body.appendChild(document.createTextNode(translation.info.trimEnd()));
      if (translation.infoUrl) {
        body.appendChild(document.createTextNode(" Weitere Informationen: "));
        var link = document.createElement("a");
        link.href = translation.infoUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        var linkLabel = "Link";
        try {
          linkLabel = new URL(translation.infoUrl).hostname.replace(/^www\./, "");
        } catch (e) {
          /* ignore */
        }
        link.textContent = linkLabel;
        body.appendChild(link);
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
      focusTranslationQuickControl: focusTranslationQuickControl,
    };
  }

  window.SYNOPSE_TRANSLATIONS = {
    createTranslationTools: createTranslationTools,
  };
})();

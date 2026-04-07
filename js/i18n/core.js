(function () {
  var STORAGE_KEY = "synopse-lang";
  var SUPPORTED_LANGS = ["de", "en", "fr", "it", "es"];
  var COUNTRY_LANG_MAP = {
    AR: "es",
    AT: "de",
    AU: "en",
    BO: "es",
    CL: "es",
    CO: "es",
    CR: "es",
    CU: "es",
    DE: "de",
    DO: "es",
    EC: "es",
    ES: "es",
    FR: "fr",
    GB: "en",
    GT: "es",
    HN: "es",
    IE: "en",
    IT: "it",
    LI: "de",
    MC: "fr",
    MX: "es",
    NI: "es",
    NZ: "en",
    PA: "es",
    PE: "es",
    PR: "es",
    PY: "es",
    SV: "es",
    SM: "it",
    US: "en",
    UY: "es",
    VA: "it",
    VE: "es"
  };
  var MULTILINGUAL_COUNTRY_LANGS = {
    BE: ["fr", "de", "en"],
    CA: ["en", "fr"],
    CH: ["de", "fr", "it"],
    LU: ["de", "fr", "en"]
  };

  function getNavigatorLocales() {
    var locales = [];
    if (Array.isArray(navigator.languages)) locales = locales.concat(navigator.languages);
    if (navigator.language) locales.push(navigator.language);
    if (navigator.userLanguage) locales.push(navigator.userLanguage);
    return locales.filter(Boolean);
  }

  function parseLocale(locale) {
    var normalized = String(locale || "")
      .replace(/_/g, "-")
      .trim();
    var parts = normalized.split("-");
    var language = String(parts[0] || "").toLowerCase();
    var region = "";
    for (var i = 1; i < parts.length; i += 1) {
      if (/^[a-z]{2}$/i.test(parts[i]) || /^\d{3}$/.test(parts[i])) {
        region = parts[i].toUpperCase();
        break;
      }
    }
    return { language: language, region: region };
  }

  function languageFromLocaleRegion(locale) {
    var parsed = parseLocale(locale);
    if (!parsed.region) return "";
    if (COUNTRY_LANG_MAP[parsed.region]) return COUNTRY_LANG_MAP[parsed.region];
    if (
      MULTILINGUAL_COUNTRY_LANGS[parsed.region] &&
      MULTILINGUAL_COUNTRY_LANGS[parsed.region].indexOf(parsed.language) !== -1
    ) {
      return parsed.language;
    }
    return "";
  }

  function pickInitialLang() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (SUPPORTED_LANGS.indexOf(stored) !== -1) return stored;
    } catch (e) {
      /* ignore */
    }
    var locales = getNavigatorLocales();
    for (var i = 0; i < locales.length; i += 1) {
      var candidate = languageFromLocaleRegion(locales[i]);
      if (SUPPORTED_LANGS.indexOf(candidate) !== -1) return candidate;
    }
    return "en";
  }

  var currentLang = pickInitialLang();
  document.documentElement.lang = currentLang;
  document.documentElement.setAttribute("data-ui-lang", currentLang);

  var STRINGS = window.SYNOPSE_I18N_LOCALES || {};
  var EVENT_STRINGS = window.SYNOPSE_I18N_EVENT_LOCALES || {};

function readPath(obj, key) {
    return String(key || "")
      .split(".")
      .reduce(function (acc, part) {
        return acc && typeof acc === "object" ? acc[part] : undefined;
      }, obj);
  }

  function formatString(template, vars) {
    return String(template || "").replace(/\{(\w+)\}/g, function (_, key) {
      return vars && Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : "";
    });
  }

  function t(key, vars) {
    var langTable = STRINGS[currentLang] || STRINGS.de;
    var value = readPath(langTable, key);
    if (value == null) value = readPath(STRINGS.de, key);
    if (typeof value === "string") return formatString(value, vars);
    return value;
  }

  function getLang() {
    return currentLang;
  }

  function setLang(nextLang) {
    if (SUPPORTED_LANGS.indexOf(nextLang) === -1 || nextLang === currentLang) return;
    currentLang = nextLang;
    document.documentElement.lang = currentLang;
    document.documentElement.setAttribute("data-ui-lang", currentLang);
    try {
      localStorage.setItem(STORAGE_KEY, currentLang);
    } catch (e) {
      /* ignore */
    }
    window.location.reload();
  }

  function getRowKey(row) {
    if (!row) return "";
    if (row.aland_no != null && row.aland_no !== "") return String(row.aland_no);
    if (row.row_id != null && row.row_id !== "") return String(row.row_id);
    return "";
  }

  function getEventLocaleValue(lang, kind, row) {
    var key = getRowKey(row);
    if (!key) return "";
    var table = EVENT_STRINGS[lang];
    if (!table || !table[kind]) return "";
    if (table[kind][key]) return table[kind][key];
    if (kind === "titles" && row && row.title && table[kind][row.title]) return table[kind][row.title];
    if (kind === "sections" && row && row.section && table[kind][row.section]) return table[kind][row.section];
    return "";
  }

  function getRowTitle(row) {
    if (!row) return t("js.eventFallback");
    return currentLang === "de"
      ? getEventLocaleValue("de", "titles", row) || row.title_de || row.title || t("js.eventFallback")
      : getEventLocaleValue(currentLang, "titles", row) || getEventLocaleValue("en", "titles", row) || row.title || row.title_de || t("js.eventFallback");
  }

  function getRowSection(row) {
    if (!row) return "";
    return currentLang === "de"
      ? getEventLocaleValue("de", "sections", row) || row.section_de || row.section || ""
      : getEventLocaleValue(currentLang, "sections", row) || getEventLocaleValue("en", "sections", row) || row.section || row.section_de || "";
  }

  function getBookLabel(bookId) {
    return t("js.books." + bookId);
  }

  function getVerseSearchBooks() {
    var books = t("js.searchBooks");
    return {
      matthew: { label: books.matthew.label, refKey: "ref_matthew", maxChapter: 28, aliases: books.matthew.aliases },
      mark: { label: books.mark.label, refKey: "ref_mark", maxChapter: 16, aliases: books.mark.aliases },
      luke: { label: books.luke.label, refKey: "ref_luke", maxChapter: 24, aliases: books.luke.aliases },
      john: { label: books.john.label, refKey: "ref_john", maxChapter: 21, aliases: books.john.aliases },
    };
  }

  function configText(groupKey, id, fallback) {
    return t("config." + groupKey + "." + id) || fallback || "";
  }

  function syncLangSwitches() {
    document.querySelectorAll("[data-lang-switch]").forEach(function (button) {
      var active = button.getAttribute("data-lang-switch") === currentLang;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function bindLangSwitches() {
    document.querySelectorAll("[data-lang-switch]").forEach(function (button) {
      if (button.__synopseLangBound) return;
      button.__synopseLangBound = true;
      button.addEventListener("click", function () {
        setLang(button.getAttribute("data-lang-switch"));
      });
    });
    syncLangSwitches();
  }

  function setText(id, value, isHtml) {
    var el = document.getElementById(id);
    if (!el || value == null) return;
    if (isHtml) el.innerHTML = value;
    else el.textContent = value;
  }

  function setAttr(id, attr, value) {
    var el = document.getElementById(id);
    if (!el || value == null) return;
    el.setAttribute(attr, value);
  }

  function applyMeta(keyPrefix, ogTitleId, descId, ogDescId, ogAltSelector) {
    document.title = t(keyPrefix + "Title");
    setAttr(ogTitleId, "content", t(keyPrefix + "Title"));
    setAttr(descId, "content", t(keyPrefix + "Description"));
    setAttr(ogDescId, "content", t(keyPrefix + "OgDescription"));
    var ogAlt = document.querySelector(ogAltSelector);
    if (ogAlt) ogAlt.setAttribute("content", t("meta.ogImageAlt"));
    var ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute("content", t("meta.ogLocale"));
    var ogSite = document.querySelector('meta[property="og:site_name"]');
    if (ogSite) ogSite.setAttribute("content", t("common.siteTitle"));
  }

  function applyHomeTexts() {
    applyMeta("meta.home", "home-og-title", "home-description-meta", "home-og-description", 'meta[property="og:image:alt"]');
    setText("home-site-mark", t("common.siteTitle"));
    setText("theme-mode-label", t("common.themeMode"));
    setAttr("compare-home-info-btn", "aria-label", t("common.hintNavSources"));
    setAttr("compare-home-info-btn", "title", t("common.hintNavSources"));
    setText("compare-home-intro-heading", t("home.heroTitleHtml"), true);
    setText("home-hero-sub-1", t("home.heroText1"));
    setText("home-hero-sub-2", t("home.heroText2"));
    setText("home-open-search-label", t("common.searchEvent"));
    setText("compare-home-open-example", t("common.example"));
    setText("home-designed-by", t("home.designedBy"), true);
    setText("home-inspired-by", t("home.inspiredBy"), true);
    setAttr("compare-home-example-backdrop", "aria-label", t("common.closeExample"));
    setText("compare-home-example-heading", t("common.exampleEvent"));
    setAttr("compare-home-example-close", "aria-label", t("common.close"));
    setText("translation-picker-title", t("common.allReadingTexts"));
    setAttr("translation-picker-close", "aria-label", t("common.close"));
    setAttr("translation-info-dialog-close", "aria-label", t("common.closeHint"));
    setAttr("site-info-dialog-close", "aria-label", t("common.close"));
    setText("site-info-dialog-title", t("home.siteInfoTitle"));
    setText("site-info-dialog-kicker", t("home.siteInfoKicker"));
    setText("site-info-dialog-p1", t("home.siteInfoP1"), true);
    setText("site-info-dialog-p2", t("home.siteInfoP2"), true);
    setText("site-info-dialog-sources-link", t("common.sources"));
  }

  function applyListTexts() {
    applyMeta("meta.list", "list-og-title", "list-description-meta", "list-og-description", 'meta[property="og:image:alt"]');
    setText("list-back-home", t("common.backHome"));
    setText("list-page-title", t("list.pageTitle"));
    setText("theme-mode-label", t("common.themeMode"));
    setAttr("liste-search-section", "aria-label", t("list.searchArea"));
    setAttr("q", "aria-label", t("list.searchAria"));
    setAttr("q", "placeholder", t("list.searchPlaceholderDesktop"));
    setAttr("q", "data-placeholder-desktop", t("list.searchPlaceholderDesktop"));
    setAttr("q", "data-placeholder-mobile", t("list.searchPlaceholderMobile"));
    setAttr("filter-presets-summary", "title", t("list.filterToggleTitle"));
    setAttr("event-explorer", "aria-label", t("list.chapterNavigation"));
    setAttr("chapter-picker-close", "aria-label", t("common.close"));
    setAttr("list-section", "aria-label", t("list.eventList"));
    setText("section-list-heading-clear", t("list.reset"));
    setText("list-footer-home-link", t("common.backHomeLong"));
    setText("list-footer-sources-link", t("common.sources"));
    setText("list-footer-text", t("list.footerText"), true);
    setAttr("scroll-top-fab", "aria-label", t("common.scrollTop"));
    setAttr("scroll-top-fab", "title", t("common.scrollTopShort"));
    setAttr("compare-translations-bar", "aria-label", t("common.readingTexts"));
    setAttr("compare-modal-actions", "aria-label", t("common.actions"));
    setAttr("compare-modal-close", "aria-label", t("common.close"));
    setText("translation-picker-title", t("common.allReadingTexts"));
    setAttr("translation-picker-close", "aria-label", t("common.close"));
    setAttr("translation-info-dialog-close", "aria-label", t("common.closeHint"));
  }

  function initPage() {
    bindLangSwitches();
    if (document.body.classList.contains("compare-home")) applyHomeTexts();
    if (document.body.classList.contains("liste-page")) applyListTexts();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initPage);
  } else {
    initPage();
  }

  window.SYNOPSE_I18N = {
    initPage: initPage,
    getLang: getLang,
    setLang: setLang,
    t: t,
    getRowTitle: getRowTitle,
    getRowSection: getRowSection,
    getBookLabel: getBookLabel,
    getVerseSearchBooks: getVerseSearchBooks,
    getExplorerGroupLabel: function (id, fallback) {
      return configText("explorerGroups", id, fallback);
    },
    getExplorerTopicLabel: function (id, fallback) {
      return configText("explorerTopics", id, fallback);
    },
    getPresetGroupLabel: function (id, fallback) {
      return configText("presetGroups", id, fallback);
    },
    getPresetLabel: function (id, fallback) {
      return configText("presetLabels", id, fallback);
    },
    getPresetTitle: function (id, fallback) {
      return configText("presetTitles", id, fallback);
    },
    getTranslationLangLabel: function (key, fallback) {
      return configText("translationLangLabels", key, fallback);
    },
  };
})();

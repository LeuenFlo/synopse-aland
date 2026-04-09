(function () {
  var STORAGE_KEY = "synopse-theme";
  var META_LIGHT = "#ffffff";
  var META_DARK = "#0f0f0f";
  var hoverRulesDisabled = false;

  function shouldDisableHoverOnThisDevice() {
    if (typeof window.matchMedia === "function") {
      return window.matchMedia("(hover: none), (pointer: coarse)").matches;
    }
    return false;
  }

  function splitSelectorList(selectorText) {
    var selectors = [];
    var current = "";
    var parenDepth = 0;
    var bracketDepth = 0;

    for (var i = 0; i < selectorText.length; i += 1) {
      var ch = selectorText.charAt(i);
      if (ch === "(") parenDepth += 1;
      else if (ch === ")" && parenDepth > 0) parenDepth -= 1;
      else if (ch === "[") bracketDepth += 1;
      else if (ch === "]" && bracketDepth > 0) bracketDepth -= 1;

      if (ch === "," && parenDepth === 0 && bracketDepth === 0) {
        if (current.trim()) selectors.push(current.trim());
        current = "";
        continue;
      }
      current += ch;
    }

    if (current.trim()) selectors.push(current.trim());
    return selectors;
  }

  function stripHoverSelectorsFromRules(ruleList) {
    var STYLE_RULE = typeof CSSRule !== "undefined" ? CSSRule.STYLE_RULE : 1;
    var IMPORT_RULE = typeof CSSRule !== "undefined" ? CSSRule.IMPORT_RULE : 3;
    var MEDIA_RULE = typeof CSSRule !== "undefined" ? CSSRule.MEDIA_RULE : 4;
    var SUPPORTS_RULE = typeof CSSRule !== "undefined" ? CSSRule.SUPPORTS_RULE : 12;

    if (!ruleList) return;

    for (var i = ruleList.length - 1; i >= 0; i -= 1) {
      var rule = ruleList[i];
      if (!rule) continue;

      if (rule.type === IMPORT_RULE && rule.styleSheet) {
        try {
          stripHoverSelectorsFromRules(rule.styleSheet.cssRules);
        } catch (e) {}
        continue;
      }

      if ((rule.type === MEDIA_RULE || rule.type === SUPPORTS_RULE) && rule.cssRules) {
        stripHoverSelectorsFromRules(rule.cssRules);
        continue;
      }

      if (rule.type !== STYLE_RULE || typeof rule.selectorText !== "string" || rule.selectorText.indexOf(":hover") === -1) {
        continue;
      }

      var keptSelectors = splitSelectorList(rule.selectorText).filter(function (selector) {
        return selector.indexOf(":hover") === -1;
      });

      if (!keptSelectors.length) {
        ruleList.deleteRule(i);
        continue;
      }

      rule.selectorText = keptSelectors.join(", ");
    }
  }

  function disableHoverRulesForTouch() {
    if (hoverRulesDisabled || !shouldDisableHoverOnThisDevice()) return;
    hoverRulesDisabled = true;

    Array.prototype.forEach.call(document.styleSheets, function (sheet) {
      try {
        stripHoverSelectorsFromRules(sheet.cssRules);
      } catch (e) {}
    });
  }

  function getStoredTheme() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v === "dark" || v === "light") return v;
    } catch (e) {}
    return null;
  }

  function applyTheme(theme) {
    if (theme !== "light" && theme !== "dark") theme = "light";
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
    var meta = document.getElementById("meta-theme-color");
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? META_DARK : META_LIGHT);
    }
    var darkOn = theme === "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach(function (el) {
      el.setAttribute("aria-checked", darkOn ? "true" : "false");
    });
  }

  function toggleTheme() {
    var cur =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "dark"
        : "light";
    applyTheme(cur === "dark" ? "light" : "dark");
  }

  function init() {
    disableHoverRulesForTouch();
    var stored = getStoredTheme();
    applyTheme(stored || "light");
    document.querySelectorAll("[data-theme-toggle]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        toggleTheme();
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

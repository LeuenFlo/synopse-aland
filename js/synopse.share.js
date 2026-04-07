(function () {
  function createShareTools(options) {
    options = options || {};

    var shareFeedbackEl = options.shareFeedbackEl || null;
    var buildPericopeUrl = options.buildPericopeUrl;
    var t =
      options.t ||
      function (key) {
        if (key === "js.shareDone") return "Geteilt";
        if (key === "js.shareCopied") return "Link kopiert";
        if (key === "js.shareUnavailable") return "Teilen nicht verfügbar";
        if (key === "js.eventFallback") return "Ereignis";
        return key;
      };
    var getRowTitle =
      options.getRowTitle ||
      function (row) {
        return (row && (row.title_de || row.title)) || t("js.eventFallback");
      };

    var shareFeedbackHideTimer = 0;

    function showShareFeedback(message) {
      if (!shareFeedbackEl) return;
      shareFeedbackEl.textContent = message;
      shareFeedbackEl.hidden = false;
      shareFeedbackEl.classList.remove("is-visible");
      void shareFeedbackEl.offsetWidth;
      shareFeedbackEl.classList.add("is-visible");
      if (shareFeedbackHideTimer) {
        window.clearTimeout(shareFeedbackHideTimer);
      }
      shareFeedbackHideTimer = window.setTimeout(function () {
        shareFeedbackEl.classList.remove("is-visible");
        window.setTimeout(function () {
          shareFeedbackEl.hidden = true;
        }, 220);
        shareFeedbackHideTimer = 0;
      }, 1800);
    }

    function copyTextToClipboard(text) {
      if (
        navigator.clipboard &&
        typeof navigator.clipboard.writeText === "function" &&
        window.isSecureContext
      ) {
        return navigator.clipboard.writeText(text);
      }
      return new Promise(function (resolve, reject) {
        try {
          var textarea = document.createElement("textarea");
          textarea.value = text;
          textarea.setAttribute("readonly", "");
          textarea.style.position = "fixed";
          textarea.style.top = "-9999px";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.focus();
          textarea.select();
          var copied = document.execCommand("copy");
          document.body.removeChild(textarea);
          if (!copied) throw new Error("copy_failed");
          resolve();
        } catch (e) {
          reject(e);
        }
      });
    }

    async function sharePericopeRow(row) {
      if (!row || typeof buildPericopeUrl !== "function") return false;
      var title = getRowTitle(row);
      var url = buildPericopeUrl(row.aland_no);

      if (navigator.share) {
        var variants = [{ url: url }, { title: title, url: url }, { title: title, text: title, url: url }];
        try {
          for (var i = 0; i < variants.length; i += 1) {
            var shareData = variants[i];
            if (navigator.canShare && !navigator.canShare(shareData)) continue;
            await navigator.share(shareData);
            showShareFeedback(t("js.shareDone"));
            return true;
          }
        } catch (e) {
          if (e && e.name === "AbortError") return false;
        }
      }

      try {
        await copyTextToClipboard(url);
        showShareFeedback(t("js.shareCopied"));
        return true;
      } catch (e) {
        showShareFeedback(t("js.shareUnavailable"));
        return false;
      }
    }

    return {
      showShareFeedback: showShareFeedback,
      copyTextToClipboard: copyTextToClipboard,
      sharePericopeRow: sharePericopeRow,
    };
  }

  window.SYNOPSE_SHARE = {
    createShareTools: createShareTools,
  };
})();

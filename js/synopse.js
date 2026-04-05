(function () {
  const data = window.PARALLELS_DATA;
  const listEl = document.getElementById("list");
  const isCompareHome = document.body.classList.contains("compare-home");

  if (!Array.isArray(data) || !data.length) {
    const msg =
      '<div class="empty">Keine Daten — <code>data/parallels_data.js</code> fehlt oder enthält keine Einträge.</div>';
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

  /** Aktiver Aland-Abschnitt (interner Schlüssel) — nur per \`?section=\` gesetzt, kein eigenes UI. */
  let activeSection = "";
  let deepLinkedAlandNo = 0;
  let pendingPericopeOpenAlandNo = 0;
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

  /* 365 Ereignisse im Explorer: genau nach der vorgegebenen 18-Abschnitts-Zuordnung. */
  const explorerTopicGroups = [
    {
      id: "origin",
      label: "Vorbereitung und Herkunft Jesu",
      items: [
        createAlandTopicFromList("preface", "1. Vorspann", [1]),
        createAlandTopicFromList("birth-childhood", "2. Geburt und Kindheit", [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
        createAlandTopicFromList("preparation", "3. Vorbereitung", [13, 14, 15, 16, 17, 18, 19, 20]),
        createAlandTopicFromList(
          "john-public-beginning",
          "4. Beginn des öffentlichen Wirkens Jesu (nach Johannes)",
          [21, 22, 23, 24, 25, 26, 27, 28, 29],
        ),
      ],
    },
    {
      id: "galilee",
      label: "Öffentliches Wirken in Galiläa",
      items: [
        createAlandTopicFromList(
          "galilee-ministry",
          "5. Wirken Jesu in Galiläa",
          [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
        ),
        createAlandTopicFromList(
          "sermon-on-mount",
          "6. Bergpredigt (nach Matthäus)",
          [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76],
        ),
        createAlandTopicFromList("sermon-on-plain", "7. Rede in der Ebene (nach Lukas)", [77, 78, 79, 80, 81, 82, 83]),
        createAlandTopicFromList(
          "galilee-continued",
          "8. Wirken Jesu in Galiläa (Fortsetzung)",
          [
            84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107,
            108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128,
            129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149,
            150, 151, 152, 153, 154, 155, 156,
          ],
        ),
      ],
    },
    {
      id: "journey",
      label: "Weg nach Jerusalem",
      items: [
        createAlandTopicFromList(
          "way-to-cross",
          "9. Der Weg zum Kreuz",
          [157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173],
        ),
        createAlandTopicFromList(
          "last-journey-luke",
          "10. Letzte Reise nach Jerusalem (nach Lukas)",
          [
            174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194,
            195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215,
            216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236,
            237,
          ],
        ),
        createAlandTopicFromList(
          "tabernacles-john",
          "11. Jesus beim Laubhüttenfest (nach Johannes)",
          [238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250],
        ),
        createAlandTopicFromList(
          "judea-ministry",
          "12. Wirken in Judäa",
          [251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268],
        ),
      ],
    },
    {
      id: "jerusalem",
      label: "Wirken in Jerusalem",
      items: [
        createAlandTopicFromList(
          "final-ministry-jerusalem",
          "13. Letztes Wirken in Jerusalem",
          [269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286],
        ),
        createAlandTopicFromList(
          "olivet-discourse",
          "14. Rede vom Ende (Ölbergrede)",
          [287, 288, 289, 290, 291, 292, 293, 294, 295],
        ),
        createAlandTopicFromList(
          "before-passion-conclusion",
          "15. Schluss des Berichts vor der Passion",
          [296, 297, 298, 299, 300, 301, 302, 303, 304],
        ),
      ],
    },
    {
      id: "passion",
      label: "Passion (Leiden und Tod)",
      items: [
        createAlandTopicFromList(
          "passion-narrative",
          "16. Passionsgeschichte",
          [
            305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325,
            326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346,
            347, 348, 349, 350, 351,
          ],
        ),
      ],
    },
    {
      id: "resurrection",
      label: "Auferstehung und Erscheinungen",
      items: [
        createAlandTopicFromList(
          "resurrection",
          "17. Auferstehung",
          [352, 353, 354, 355, 356, 357, 358, 359, 360],
        ),
        createAlandTopicFromList("gospel-endings", "18. Evangelienausgänge", [363, 364, 365, 366, 367]),
      ],
    },
  ];
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

  const presetGroups = [
    {
      label: "Kommt in der Perikope vor",
      presets: [
        {
          id: "has_mt",
          label: "Matthäus",
          title: "Nur Zeilen, in denen Matthäus vorkommt",
        },
        {
          id: "has_mk",
          label: "Markus",
          title: "Nur Zeilen, in denen Markus vorkommt",
        },
        {
          id: "has_lk",
          label: "Lukas",
          title: "Nur Zeilen, in denen Lukas vorkommt",
        },
        {
          id: "has_jn",
          label: "Johannes",
          title: "Nur Zeilen, in denen das Johannesevangelium vorkommt",
        },
      ],
    },
    {
      label: "Muster & Synopse",
      presets: [
        {
          id: "triple",
          label: "In allen Synoptikern",
          title: "Matthäus, Markus und Lukas zugleich (keine reine Joh-Perikope)",
        },
        {
          id: "q",
          label: "Q-Kandidaten",
          title: "Nur Matthäus und Lukas, nicht Markus (typisches Q-Muster)",
        },
        {
          id: "syn_only",
          label: "Ohne Johannes-Evangelium",
          title: "Die Johannes-Spalte ist in dieser Perikope leer (nur Mt/Mk/Lk)",
        },
      ],
    },
    {
      label: "Sondergut",
      presets: [
        {
          id: "sg_mt",
          label: "Matthäus",
          title: "Nur bei Matthäus, bei Markus und Lukas diese Perikope nicht",
        },
        {
          id: "sg_mk",
          label: "Markus",
          title: "Nur bei Markus, bei Matthäus und Lukas nicht",
        },
        {
          id: "sg_lk",
          label: "Lukas",
          title: "Nur bei Lukas, bei Matthäus und Markus nicht",
        },
        {
          id: "sg_jn",
          label: "Johannes",
          title: "Nur im Johannesevangelium, bei keinem der drei Synoptiker",
        },
      ],
    },
  ];
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
  let shareFeedbackHideTimer = 0;

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
      url.pathname = "/liste";
      url.hash = "";
      url.search = "";
      url.searchParams.set("p", String(alandNo));
      return url.toString();
    } catch (e) {
      return "/liste?p=" + encodeURIComponent(String(alandNo));
    }
  }

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
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.top = "-9999px";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (!copied) throw new Error("copy_failed");
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  async function sharePericopeRow(row) {
    if (!row) return false;
    const title = row.title_de || row.title || "Perikope";
    const url = buildPericopeUrl(row.aland_no);
    if (navigator.share) {
      const variants = [
        { url: url },
        { title: title, url: url },
        { title: title, text: title, url: url },
      ];
      try {
        for (let i = 0; i < variants.length; i += 1) {
          const shareData = variants[i];
          if (navigator.canShare && !navigator.canShare(shareData)) continue;
          await navigator.share(shareData);
          showShareFeedback("Geteilt");
          return true;
        }
      } catch (e) {
        if (e && e.name === "AbortError") return false;
      }
    }
    try {
      await copyTextToClipboard(url);
      showShareFeedback("Link kopiert");
      return true;
    } catch (e) {
      showShareFeedback("Teilen nicht verfügbar");
      return false;
    }
  }

  function renderFilterLanding() {
    return `<section class="start-state start-state--filter" aria-label="Filter-Hinweis">
      <p class="start-state__kicker">Filtermodus</p>
      <h2 class="start-state__title">Wähle oben einen Filter</h2>
      <p class="start-state__text">Sobald du einen Filter setzt, erscheinen hier die passenden Ereignisse. Du kannst auch direkt nach einem Ereignistitel suchen.</p>
    </section>`;
  }

  function renderStarterLanding() {
    return `<section class="start-state" aria-label="Einstieg in die Perikopen">
      <h2 class="start-state__title">Perikopen, die dich interessieren könnten</h2>
      <p class="start-state__text">Beim Lesen kannst du Perikopen für später merken. Bis dahin findest du unten ein paar gute Einstiege, mit denen du die Synopse direkt ausprobieren kannst.</p>
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
    const label = sample && sample.section_de ? sample.section_de : sec;
    sectionListHeadingTitleEl.textContent = label;
    sectionListHeadingEl.hidden = false;
    if (sectionListHeadingClearEl) {
      sectionListHeadingClearEl.hidden = false;
    }
  }

  document.querySelectorAll(".filter-acc-panel").forEach(function (panel) {
    panel.addEventListener("toggle", function () {
      if (panel.open) {
        clearPericopeDeepLinkWithoutFiltering();
        clearExplorerSelectionWithoutFiltering();
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
    window.addEventListener("resize", updateFilterToolbarReserveSpace);
    if (filterPresetsBody && typeof ResizeObserver !== "undefined") {
      new ResizeObserver(updateFilterToolbarReserveSpace).observe(filterPresetsBody);
    }
  }

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
    { key: "en", label: "English" },
    { key: "fr", label: "Français" },
    { key: "it", label: "Italiano" },
    { key: "es", label: "Español" },
    { key: "la", label: "Latina" },
    { key: "el", label: "Griechisch · Urtext" },
  ];

  const TRANSLATIONS = [
    {
      id: "menge",
      lang: "de",
      label: "Menge 1939",
      path: "/data/translations/german/menge.json",
      info:
        "Hermann Menge erarbeitete diese Übersetzung bewusst nahe an der Lutherbibel; das Neue Testament erschien 1931, die vollständige Bibel mit Alten Testament folgte 1939 — die Jahreszahl im Namen bezieht sich auf diesen Gesamtstand vor dem Zweiten Weltkrieg. Die Menge-Bibel war im deutschsprachigen Raum eine weit verbreitete Alternative zu Luther und Elberfelder.",
      infoUrl: "https://de.wikipedia.org/wiki/Hermann_Menge",
    },
    {
      id: "leonberger_na28",
      lang: "de",
      label: "Leonberger Bibel 2015",
      path: "/data/translations/german/leonberger_na28.json",
      info:
        "Die Leonberger Bibel ist eine urtextnahe deutschsprachige Übersetzung, die für digitale Nutzung und verschiedene Formate konzipiert ist und laufend überarbeitet wird. Diese Datei entspricht dem Neuen Testament nach dem kritischen Text der 28. Auflage von Nestle-Aland (NA28). Übersetzt wird wörtlich und konsequent bei Schlüsselbegriffen („Konstanz“); es gibt eine alternative NT-Linie nach dem byzantinischen Text (z. B. Robinson-Pierpont). Im Gesamtprojekt dient für das Alte Testament u. a. die Zürcher Bibel (1942) als Grundlage — hier ist nur das NT (NA28) enthalten.",
      infoUrl: "https://bibelberater.de/bibeluebersetzung/leonberger-bibel/",
    },
    {
      id: "offene_bibel_studienausgabe",
      lang: "de",
      label: "Offene Bibel (in Arbeit)",
      path: "/data/translations/german/offene_bibel_studienausgabe.json",
      info:
        "Die Offene Bibel ist ein gemeinschaftliches deutschsprachiges Übersetzungsprojekt; die Studienausgabe verbindet einen verständlichen Wortlaut mit Hinweisen zur Textgestalt. Der Text eignet sich für Vergleiche mit älteren und wörtlicheren deutschen Bibeln.",
      infoUrl: "https://de.wikipedia.org/wiki/Offene_Bibel",
    },
    {
      id: "elberfelder_1905",
      lang: "de",
      label: "Elberfelder 1905",
      path: "/data/translations/german/elberfelder_1905.json",
      info:
        "Die Elberfelder Übersetzung entstand im pietistischen Umfeld und strebt eine möglichst wörtliche Wiedergabe des hebräischen und griechischen Urtextes an. Die hier verwendete Fassung von 1905 gehört zu den klassischen, älteren Elberfelder-Texten vor den späteren grossen Revisionen (ab 1961 bzw. 1985); Sprache und Schreibung sind damit typisch für die Bibeldrucke des frühen 20. Jahrhunderts.",
      infoUrl: "https://de.wikipedia.org/wiki/Elberfelder_Bibel",
    },
    {
      id: "luther_1912",
      lang: "de",
      label: "Luther 1912",
      path: "/data/translations/german/luther_1912.json",
      info:
        "Die Lutherbibel von 1912 ist eine Revision der Übersetzung Martin Luthers (Grundlage 1545) und war im deutschsprachigen Protestantismus lange eine verbreitete Standardfassung, bevor neuere Gesamtausgaben und Überarbeitungen (z. B. 1984, 2017) folgten. Sie bewahrt die vertraute Luther-Sprache, angepasst an Orthographie und Wortgebrauch des ausgehenden Kaiserreichs und der Weimarer Zeit.",
      infoUrl: "https://de.wikipedia.org/wiki/Lutherbibel",
    },
    {
      id: "zurcher_1931",
      lang: "de",
      label: "Zürcher 1931",
      path: "/data/translations/german/zurcher_1931.json",
      info:
        "Die Zürcher Bibel steht in der reformierten Übersetzungstradition (Zwingli-Bibel). Die Ausgabe von 1931 repräsentiert die Zwischenkriegszeit: klare, damals moderne Sprache und die für die Schweiz typische Bibelfassung vor den späteren Überarbeitungen. Sie ist ein guter Bezugspunkt für historischen Sprachduktus der 1930er-Jahre.",
      infoUrl: "https://de.wikipedia.org/wiki/Zürcher_Bibel",
    },
    {
      id: "volxbibel_nt",
      lang: "de",
      label: "Volxbibel 2012",
      path: "/data/translations/german/volxbibel_nt.json",
      info:
        "Die Volxbibel ist eine freie, moderne Bibelübersetzung in Umgangssprache (Projekt u. a. um Martin Dreyer und die Jesus Freaks, seit 2005). Der Text entsteht gemeinschaftlich und wird unter einer Creative-Commons-Lizenz veröffentlicht. In dieser App ist das Neue Testament eingebunden (Stand NT 4.0, wie bei der 2012 veröffentlichten Gesamtausgabe).",
      infoUrl: "https://de.wikipedia.org/wiki/Volxbibel",
    },
    {
      id: "greek_slb",
      lang: "el",
      label: "SBL GNT (textkritisch)",
      path: "/data/translations/greek/greek_slb.json",
      info:
        "Das SBL Greek New Testament (SBLGNT) ist eine kritisch edierte Ausgabe des griechischen Neuen Testaments; die erste Ausgabe erschien 2010 (Society of Biblical Literature). Der Text steht frei in elektronischer Form zur Verfügung und richtet sich an Studium, Lehre und Forschung.",
      infoUrl: "https://www.sblgnt.com/",
    },
    {
      id: "byz_2013",
      lang: "el",
      label: "Byz 2013 (Robinson–Pierpont)",
      path: "/data/translations/greek/byz_2013.json",
      info:
        "The New Testament in the Original Greek: Byzantine Textform (2013), herausgegeben von Maurice A. Robinson und William G. Pierpont — kurz: Robinson–Pierpont Byzantine Text (Revision 2013). „Byzantine Textform“ meint den Mehrheitstext (Majority Text) der griechischen Handschriften: den Text, der in den meisten byzantinischen Manuskripten überliefert ist. Das ist keine Ausgabe des Textus Receptus: Der TR basiert auf wenigen späten Handschriften und historisch gewachsenen Drucktraditionen (Erasmus → Stephanus → Beza → Elzevir) und enthält u. a. in der Offenbarung Rückübersetzungen aus dem Lateinischen; die Byzantine Textform 2013 hingegen basiert auf systematischer Auswertung vieler Handschriften und versucht, den Mehrheitstext wissenschaftlich zu rekonstruieren — konfessionell nicht „überliefert“, sondern kritisch erstellt. Typisch unterscheiden sich Byz und TR u. a. bei der Johannesoffenbarung, bei einigen längeren Lesarten und in Orthographie sowie Wortstellung; Byz wirkt oft gleichmässiger, der TR historisch gewachsen, aber textkritisch uneinheitlicher. In Software wird Byz 2013 gern genutzt, weil der Text frei verfügbar, konsistent und der Manuskriptmehrheit nahe ist — gut für Vergleiche und textkritische Werkzeuge.",
      infoUrl: "https://en.wikipedia.org/wiki/Byzantine_text-type",
    },
    {
      id: "web",
      lang: "en",
      label: "English WEB",
      labelLong: "World English Bible (WEB)",
      path: "/data/translations/english/WEB.json",
      info:
        "The World English Bible (WEB) is a modern English translation in the public domain, derived in part from the American Standard Version (1901). It is widely used for digital distribution and comparison.",
      infoUrl: "https://worldenglish.bible/",
    },
    {
      id: "kjv",
      lang: "en",
      label: "English KJV",
      labelLong: "King James Version (KJV, 1769)",
      path: "/data/translations/english/KJV.json",
      info:
        "King James Version (1769): weit verbreitete englische Bibelübersetzung, sprachlich der frühneuzeitlichen Tradition verbunden. Für Vergleiche mit deutschsprachigen und anderen europäischen Texten geeignet.",
      infoUrl: "https://en.wikipedia.org/wiki/King_James_Version",
    },
    {
      id: "asv",
      lang: "en",
      label: "English ASV",
      labelLong: "American Standard Version (ASV, 1901)",
      path: "/data/translations/english/ASV.json",
      info:
        "American Standard Version (1901): englische Übersetzung mit wörtlicher Ausrichtung, historisch wichtige protestantische Standardbibel vor der modernen Flut an Übersetzungen. Gut vergleichbar mit der KJV-Tradition.",
      infoUrl: "https://en.wikipedia.org/wiki/American_Standard_Version",
    },
    {
      id: "segond_1910",
      lang: "fr",
      label: "Louis Segond 1910",
      path: "/data/translations/french/segond_1910.json",
      info:
        "Die Übersetzung Louis Segond (1910) ist eine verbreitete protestantische Bibel in französischer Sprache, in der Schweiz und Frankreich lange Standard gewesen.",
      infoUrl: "https://fr.wikipedia.org/wiki/Bible_Segond",
    },
    {
      id: "riveduta_1927",
      lang: "it",
      label: "Riveduta 1927",
      path: "/data/translations/italian/riveduta_1927.json",
      info:
        "La Riveduta del 1927 è una traduzione protestante italiana della tradizione della Bibbia Riveduta; lessico e sintassi riflettono l’italiano del primo Novecento. La Nuova Riveduta (es. 1994) è un’edizione separata e tutelata — qui è usata solo la fase 1927 in pubblico dominio.",
      infoUrl: "https://ebible.org/ita1927/",
    },
    {
      id: "sparv",
      lang: "es",
      label: "Reina-Valera 1909",
      path: "/data/translations/spanish/SpaRV.json",
      info:
        "Reina-Valera (hier Ausgabe 1909): weit verbreitete spanische Bibeltradition. Wichtiger Bezug für hispanophone Textvergleiche.",
      infoUrl: "https://es.wikipedia.org/wiki/Reina-Valera",
    },
    {
      id: "vulgate",
      lang: "la",
      label: "Vulgata Clementina",
      path: "/data/translations/latin/VulgClementine.json",
      info:
        "Clementinische Vulgata: lateinische Bibel in der von Papst Clemens VIII. bestätigten Fassung (Sixto-Clementina, 1592); verbreitete katholische Referenz vor modernen Neuausgaben.",
      infoUrl: "https://de.wikipedia.org/wiki/Vulgata",
    },
  ];
  const translationById = Object.create(null);
  TRANSLATIONS.forEach(function (t) {
    translationById[t.id] = t;
  });

  /** Schnellauswahl: Deutsch (Elberfelder) + Griechisch (SBL GNT textkritisch) */
  const QUICK_TRANSLATION_DE = "elberfelder_1905";
  const QUICK_TRANSLATION_EL = "greek_slb";

  function isQuickPairTranslationId(id) {
    return id === QUICK_TRANSLATION_DE || id === QUICK_TRANSLATION_EL;
  }

  /** Bis zu zwei zusätzliche Schnelltasten (neben Elb./Gr.); Reihenfolge = Anheften-Reihenfolge */
  const PINNED_QUICK_STORAGE_KEY = "synopse-pinned-quick-translations";
  const PINNED_QUICK_LEGACY_KEY = "synopse-pinned-quick-translation";
  const MAX_PINNED_QUICK_TRANSLATIONS = 2;
  const FAVORITE_ALANDS_STORAGE_KEY = "synopse-favorite-alands";
  const DEFAULT_STARTER_ALANDS = [18, 269, 352];

  let pinnedQuickTranslationIds = [];
  let favoriteAlandNos = [];

  function sanitizePinnedQuickIds(arr) {
    const seen = Object.create(null);
    const out = [];
    (arr || []).forEach(function (id) {
      if (!id || seen[id] || !translationById[id] || isQuickPairTranslationId(id)) return;
      seen[id] = true;
      out.push(id);
    });
    return out.slice(0, MAX_PINNED_QUICK_TRANSLATIONS);
  }

  function loadPinnedQuickTranslations() {
    try {
      const raw = localStorage.getItem(PINNED_QUICK_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          pinnedQuickTranslationIds = sanitizePinnedQuickIds(parsed);
          return;
        }
      }
      const legacy = localStorage.getItem(PINNED_QUICK_LEGACY_KEY);
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

  /**
   * Nicht-Elb./Gr.-Auswahl: anheften (max. 2; bei Überlauf ältesten Eintrag verdrängen).
   */
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
    pinnedQuickTranslationIds = pinnedQuickTranslationIds.filter(function (x) {
      return x !== id;
    });
    persistPinnedQuickTranslations();
    if (activeTranslationId === id) {
      activeTranslationId = QUICK_TRANSLATION_DE;
    }
  }

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

  loadPinnedQuickTranslations();
  loadFavoriteAlands();
  try {
    if (localStorage.getItem(PINNED_QUICK_LEGACY_KEY) && pinnedQuickTranslationIds.length) {
      persistPinnedQuickTranslations();
    }
  } catch (e) {
    /* ignore */
  }

  let activeTranslationId = QUICK_TRANSLATION_DE;

  /** Auf der Startseite: fester Lesetext für die Demo-Synopse (überschreibbar mit ?translation=) */
  let homeDemoTranslationId = QUICK_TRANSLATION_DE;
  if (isCompareHome) {
    try {
      const params = new URLSearchParams(window.location.search);
      const tr = params.get("translation");
      if (tr && translationById[tr]) homeDemoTranslationId = tr;
    } catch (e) {
      /* ignore */
    }
  }

  function effectiveTranslationId(which) {
    if (isCompareHome && which === "main") return homeDemoTranslationId;
    return activeTranslationId;
  }

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
    const text = await res.text();
    let raw;
    try {
      raw = JSON.parse(text.replace(/^\uFEFF/, ""));
    } catch (parseErr) {
      throw new Error(
        "Ungültiges JSON in " + t.path + (parseErr && parseErr.message ? ": " + parseErr.message : ""),
      );
    }
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

  /** Längere Bezeichnung für Hinweis „Übersetzung: …“ und Karten in der Auswahl (falls labelLong gesetzt) */
  function translationVerboseLabelForId(translationId) {
    const t = translationById[translationId];
    if (!t) return "Unbekannt";
    return t.labelLong || t.label;
  }

  function activeTranslationVerboseLabel() {
    return translationVerboseLabelForId(activeTranslationId);
  }

  function translationIsSourceTextForId(translationId) {
    const t = translationById[translationId];
    return !!(t && String(t.lang) === "el");
  }

  function activeTranslationIsSourceText() {
    return translationIsSourceTextForId(activeTranslationId);
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

  function compareModalColumnMetaHtml() {
    return compareColumnMetaHtmlForTranslation(activeTranslationId);
  }

  function translationGroupLabel(langKey) {
    if (langKey === "_") return "Sonstige";
    const found = TRANSLATION_LANG_ORDER.find(function (g) {
      return g.key === langKey;
    });
    return found ? found.label : langKey;
  }

  function getTranslationsByLang() {
    const byLang = Object.create(null);
    TRANSLATIONS.forEach(function (t) {
      const k = t.lang != null && String(t.lang) !== "" ? String(t.lang) : "_";
      if (!byLang[k]) byLang[k] = [];
      byLang[k].push(t);
    });
    return byLang;
  }

  /** Kompakte Leiste: Elberfelder, Griechisch, bis zu zwei angeheftete Übersetzungen (mit ×), „Weitere Übersetzungen“ / Tausch-Icon */
  function renderTranslationQuickStrip() {
    let extraHtml = "";
    pinnedQuickTranslationIds.forEach(function (pinId) {
      const t = translationById[pinId];
      if (!t || isQuickPairTranslationId(pinId)) return;
      extraHtml +=
        '<div class="translation-quick__pin-wrap">' +
        '<button type="button" class="translation-quick__btn translation-quick__btn--extra" data-translation="' +
        escapeAttr(t.id) +
        '" title="' +
        escapeAttr(t.label) +
        '">' +
        '<span class="translation-quick__primary">' +
        escapeHtml(t.label) +
        "</span>" +
        "</button>" +
        '<button type="button" class="translation-quick__unpin" data-remove-pinned-translation="' +
        escapeAttr(t.id) +
        '" aria-label="' +
        escapeAttr(t.label + " aus Schnellwahl entfernen") +
        '" title="Aus Schnellwahl entfernen">×</button>' +
        "</div>";
    });
    const extraPinCount = pinnedQuickTranslationIds.filter(function (pid) {
      return !isQuickPairTranslationId(pid);
    }).length;
    const pinnedQuickSlotsFull = extraPinCount >= MAX_PINNED_QUICK_TRANSLATIONS;
    const morePickerLabel = pinnedQuickSlotsFull
      ? "Übersetzungen in der Schnellwahl wechseln"
      : "Weitere Übersetzungen zur Schnellwahl hinzufügen";
    const morePickerTitle = pinnedQuickSlotsFull
      ? "Weitere Übersetzungen auswählen oder eine ersetzen"
      : "Weitere Übersetzungen hinzufügen";
    const moreButtonInner = '<span class="translation-quick__more-label">Weitere Übersetzungen</span>';
    return (
      '<div class="translation-quick" role="group" aria-label="Lesetext wählen">' +
      '<button type="button" class="translation-quick__btn" data-translation="' +
      escapeAttr(QUICK_TRANSLATION_DE) +
      '">' +
      '<span class="translation-quick__primary">Elberfelder 1905</span>' +
      "</button>" +
      '<button type="button" class="translation-quick__btn" data-translation="' +
      escapeAttr(QUICK_TRANSLATION_EL) +
      '">' +
      '<span class="translation-quick__primary">Griechisch (SBL)</span>' +
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

  /** Vollständige Übersicht im Overlay: drei Bereiche — Deutsch, Alte Sprachen, Weitere Sprachen */
  function renderTranslationPickerFull() {
    const byLang = getTranslationsByLang();
    const MODERN_LANG_KEYS = ["en", "fr", "it", "es"];
    const ANCIENT_LANG_KEYS = ["el", "la"];

    function renderOneCard(t) {
      const active = t.id === activeTranslationId ? " active" : "";
      const infoBtn = t.info
        ? `<button type="button" class="translation-info-btn" data-translation-info="${escapeAttr(
            t.id,
          )}" aria-label="Hinweis zu ${escapeAttr(t.label)}" title="Kurzinfo">i</button>`
        : "";
      return (
        `<div class="translation-picker-row">` +
        `<button type="button" class="translation-picker-card${active}" data-translation="${escapeAttr(t.id)}">` +
        `<span class="translation-picker-card__name">${escapeHtml(t.labelLong || t.label)}</span>` +
        `</button>${infoBtn}</div>`
      );
    }

    function sectionForLang(langKey, title) {
      const items = byLang[langKey];
      if (!items || !items.length) return "";
      const cards = items.map(renderOneCard).join("");
      const gid = langKey === "_" ? "sonstige" : langKey;
      return (
        `<section class="translation-picker-group" aria-labelledby="tp-g-${escapeAttr(gid)}">` +
        `<h3 class="translation-picker-group__title" id="tp-g-${escapeAttr(gid)}">${escapeHtml(title)}</h3>` +
        `<div class="translation-picker-grid">${cards}</div>` +
        `</section>`
      );
    }

    function gridOnlyForLang(langKey) {
      const items = byLang[langKey];
      if (!items || !items.length) return "";
      return items.map(renderOneCard).join("");
    }

    function megaSection(megaId, megaTitle, innerHtml) {
      const body = String(innerHtml || "").trim();
      if (!body) return "";
      return (
        `<section class="translation-picker-mega" aria-labelledby="tp-mega-${escapeAttr(megaId)}">` +
        `<h2 class="translation-picker-mega__title" id="tp-mega-${escapeAttr(megaId)}">${escapeHtml(megaTitle)}</h2>` +
        `<div class="translation-picker-mega__body">${body}</div>` +
        `</section>`
      );
    }

    const blocks = [];

    const deGrid = gridOnlyForLang("de");
    if (deGrid) {
      blocks.push(
        megaSection("de", "Deutsche Übersetzungen", `<div class="translation-picker-grid">${deGrid}</div>`),
      );
    }

    let ancientInner = "";
    ANCIENT_LANG_KEYS.forEach(function (k) {
      const title =
        k === "el"
          ? "Griechisch"
          : k === "la"
            ? "Latein"
            : translationGroupLabel(k);
      ancientInner += sectionForLang(k, title);
    });
    if (ancientInner) {
      blocks.push(megaSection("ancient", "Alte Sprachen", ancientInner));
    }

    let modernInner = "";
    MODERN_LANG_KEYS.forEach(function (k) {
      const block = sectionForLang(k, translationGroupLabel(k));
      if (block) modernInner += block;
    });
    Object.keys(byLang)
      .filter(function (k) {
        if (k === "_" || k === "de") return false;
        if (ANCIENT_LANG_KEYS.indexOf(k) !== -1) return false;
        return MODERN_LANG_KEYS.indexOf(k) === -1;
      })
      .sort()
      .forEach(function (langKey) {
        const block = sectionForLang(langKey, translationGroupLabel(langKey));
        if (block) modernInner += block;
      });
    if (byLang["_"] && byLang["_"].length) {
      modernInner += sectionForLang("_", "Sonstige");
    }
    if (modernInner) {
      blocks.push(megaSection("more", "Weitere Sprachen", modernInner));
    }

    return `<div class="translation-picker-overview translation-picker-overview--mega">${blocks.join("")}</div>`;
  }

  function openTranslationInfoDialog(translationId) {
    const t = translationById[translationId];
    if (!t || !t.info) return;
    closeTranslationPicker();
    const dlg = document.getElementById("translation-info-dialog");
    document.getElementById("translation-info-dialog-title").textContent = t.labelLong || t.label;
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
    document.querySelectorAll(".translation-lang-pick").forEach(function (det) {
      det.open = !!det.querySelector("button[data-translation].active");
    });
    updateMobileTranslationLabel();
  }

  /** Schnellleiste neu aufbauen (z. B. zusätzlicher Button bei Sonder-Auswahl) */
  function refreshQuickStripOnly() {
    const quickHtml = renderTranslationQuickStrip();
    const modalBtns = document.getElementById("compare-modal-translation-buttons");
    const mainBtns = document.getElementById("compare-main-translation-buttons");
    if (modalBtns) modalBtns.innerHTML = quickHtml;
    if (mainBtns) mainBtns.innerHTML = quickHtml;
  }

  function refreshTranslationUI() {
    refreshQuickStripOnly();
    const pickerBody = document.getElementById("translation-picker-body");
    if (pickerBody) pickerBody.innerHTML = renderTranslationPickerFull();
    syncTranslationButtons();
  }

  const translationPickerOverlay = document.getElementById("translation-picker-overlay");
  let translationPickerCloseTimer = null;

  function getTranslationMoreButtons() {
    return document.querySelectorAll("[data-open-translation-picker]");
  }

  function closeTranslationPicker() {
    if (!translationPickerOverlay || translationPickerOverlay.hasAttribute("hidden")) return;
    getTranslationMoreButtons().forEach(function (btn) {
      btn.setAttribute("aria-expanded", "false");
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
    const more = document.querySelector("[data-open-translation-picker]");
    if (more && typeof more.focus === "function") {
      more.focus();
    }
  }

  function openTranslationPicker() {
    if (!translationPickerOverlay) return;
    if (translationPickerCloseTimer) {
      clearTimeout(translationPickerCloseTimer);
      translationPickerCloseTimer = null;
    }
    const pickerBody = document.getElementById("translation-picker-body");
    if (pickerBody) {
      pickerBody.innerHTML = renderTranslationPickerFull();
      syncTranslationButtons();
    }
    translationPickerOverlay.classList.remove("is-visible");
    translationPickerOverlay.removeAttribute("hidden");
    lockPageScroll();
    getTranslationMoreButtons().forEach(function (btn) {
      btn.setAttribute("aria-expanded", "true");
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        translationPickerOverlay.classList.add("is-visible");
      });
    });
    window.setTimeout(function () {
      const c = document.getElementById("translation-picker-close");
      if (c && typeof c.focus === "function") c.focus();
    }, 120);
  }

  const compareModal = document.getElementById("compare-modal");
  const compareModalBackdrop = document.getElementById("compare-modal-backdrop");
  const compareModalShareBtn = document.getElementById("compare-modal-share");
  const compareModalFavoriteBtn = document.getElementById("compare-modal-favorite");
  const compareModalCloseBtn = document.getElementById("compare-modal-close");
  let compareModalRowId = null;
  let compareMainRowId = null;
  let lastFocusBeforeModal = null;
  let translationSwapSeq = 0;

  function syncGreekScriptClass() {
    const tModal = translationById[activeTranslationId];
    const greekModal = !!(tModal && String(tModal.lang) === "el");
    const mainTid = isCompareHome ? homeDemoTranslationId : activeTranslationId;
    const tMain = translationById[mainTid];
    const greekMain = !!(tMain && String(tMain.lang) === "el");
    const modalPanel = document.getElementById("compare-modal-panel");
    const mainPanel = document.getElementById("compare-main-panel");
    if (modalPanel) modalPanel.classList.toggle("is-greek-script", greekModal);
    if (mainPanel) mainPanel.classList.toggle("is-greek-script", greekMain);
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

  function openCompareModal(wrap) {
    if (!compareModal) return;
    const id = +wrap.dataset.rowId;
    const row = data.find(function (x) {
      return x.row_id === id;
    });
    if (!row) return;

    translationSwapSeq += 1;
    compareModalRowId = id;
    lastFocusBeforeModal = document.activeElement;

    const alandEl = document.getElementById("compare-modal-aland");
    const titleEl = document.getElementById("compare-modal-title");
    const secEl = document.getElementById("compare-modal-sec");
    if (alandEl) alandEl.textContent = "Aland " + row.aland_no;
    if (titleEl) titleEl.textContent = row.title_de || row.title;
    if (secEl) secEl.textContent = row.section_de || row.section || "";
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

  function syncCompareModalFavoriteButton(row) {
    if (!compareModalFavoriteBtn) return;
    const labelEl = compareModalFavoriteBtn.querySelector(".compare-modal-favorite__label");
    if (!row) {
      compareModalFavoriteBtn.hidden = true;
      compareModalFavoriteBtn.classList.remove("is-active");
      compareModalFavoriteBtn.setAttribute("aria-pressed", "false");
      compareModalFavoriteBtn.setAttribute("aria-label", "Merken");
      compareModalFavoriteBtn.title = "Merken";
      if (labelEl) labelEl.textContent = "Merken";
      return;
    }
    const active = isFavoriteAlandNo(row.aland_no);
    compareModalFavoriteBtn.hidden = false;
    compareModalFavoriteBtn.classList.toggle("is-active", active);
    compareModalFavoriteBtn.setAttribute("aria-pressed", active ? "true" : "false");
    compareModalFavoriteBtn.setAttribute("aria-label", active ? "Gemerkt" : "Merken");
    compareModalFavoriteBtn.title = active ? "Gemerkt" : "Merken";
    if (labelEl) labelEl.textContent = active ? "Gemerkt" : "Merken";
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
      "Perikope teilen: " + (row.title_de || row.title || "Perikope"),
    );
    compareModalShareBtn.title = "Perikope teilen";
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
    const filterModeActive = hasOpenFilterPanel() || activePreset !== "all" || Boolean(activeSection);
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
    const alandEl = document.getElementById("compare-main-aland");
    const titleEl = document.getElementById("compare-main-title");
    const secEl = document.getElementById("compare-main-sec");
    if (alandEl) alandEl.textContent = "Aland " + row.aland_no;
    if (titleEl) titleEl.textContent = row.title_de || row.title;
    if (secEl) secEl.textContent = row.section_de || row.section || "";
    grid.dataset.filled = "0";
    grid.classList.remove("is-swapping");
    grid.innerHTML = "";
    fillCompareGrid(grid, row, "main");
  }

  refreshTranslationUI();
  renderExplorerMenu();

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
    activeTranslationId = tBtn.dataset.translation;
    if (!isQuickPairTranslationId(activeTranslationId)) {
      notePinnedTranslationChoice(activeTranslationId);
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

  function triggerCompareGridReveal(grid) {
    if (!grid) return;
    grid.classList.remove("compare-grid--reveal");
    void grid.offsetWidth;
    grid.classList.add("compare-grid--reveal");
  }

  async function fillCompareGrid(grid, r, which) {
    const tid = effectiveTranslationId(which);
    syncGreekScriptClass();
    if (!grid || grid.dataset.filled === "1") return;
    grid.innerHTML =
      '<p class="compare-note">' +
      (translationIsSourceTextForId(tid) ? "Lade griechischen Text …" : "Lade Übersetzung …") +
      "</p>";

    let cache = null;
    const SC = window.SYNOPTIC_COMPARE;
    try {
      cache = await getVerseCache(tid);
    } catch (err) {
      if (!isCompareRowActive(r, which)) return;
      const detail =
        err && err.message
          ? " " + err.message
          : "";
      grid.innerHTML =
        '<p class="compare-note">' +
        (translationIsSourceTextForId(tid)
          ? "Der griechische Text konnte nicht geladen werden."
          : "Übersetzung konnte nicht geladen werden.") +
        escapeHtml(detail) +
        "</p>";
      grid.dataset.filled = "1";
      triggerCompareGridReveal(grid);
      return;
    }
    if (!isCompareRowActive(r, which)) return;
    if (!cache || !SC) {
      grid.innerHTML =
        '<p class="compare-note">' +
        (translationIsSourceTextForId(tid) ? "Keine Textdaten verfügbar." : "Übersetzungsdaten nicht verfügbar.") +
        "</p>";
      grid.dataset.filled = "1";
      triggerCompareGridReveal(grid);
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
      triggerCompareGridReveal(grid);
      return;
    }

    const n = active.length;
    grid.style.gridTemplateColumns = "repeat(" + n + ", minmax(0, 1fr))";

    const colMeta = compareColumnMetaHtmlForTranslation(tid);
    grid.innerHTML = active
      .map((c) => {
        const ref = r[c.refKey] || "";
        const body = SC.renderColumnHtml(c.book, c.label, ref, idx, maxV, aliases);
        return `<div class="text-col ${c.cls}"><h4>${c.label}<span class="ref-tag">${escapeHtml(ref)}</span></h4>${colMeta}<div class="text-col-body">${body}</div></div>`;
      })
      .join("");
    grid.dataset.filled = "1";
    triggerCompareGridReveal(grid);
  }

  function refillCompareGrid(which) {
    const gridId = which === "modal" ? "compare-modal-grid" : "compare-main-grid";
    const rowId = which === "modal" ? compareModalRowId : compareMainRowId;
    const grid = document.getElementById(gridId);
    if (!grid || rowId === null) return;
    const seq = (translationSwapSeq += 1);
    grid.classList.add("is-swapping");
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
      fillCompareGrid(grid, row, which)
        .then(function () {
          if (seq !== translationSwapSeq) return;
          grid.classList.remove("is-swapping");
        })
        .catch(function () {
          grid.classList.remove("is-swapping");
        });
    }, 140);
  }

  function invalidateOpenPanels() {
    refreshQuickStripOnly();
    syncTranslationButtons();
    if (compareModal && compareModal.classList.contains("is-open") && compareModalRowId !== null) {
      refillCompareGrid("modal");
    }
    if (compareMainRowId !== null) {
      refillCompareGrid("main");
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

  function renderRow(r) {
    const title = escapeHtml(r.title_de || r.title);
    return `
      <section class="row-wrap" data-row-id="${r.row_id}" data-aland-no="${r.aland_no}">
        <div class="row row-head" tabindex="0" role="button" aria-label="Versvergleich in Fenster öffnen">
          <div class="row-main">
            <h2>${title}</h2>
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
    if (!listEl) return;
    const qEl = document.getElementById("q");
    const q = (qEl && qEl.value ? qEl.value : "").trim().toLowerCase();
    const sec = activeSection;
    const explorerTopic = explorerTopicById.get(explorerActiveTopicId) || null;
    const hasDefaultState = !q && !sec && !explorerTopic && activePreset === "all";
    const filterModeActive = hasOpenFilterPanel();

    syncExplorerVisibility();

    updateSectionListHeading();

    if (hasDefaultState) {
      const favoriteRows = getFavoriteRows();
      const starterRows = getStarterRows();
      const deepLinkedRow = deepLinkedAlandNo ? rowByAlandNo.get(deepLinkedAlandNo) || null : null;
      const countEl = document.getElementById("count");
      if (countEl) {
        countEl.textContent = filterModeActive
          ? "Filter oder Suche wählen"
          : deepLinkedRow
            ? "Geteilte Perikope"
            : favoriteRows.length
            ? "Deine Merkliste"
            : "";
      }
      if (filterModeActive) {
        listEl.innerHTML = renderFilterLanding();
      } else if (deepLinkedRow) {
        listEl.innerHTML = renderRow(deepLinkedRow);
      } else if (favoriteRows.length) {
        listEl.innerHTML = favoriteRows.map(renderRow).join("");
      } else {
        listEl.innerHTML = renderStarterLanding() + starterRows.map(renderRow).join("");
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

    const countEl = document.getElementById("count");
    if (countEl) {
      countEl.textContent =
        out.length +
        " von " +
        n +
        " Zeilen" +
        (activePreset !== "all" || explorerTopic ? " (Filter aktiv)" : "");
    }
    pulseCountLine();

    if (!out.length) {
      listEl.innerHTML = '<div class="empty">Keine Treffer — Filter lockern oder Suche ändern.</div>';
      scrollListToFirst = false;
      triggerListReveal();
      syncListFabs();
      return;
    }
    listEl.innerHTML = out.map(renderRow).join("");
    triggerListReveal();
    if (scrollListToFirst && out.length) {
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
    qInput.addEventListener("input", function () {
      clearPericopeDeepLinkWithoutFiltering();
      clearExplorerSelectionWithoutFiltering();
      filter();
    });
    qInput.addEventListener("focus", function () {
      clearPericopeDeepLinkWithoutFiltering();
      clearExplorerSelectionWithoutFiltering();
      activePreset = "all";
      syncPresetButtonActiveState();
      activeSection = "";
      document.querySelectorAll(".filter-acc-panel").forEach(function (panel) {
        panel.open = false;
      });
      filter();
    });
  }

  if (explorerChapterEl) {
    explorerChapterEl.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-explorer-group]");
      if (!btn) return;
      clearPericopeDeepLinkWithoutFiltering();
      const nextGroupId = btn.dataset.explorerGroup || "";
      openChapterPicker(nextGroupId, btn);
    });
  }

  if (chapterPickerItemsEl) {
    chapterPickerItemsEl.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-explorer-topic]");
      if (!btn) return;
      clearPericopeDeepLinkWithoutFiltering();
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
      clearPericopeDeepLinkWithoutFiltering();
      clearExplorerSelectionWithoutFiltering();
      activePreset = b.dataset.preset;
      syncPresetButtonActiveState();
      filter();
    });
  }

  const DEFAULT_ALAND_NO = 18;
  if (listEl) {
    try {
      const params = new URLSearchParams(window.location.search);
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
        const wrap = listEl.querySelector(
          '.row-wrap[data-aland-no="' + pendingPericopeOpenAlandNo + '"]',
        );
        if (wrap) openCompareModal(wrap);
        pendingPericopeOpenAlandNo = 0;
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

  getVerseCache(isCompareHome ? homeDemoTranslationId : activeTranslationId).catch(function () {
    // Erstes Laden kann bei lokalen file://-Setups scheitern; wir zeigen den Fehler erst im Panel.
  });
})();

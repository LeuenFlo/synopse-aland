(function () {
  window.SYNOPSE_CONFIG = {
    explorerTopicGroups: [
      {
        id: "origin",
        label: "Vorbereitung und Herkunft Jesu",
        items: [
          { id: "preface", label: "1. Vorspann", alandNos: [1] },
          { id: "birth-childhood", label: "2. Geburt und Kindheit", alandNos: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
          { id: "preparation", label: "3. Vorbereitung", alandNos: [13, 14, 15, 16, 17, 18, 19, 20] },
          {
            id: "john-public-beginning",
            label: "4. Beginn des öffentlichen Wirkens Jesu (nach Johannes)",
            alandNos: [21, 22, 23, 24, 25, 26, 27, 28, 29],
          },
        ],
      },
      {
        id: "galilee",
        label: "Öffentliches Wirken in Galiläa",
        items: [
          {
            id: "galilee-ministry",
            label: "5. Wirken Jesu in Galiläa",
            alandNos: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
          },
          {
            id: "sermon-on-mount",
            label: "6. Bergpredigt (nach Matthäus)",
            alandNos: [50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76],
          },
          { id: "sermon-on-plain", label: "7. Rede in der Ebene (nach Lukas)", alandNos: [77, 78, 79, 80, 81, 82, 83] },
          {
            id: "galilee-continued",
            label: "8. Wirken Jesu in Galiläa (Fortsetzung)",
            alandNos: [
              84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107,
              108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128,
              129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149,
              150, 151, 152, 153, 154, 155, 156,
            ],
          },
        ],
      },
      {
        id: "journey",
        label: "Weg nach Jerusalem",
        items: [
          {
            id: "way-to-cross",
            label: "9. Der Weg zum Kreuz",
            alandNos: [157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173],
          },
          {
            id: "last-journey-luke",
            label: "10. Letzte Reise nach Jerusalem (nach Lukas)",
            alandNos: [
              174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194,
              195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215,
              216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236,
              237,
            ],
          },
          {
            id: "tabernacles-john",
            label: "11. Jesus beim Laubhüttenfest (nach Johannes)",
            alandNos: [238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250],
          },
          {
            id: "judea-ministry",
            label: "12. Wirken in Judäa",
            alandNos: [251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268],
          },
        ],
      },
      {
        id: "jerusalem",
        label: "Wirken in Jerusalem",
        items: [
          {
            id: "final-ministry-jerusalem",
            label: "13. Letztes Wirken in Jerusalem",
            alandNos: [269, 270, 271, 272, 273, 274, 275, 276, 277, 278, 279, 280, 281, 282, 283, 284, 285, 286],
          },
          {
            id: "olivet-discourse",
            label: "14. Rede vom Ende (Ölbergrede)",
            alandNos: [287, 288, 289, 290, 291, 292, 293, 294, 295],
          },
          {
            id: "before-passion-conclusion",
            label: "15. Schluss des Berichts vor der Passion",
            alandNos: [296, 297, 298, 299, 300, 301, 302, 303, 304],
          },
        ],
      },
      {
        id: "passion",
        label: "Passion (Leiden und Tod)",
        items: [
          {
            id: "passion-narrative",
            label: "16. Passionsgeschichte",
            alandNos: [
              305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322, 323, 324, 325,
              326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337, 338, 339, 340, 341, 342, 343, 344, 345, 346,
              347, 348, 349, 350, 351,
            ],
          },
        ],
      },
      {
        id: "resurrection",
        label: "Auferstehung und Erscheinungen",
        items: [
          {
            id: "resurrection",
            label: "17. Auferstehung",
            alandNos: [352, 353, 354, 355, 356, 357, 358, 359, 360],
          },
          { id: "gospel-endings", label: "18. Evangelienausgänge", alandNos: [363, 364, 365, 366, 367] },
        ],
      },
    ],
    presetGroups: [
      {
        id: "occurrence",
        label: "Kommt im Ereignis vor",
        presets: [
          { id: "has_mt", label: "Matthäus", title: "Nur Zeilen, in denen Matthäus vorkommt" },
          { id: "has_mk", label: "Markus", title: "Nur Zeilen, in denen Markus vorkommt" },
          { id: "has_lk", label: "Lukas", title: "Nur Zeilen, in denen Lukas vorkommt" },
          { id: "has_jn", label: "Johannes", title: "Nur Zeilen, in denen das Johannesevangelium vorkommt" },
        ],
      },
      {
        id: "patterns",
        label: "Muster & Synopse",
        presets: [
          {
            id: "triple",
            label: "In allen Synoptikern",
            title: "Matthäus, Markus und Lukas zugleich (kein reines Johannes-Ereignis)",
          },
          {
            id: "q",
            label: "Q-Kandidaten",
            title: "Nur Matthäus und Lukas, nicht Markus (typisches Q-Muster)",
          },
          {
            id: "syn_only",
            label: "Ohne Johannes-Evangelium",
            title: "Die Johannes-Spalte ist in diesem Ereignis leer (nur Mt/Mk/Lk)",
          },
        ],
      },
      {
        id: "unique",
        label: "Sondergut",
        presets: [
          {
            id: "sg_mt",
            label: "Matthäus",
            title: "Nur bei Matthäus, bei Markus und Lukas dieses Ereignis nicht",
          },
          { id: "sg_mk", label: "Markus", title: "Nur bei Markus, bei Matthäus und Lukas nicht" },
          { id: "sg_lk", label: "Lukas", title: "Nur bei Lukas, bei Matthäus und Markus nicht" },
          {
            id: "sg_jn",
            label: "Johannes",
            title: "Nur im Johannesevangelium, bei keinem der drei Synoptiker",
          },
        ],
      },
    ],
    translationLangOrder: [
      { key: "de", label: "Deutsch" },
      { key: "en", label: "English" },
      { key: "fr", label: "Français" },
      { key: "it", label: "Italiano" },
      { key: "es", label: "Español" },
      { key: "la", label: "Latina" },
      { key: "el", label: "Greek" },
    ],
    translations: [
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
        label: "Greek",
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
        label: "World English Translation",
        labelLong: "World English Translation (WEB)",
        path: "/data/translations/english/WEB.json",
        info:
          "The World English Translation (WEB) is a modern English translation in the public domain, derived in part from the American Standard Version (1901). It is widely used for digital distribution and comparison.",
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
    ],
    quickTranslationDe: "elberfelder_1905",
    quickTranslationEn: "web",
    quickTranslationFr: "segond_1910",
    quickTranslationIt: "riveduta_1927",
    quickTranslationEs: "sparv",
    quickTranslationEl: "greek_slb",
    defaultStarterAlands: [18, 269, 352],
  };
})();

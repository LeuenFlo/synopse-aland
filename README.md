# Synopse der vier Evangelien

Statische Website zum parallelen Lesen und Vergleichen von Ereignissen aus Matthäus, Markus, Lukas und Johannes in Anlehnung an Kurt Alands *Synopsis Quattuor Evangeliorum*.

## Projektstruktur

- `index.html`: Startseite mit Einführung und Beispielansicht
- `liste/index.html`: Suche, Filter, Kapitelwahl und Detailansicht der Ereignisse
- `sources/index.html`: Hinweise zu Datengrundlagen, Texten und Lizenzen
- `data/parallels_data.js`: Laufzeitdaten der Synopse für die Website
- `data/translations/...`: Bibeltexte und Sprachfassungen für den Vergleich

## JavaScript

- `js/synopse.js`: Bootstrap und Hauptsteuerung der Suchseite und Vergleichsansicht
- `js/synopse.config.js`: zentrale Konfiguration für Kapitelstruktur, Filtergruppen und Übersetzungen
- `js/synopse.search.js`: Hilfen für Suchfeld, Bibelstellen-Erkennung und Deduplizierung
- `js/synopse.share.js`: Teilen, Link-Erzeugung und Share-Feedback
- `js/synopse.translations.js`: Übersetzungszustand, Caches, Quick-Strip und Sprachpicker
- `js/compare_text.js`: Auflösung der Stellenangaben und Aufbau der Vergleichstexte
- `js/theme-head.js`: frühe Theme-Initialisierung vor dem Rendern
- `js/theme.js`: Theme-Schalter und Persistenz
- `js/plausible-init.js`: lokale Einbindung des Plausible-Snippets

## CSS

- `css/synopse.css`: zentrale Einstiegdatei, lädt die Teilstyles
- `css/base.css`: Grundlayout, Theme, Suche, Filter und Listenbasis
- `css/translations.css`: Übersetzungswahl, Sprachpicker und textbezogene UI
- `css/shared.css`: geteilte Footer-, Sources-, FAB- und Feedback-Styles
- `css/compare.css`: Vergleichsfenster und Vergleichs-Responsive-Logik
- `css/pages.css`: Seiten-spezifische Bereiche für Landing, Suche und Kapitelwahl

## Lokal verwenden

Die Website sollte über einen lokalen Webserver geöffnet werden, nicht direkt über `file://`, damit Daten und Übersetzungen zuverlässig geladen werden.

Zum Beispiel:

- `python3 -m http.server 3000`
- danach `http://localhost:3000` öffnen

## Hinweise

- `data/parallels_data.js` ist laut Dateikopf ein Build-Artefakt und sollte nicht manuell bearbeitet werden.
- Übersetzungen liegen unter `data/translations/...`.
- Die Seite verwendet keinen Build-Schritt; alle Dateien werden statisch direkt im Browser geladen.

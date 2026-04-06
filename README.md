# Synopse der vier Evangelien

Statische Website zum parallelen Lesen und Vergleichen von Ereignissen aus Matthäus, Markus, Lukas und Johannes in Anlehnung an Kurt Alands *Synopsis Quattuor Evangeliorum*.

## Projektstruktur

- `index.html`: Startseite mit Einführung und Beispielansicht
- `liste/index.html`: Suche, Filter, Kapitelwahl und Detailansicht der Ereignisse
- `quellen-und-lizenzen.html`: Hinweise zu Datengrundlagen, Texten und Lizenzen
- `js/synopse.js`: Hauptlogik für Suche, Filter, Favoriten, Sharing und Vergleichsansicht
- `js/synopse.config.js`: zentrale Konfiguration für Kapitelstruktur, Filtergruppen und Übersetzungen
- `compare_text.js`: Auflösung der Stellenangaben und Aufbau der Vergleichstexte
- `css/synopse.css`: zentrales Styling für alle Seiten
- `data/parallels_data.js`: Laufzeitdaten der Synopse für die Website

## Lokal verwenden

Die Website sollte über einen lokalen Webserver geöffnet werden, nicht direkt über `file://`, damit Daten und Übersetzungen zuverlässig geladen werden.

## Hinweise

- `data/parallels_data.js` ist laut Dateikopf ein Build-Artefakt und sollte nicht manuell bearbeitet werden.
- Übersetzungen liegen unter `data/translations/...`.

# Automatische MP4-Umwandlung auf dem Mac (Anleitung ohne Vorkenntnisse)

Warum: Videos im QuickTime-Format (`.mov`, oft ProRes/HEVC) zeigen Chrome, Edge und Firefox nur als
schwarzes Bild mit Ton. Dieser kleine Hintergrunddienst legt automatisch neben jede `.mov`-Datei eine
browserfreundliche `…_web.mp4` in Dropbox. Das Freigabetool erkennt sie beim nächsten Import selbst und
spielt dann automatisch die MP4 ab – das Original bleibt als Download erhalten.

**Wichtig:** Liegt zu einer Folge bereits eine MP4 (z. B. dein Export aus Adobe Media Encoder,
`Folge01.mp4`), macht das Skript nichts. Dein manueller Export hat immer Vorrang.

---

## Schritt 1 – Terminal öffnen

Tastenkombination `⌘` + `Leertaste`, „Terminal“ tippen, Enter.

## Schritt 2 – Diesen Projektordner auf den Mac holen

Falls du das Projekt noch nicht lokal hast: In Lovable oben rechts über GitHub das Repository klonen,
oder die zwei Dateien `mov-to-mp4-watch.sh` und `install-mov-to-mp4.sh` aus `scripts/mac/` herunterladen
und in einen Ordner legen (z. B. `~/Downloads/marketing-station`).

## Schritt 3 – Einrichtung starten

Im Terminal eintippen (bzw. kopieren), dabei den Pfad zum Ordner anpassen:

```bash
bash ~/Downloads/marketing-station/scripts/mac/install-mov-to-mp4.sh
```

Das Skript macht alles Nötige:

1. installiert **Homebrew** (falls noch nicht vorhanden – dabei wird dein Mac-Passwort abgefragt),
2. installiert **ffmpeg** (das Umwandlungsprogramm),
3. fragt nach deinem **Dropbox-Ordner** – du kannst den Ordner aus dem Finder einfach ins Terminalfenster
   ziehen und Enter drücken,
4. richtet den **Hintergrunddienst** ein und startet ihn sofort.

Beim ersten Lauf fragt macOS eventuell nach Zugriff auf den Ordner „Dropbox“ – bitte erlauben.

## Schritt 4 – Kontrolle

```bash
launchctl list | grep de.marketingstation.movwatch
```

Erscheint eine Zeile, läuft der Dienst. Was er gerade tut, siehst du hier:

```bash
tail -f ~/Library/Logs/marketing-station-movwatch.log
```

(Beenden mit `Strg` + `C` – der Dienst läuft weiter.)

## Schritt 5 – Fertig

Ab jetzt gilt: `.mov` in Dropbox legen → nach einigen Minuten liegt `…_web.mp4` daneben → beim nächsten
Dropbox-Import im Freigabetool wird automatisch die MP4 abgespielt. Bereits importierte Folgen werden
beim nächsten Scan automatisch auf die MP4 umgestellt (Untertitel, Freigaben und Anmerkungen bleiben
erhalten).

---

## Nützliche Befehle

| Zweck | Befehl |
| --- | --- |
| Status | `launchctl list \| grep de.marketingstation.movwatch` |
| Log ansehen | `tail -f ~/Library/Logs/marketing-station-movwatch.log` |
| Dienst stoppen | `launchctl unload ~/Library/LaunchAgents/de.marketingstation.movwatch.plist` |
| Dienst starten | `launchctl load ~/Library/LaunchAgents/de.marketingstation.movwatch.plist` |
| Anderen Ordner wählen | Einrichtungsskript aus Schritt 3 einfach erneut ausführen |

## Wenn eine Datei nicht umgewandelt wurde

1. Log prüfen (siehe oben) – dort steht der Dateiname mit „FEHLER“.
2. Fehlgeschlagene Dateien werden gemerkt, damit sie nicht endlos wiederholt werden. Zum erneuten
   Versuchen die Merkliste leeren:
   ```bash
   : > ~/.marketing-station-movwatch.done
   ```
3. Manuell umwandeln geht immer:
   ```bash
   ffmpeg -i "/Pfad/zur/Datei.mov" -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p \
     -c:a aac -b:a 192k -movflags +faststart "/Pfad/zur/Datei_web.mp4"
   ```

## Zusammenspiel mit der Whisper-Transkription

Der Watcher aus `scripts/whisper-watch.sh` (SRT-Erzeugung) kann parallel laufen – beide arbeiten im
selben Ordner und stören sich nicht. Die Untertitel werden weiterhin über den Basisnamen zugeordnet;
eine `…_web.mp4` erzeugt keine zweite Folge im Freigabetool.

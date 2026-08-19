#!/usr/bin/env bash
# Einmalige Einrichtung auf dem Mac: installiert ffmpeg (via Homebrew) und
# richtet den Hintergrunddienst ein, der .mov-Dateien in Dropbox automatisch
# in browserfreundliche MP4-Versionen umwandelt.
#
# Start:  bash scripts/mac/install-mov-to-mp4.sh

set -euo pipefail

LABEL="de.marketingstation.movwatch"
TARGET_DIR="$HOME/.marketing-station"
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"
LOG="$HOME/Library/Logs/marketing-station-movwatch.log"
SRC="$(cd "$(dirname "$0")" && pwd)/mov-to-mp4-watch.sh"

echo "== Marketing Station · automatische MP4-Umwandlung =="

# 1. Homebrew
if ! command -v brew >/dev/null 2>&1; then
  echo "-> Installiere Homebrew (dauert ein paar Minuten, Passwort wird abgefragt)…"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  eval "$(/opt/homebrew/bin/brew shellenv 2>/dev/null || /usr/local/bin/brew shellenv)"
fi

# 2. ffmpeg
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "-> Installiere ffmpeg…"
  brew install ffmpeg
fi
FFMPEG_BIN="$(command -v ffmpeg)"
echo "   ffmpeg: $FFMPEG_BIN"

# 3. Dropbox-Ordner erfragen
DEFAULT_DIR="$HOME/Dropbox"
echo
echo "Welcher Ordner soll überwacht werden?"
echo "Tipp: Ordner einfach in dieses Fenster ziehen und Enter drücken."
read -r -p "[$DEFAULT_DIR] " WATCH_DIR
WATCH_DIR="${WATCH_DIR:-$DEFAULT_DIR}"
WATCH_DIR="${WATCH_DIR%\"}"; WATCH_DIR="${WATCH_DIR#\"}"
WATCH_DIR="${WATCH_DIR%/}"
if [ ! -d "$WATCH_DIR" ]; then
  echo "Ordner nicht gefunden: $WATCH_DIR" >&2
  exit 1
fi

# 4. Skript an einen festen Ort kopieren
mkdir -p "$TARGET_DIR" "$HOME/Library/LaunchAgents" "$(dirname "$LOG")"
cp "$SRC" "$TARGET_DIR/mov-to-mp4-watch.sh"
chmod +x "$TARGET_DIR/mov-to-mp4-watch.sh"

# 5. launchd-Dienst schreiben
cat >"$PLIST" <<PLIST_EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>$TARGET_DIR/mov-to-mp4-watch.sh</string>
    <string>$WATCH_DIR</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>FFMPEG_BIN</key><string>$FFMPEG_BIN</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>$LOG</string>
  <key>StandardErrorPath</key><string>$LOG</string>
  <key>LowPriorityIO</key><true/>
  <key>Nice</key><integer>10</integer>
</dict>
</plist>
PLIST_EOF

launchctl unload "$PLIST" >/dev/null 2>&1 || true
launchctl load "$PLIST"

echo
echo "Fertig. Der Dienst läuft und startet künftig automatisch beim Anmelden."
echo "Überwachter Ordner: $WATCH_DIR"
echo "Logdatei:           $LOG"
echo
echo "Status prüfen:   launchctl list | grep $LABEL"
echo "Log ansehen:     tail -f \"$LOG\""
echo "Dienst stoppen:  launchctl unload \"$PLIST\""
echo "Dienst starten:  launchctl load \"$PLIST\""

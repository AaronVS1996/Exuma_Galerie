#!/usr/bin/env bash
# Beobachtet einen Dropbox-Ordner und erzeugt zu jeder .mov-Datei eine
# browserfreundliche MP4-Version (<name>_web.mp4) – aber nur, wenn zu dieser
# Folge noch keine MP4 existiert.
#
# Nutzung (manuell):
#   ./scripts/mac/mov-to-mp4-watch.sh ~/Dropbox/Freigaben
#
# Als Hintergrunddienst: siehe scripts/mac/install-mov-to-mp4.sh

set -uo pipefail

WATCH_DIR="${1:-$HOME/Dropbox/Freigaben}"
INTERVAL="${MOV_WATCH_INTERVAL:-60}"
STATE_FILE="${MOV_WATCH_STATE:-$HOME/.marketing-station-movwatch.done}"
FFMPEG_BIN="${FFMPEG_BIN:-$(command -v ffmpeg || echo /opt/homebrew/bin/ffmpeg)}"

if [ ! -d "$WATCH_DIR" ]; then
  echo "Ordner nicht gefunden: $WATCH_DIR" >&2
  exit 1
fi
if [ ! -x "$FFMPEG_BIN" ]; then
  echo "ffmpeg nicht gefunden. Bitte installieren: brew install ffmpeg" >&2
  exit 1
fi

touch "$STATE_FILE"
echo "[$(date '+%F %T')] Beobachte: $WATCH_DIR (alle ${INTERVAL}s)"

convert_one() {
  local video="$1"
  local dir base out tmp
  dir="$(dirname "$video")"
  base="$(basename "${video%.*}")"
  out="$dir/${base}_web.mp4"

  # Bereits erledigt?
  [ -f "$out" ] && return 0
  # Manuell exportierte MP4 mit gleichem Namen hat Vorrang.
  [ -f "$dir/$base.mp4" ] && return 0
  grep -Fxq "$video" "$STATE_FILE" && return 0

  # Datei muss von Dropbox fertig geladen sein: Größe zweimal identisch.
  local s1 s2
  s1=$(wc -c <"$video" 2>/dev/null || echo 0)
  sleep 5
  s2=$(wc -c <"$video" 2>/dev/null || echo 0)
  [ "$s1" != "$s2" ] && return 0
  [ "$s1" = "0" ] && return 0

  echo "[$(date '+%F %T')] -> Wandle um: $base"
  tmp="$dir/.${base}_web.mp4.part"
  if "$FFMPEG_BIN" -y -i "$video" \
      -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p \
      -c:a aac -b:a 192k -movflags +faststart "$tmp" >/dev/null 2>&1; then
    mv "$tmp" "$out"
    echo "[$(date '+%F %T')]    fertig: $out"
  else
    rm -f "$tmp"
    echo "[$(date '+%F %T')]    FEHLER bei: $video" >&2
    echo "$video" >>"$STATE_FILE"
  fi
}

while true; do
  while IFS= read -r -d '' video; do
    convert_one "$video"
  done < <(find "$WATCH_DIR" -type f \( -iname '*.mov' -o -iname '*.mkv' \) ! -iname '*_web.mp4' -print0 2>/dev/null)
  sleep "$INTERVAL"
done

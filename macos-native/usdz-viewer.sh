#!/bin/bash
LOGFILE="/tmp/usdz-viewer.log"
echo "========== $(date) ==========" >> "$LOGFILE"

INPUT=$(cat)
echo "INPUT: $INPUT" >> "$LOGFILE"

URL=$(echo "$INPUT" | grep -oE 'https?://[^\"}]+' | head -n 1)
echo "EXTRACTED URL: $URL" >> "$LOGFILE"

EXT="${URL##*.}"
DEST="/tmp/model_$(date +%Y%m%d%H%M%S).$EXT"

echo "Downloading to $DEST ..." >> "$LOGFILE"
/usr/bin/curl -s -L "$URL" -o "$DEST"
if [ $? -eq 0 ]; then
  echo "Download success: $DEST" >> "$LOGFILE"
  # GUI Quick Look を確実に表示させる方法
  qlmanage -p "$DEST" >> "$LOGFILE" 2>&1 &
  # Wait a moment for qlmanage to start
  sleep 1
  # Bring the application to the front
  osascript -e 'tell application "Quick Look" to activate' >> "$LOGFILE" 2>&1
  echo "Preview success: $DEST" >> "$LOGFILE"
else
  echo "Download failed" >> "$LOGFILE"
fi

exit 0
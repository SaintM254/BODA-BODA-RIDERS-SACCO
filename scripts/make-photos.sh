#!/usr/bin/env bash
# Rebuild the responsive photo set in assets/photos/ from full-size originals.
#
#   scripts/sources/hero-rider.jpg   ->  assets/photos/hero-rider-{450,675,900}.{jpg,avif}
#
# Usage: scripts/make-photos.sh [source-dir]     (default: scripts/sources)
# Needs ImageMagick 7 (`magick`) or 6 (`convert`) built with AVIF + JPEG support.
# ImageMagick's AVIF encoder is a little less efficient than libvips/sharp, so files
# come out ~10-20% larger than the ones committed here. Both are visually equal.
set -euo pipefail
cd "$(dirname "$0")/.."

SRC="${1:-scripts/sources}"
IM="$(command -v magick || command -v convert || true)"

if [ -z "$IM" ]; then
  echo "ImageMagick not found — install it first (macOS: brew install imagemagick)." >&2
  exit 1
fi
if [ ! -d "$SRC" ]; then
  echo "No source folder '$SRC'. Drop your full-size originals in there first," >&2
  echo "named after the photo (hero-rider.jpg, community.jpg, repair.jpg, savings-phone.jpg)." >&2
  exit 1
fi

# name:widths — widths must match the PHOTOS map in assets/js/app.js
SETS=(
  "hero-rider:450 675 900"
  "community:600 900 1200"
  "repair:600 900 1192"
  "savings-phone:600 900 1192"
)

mkdir -p assets/photos

for entry in "${SETS[@]}"; do
  name="${entry%%:*}"
  widths="${entry#*:}"
  src="$(ls "$SRC/$name".jpg "$SRC/$name".jpeg "$SRC/$name".png 2>/dev/null | head -n 1 || true)"
  if [ -z "$src" ]; then
    echo "skip  $name — no $name.jpg/.jpeg/.png in $SRC"
    continue
  fi
  for w in $widths; do
    "$IM" "$src" -auto-orient -resize "${w}x" -strip \
      -interlace JPEG -sampling-factor 4:2:0 -quality 80 "assets/photos/$name-$w.jpg"
    "$IM" "$src" -auto-orient -resize "${w}x" -strip -quality 64 "assets/photos/$name-$w.avif"
    printf '  %-24s %s\n' "$name-$w" "$(du -h "assets/photos/$name-$w.avif" | cut -f1) avif"
  done
done

echo "Done. Commit assets/photos/ and check the site."

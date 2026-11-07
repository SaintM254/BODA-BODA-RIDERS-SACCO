# Photography

This is the folder to swap in your own photos. The site reads every image from
here, so you can replace a shot without touching any HTML or JavaScript.

## Files

Every photo ships as one file per width, in two formats:

```
<name>-<width>.avif     modern format, ~30% smaller at the same quality
<name>-<width>.jpg      fallback for browsers without AVIF support
```

| Name            | Widths (px)         | Native size | Where it appears |
|-----------------|---------------------|-------------|------------------|
| `hero-rider`    | 450, 675, 900       | 900×1117    | Home hero (portrait) |
| `community`     | 600, 900, 1200      | 1200×670    | Home / savings / advantages "media band" |
| `repair`        | 600, 900, 1192      | 1192×800    | Loans page |
| `savings-phone` | 600, 900, 1192      | 1192×800    | Home "Built around your day" and the join page |

The browser picks one width from `srcset` using `sizes`, so a phone downloads
~40 KB instead of the full ~200 KB.

## Replacing a photo

1. Crop your shot to the **same aspect ratio** as the row above (portrait 0.81:1
   for `hero-rider`, roughly 3:2 for the landscape ones) and at least as large
   as the widest variant.
2. Drop the source JPEG in as e.g. `hero-rider.jpg` (temporarily, at the repo
   root or anywhere) and regenerate the set:

```bash
./scripts/make-photos.sh                       # regenerates from scripts/sources/
```

or run the two commands yourself per width, with ImageMagick:

```bash
for w in 450 675 900; do
  magick hero-rider.jpg -resize ${w}x -strip -quality 80 -sampling-factor 4:2:0 -interlace JPEG hero-rider-$w.jpg
  magick hero-rider.jpg -resize ${w}x -strip -quality 64 hero-rider-$w.avif
done
```

3. Keep the file names and widths exactly as they are — that is the contract the
   markup relies on. If you add a new photo, also add it to the `PHOTOS` map near
   the top of `assets/js/app.js` and call `photo('<name>', '<alt text>')` where
   you want it.

## Alt text

Alt text lives in `assets/js/app.js` at each `photo(...)` call, not in this
folder. Update it when you change the subject of a photo.

All photos are AI-generated placeholders for this prototype.

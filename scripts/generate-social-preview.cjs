/**
 * Builds public/preview.png at 1200×630 (~1.91:1) for Open Graph / X large cards.
 * The source graphic is 3:2; social surfaces expect a wider frame, so this composites
 * the artwork (fit inside) over a blurred full-bleed version to avoid platform cropping.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const W = 1200;
const H = 630;
const outPath = path.join(__dirname, "..", "public", "preview.png");

async function main() {
  const inputPath =
    process.argv[2] ||
    path.join(__dirname, "..", "public", "preview-artwork.png");
  const inputBuffer = fs.readFileSync(inputPath);

  const blurred = await sharp(inputBuffer)
    .resize(W, H, { fit: "cover", position: "centre" })
    .blur(28)
    .toBuffer();

  const foreground = await sharp(inputBuffer)
    .resize(W, H, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await sharp(blurred)
    .composite([{ input: foreground, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toFile(outPath);

  console.log("Wrote", outPath, `${W}×${H}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

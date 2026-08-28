import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const png = readFileSync(join(__dirname, "../public/brand/watermark-chicken.png"));
const b64 = png.toString("base64");

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="240" height="170" viewBox="0 0 240 170">
  <defs>
    <pattern id="w" width="240" height="170" patternUnits="userSpaceOnUse" patternTransform="rotate(-32 120 85)">
      <text x="12" y="42" fill="#111111" fill-opacity="0.07" font-size="15" font-family="Montserrat, Arial, sans-serif" font-weight="700" letter-spacing="0.05em">EL POLL&#211;N</text>
      <image xlink:href="data:image/png;base64,${b64}" x="138" y="14" width="44" height="32" opacity="0.1" style="mix-blend-mode:multiply"/>
      <text x="12" y="128" fill="#111111" fill-opacity="0.07" font-size="15" font-family="Montserrat, Arial, sans-serif" font-weight="700" letter-spacing="0.05em">EL POLL&#211;N</text>
      <image xlink:href="data:image/png;base64,${b64}" x="138" y="100" width="44" height="32" opacity="0.1" style="mix-blend-mode:multiply"/>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#w)"/>
</svg>`;

writeFileSync(join(__dirname, "../public/brand/watermark-pattern.svg"), svg);
console.log("written");

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "../..");
const publicDir = path.join(rootDir, "public");
const tmpDir = path.join(rootDir, ".tmp", "branding");

const lightLogo = await readFile(path.join(publicDir, "logo/light.svg"), "utf8");
const darkLogo = await readFile(path.join(publicDir, "logo/dark.svg"), "utf8");

await mkdir(path.join(publicDir, "screenshots", "web"), { recursive: true });
await mkdir(path.join(publicDir, "screenshots", "mobile"), { recursive: true });
await mkdir(path.join(publicDir, "opengraph"), { recursive: true });
await mkdir(tmpDir, { recursive: true });

const logoUri = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

const escapeXml = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const splitLines = (text) => text.split("\n");

function posterSvg({ width, height, title, subtitle }) {
  const titleLines = splitLines(title);
  const subtitleLines = splitLines(subtitle);
  const titleSize = Math.round(Math.min(width, height) * 0.09);
  const subtitleSize = Math.round(Math.min(width, height) * 0.045);
  const panelX = Math.round(width * 0.05);
  const panelY = Math.round(height * 0.08);
  const panelWidth = Math.round(width * 0.82);
  const panelHeight = Math.round(height * 0.74);
  const logoWidth = Math.round(width * 0.34);
  const logoHeight = Math.round(height * 0.18);
  const logoX = Math.round((width - logoWidth) / 2);
  const logoY = Math.round(height * 0.14);
  const titleBaseY = Math.round(height * 0.64);
  const subtitleBaseY = Math.round(height * 0.8);

  const titleText = titleLines
    .map((line, index) => {
      const y = titleBaseY + index * Math.round(titleSize * 1.15);
      return `<text x="50%" y="${y}" fill="#FAFAFA" font-family="Helvetica, Arial, sans-serif" font-size="${titleSize}" font-weight="700" text-anchor="middle">${escapeXml(line)}</text>`;
    })
    .join("");

  const subtitleText = subtitleLines
    .map((line, index) => {
      const y = subtitleBaseY + index * Math.round(subtitleSize * 1.2);
      return `<text x="50%" y="${y}" fill="#D5DEEA" font-family="Helvetica, Arial, sans-serif" font-size="${subtitleSize}" font-weight="400" text-anchor="middle">${escapeXml(line)}</text>`;
    })
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#08111B"/>
          <stop offset="100%" stop-color="#17304F"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#bg)"/>
      <circle cx="${Math.round(width * 0.87)}" cy="${Math.round(height * 0.2)}" r="${Math.round(Math.min(width, height) * 0.17)}" fill="rgba(255,255,255,0.05)"/>
      <rect x="${panelX}" y="${panelY}" width="${panelWidth}" height="${panelHeight}" rx="${Math.round(Math.min(width, height) * 0.04)}" fill="rgba(255,255,255,0.05)"/>
      <image href="${logoUri(darkLogo)}" x="${logoX}" y="${logoY}" width="${logoWidth}" height="${logoHeight}" preserveAspectRatio="xMidYMid meet"/>
      ${titleText}
      ${subtitleText}
    </svg>
  `.trim();
}

function iconSvg(size, background = "#FFFFFF") {
  const radius = Math.round(size * 0.22);
  const paddingX = Math.round(size * 0.1);
  const logoWidth = Math.round(size * 0.8);
  const logoHeight = Math.round(size * 0.28);
  const logoY = Math.round((size - logoHeight) / 2);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <rect width="${size}" height="${size}" rx="${radius}" fill="${background}"/>
      <image href="${logoUri(lightLogo)}" x="${paddingX}" y="${logoY}" width="${logoWidth}" height="${logoHeight}" preserveAspectRatio="xMidYMid meet"/>
    </svg>
  `.trim();
}

function faviconSvg(size) {
  const logoWidth = Math.round(size * 0.85);
  const logoHeight = Math.round(size * 0.3);
  const logoX = Math.round((size - logoWidth) / 2);
  const logoY = Math.round((size - logoHeight) / 2);

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <image href="${logoUri(lightLogo)}" x="${logoX}" y="${logoY}" width="${logoWidth}" height="${logoHeight}" preserveAspectRatio="xMidYMid meet"/>
    </svg>
  `.trim();
}

async function renderImage(svg, outputPath) {
  const image = sharp(Buffer.from(svg));
  const ext = path.extname(outputPath);

  if (ext === ".webp") {
    await image.webp({ quality: 92 }).toFile(outputPath);
    return;
  }

  if (ext === ".jpg" || ext === ".jpeg") {
    await image.jpeg({ quality: 92 }).toFile(outputPath);
    return;
  }

  await image.png().toFile(outputPath);
}

const posterJobs = [
  {
    width: 1920,
    height: 1080,
    title: "Crie seu currículo\ncom IA",
    subtitle: "Currículos IA para web",
    output: path.join(publicDir, "screenshots", "web", "1-landing-page.webp"),
  },
  {
    width: 1920,
    height: 1080,
    title: "Gerencie vários\ncurrículos",
    subtitle: "Organize versões e exporte PDF",
    output: path.join(publicDir, "screenshots", "web", "2-resume-dashboard.webp"),
  },
  {
    width: 1920,
    height: 1080,
    title: "Editor completo",
    subtitle: "Edite seções, estilos e conteúdo em minutos",
    output: path.join(publicDir, "screenshots", "web", "3-builder-screen.webp"),
  },
  {
    width: 1920,
    height: 1080,
    title: "Modelos prontos",
    subtitle: "Escolha um layout e personalize rápido",
    output: path.join(publicDir, "screenshots", "web", "4-template-gallery.webp"),
  },
  {
    width: 1284,
    height: 2778,
    title: "Crie com IA",
    subtitle: "Currículos IA",
    output: path.join(publicDir, "screenshots", "mobile", "1-landing-page.webp"),
  },
  {
    width: 1284,
    height: 2778,
    title: "Gerencie versões",
    subtitle: "Tudo na sua conta",
    output: path.join(publicDir, "screenshots", "mobile", "2-resume-dashboard.webp"),
  },
  {
    width: 1284,
    height: 2778,
    title: "Edite no celular",
    subtitle: "Conteúdo, estilo e exportação",
    output: path.join(publicDir, "screenshots", "mobile", "3-builder-screen.webp"),
  },
  {
    width: 1284,
    height: 2778,
    title: "Escolha um modelo",
    subtitle: "Currículos IA",
    output: path.join(publicDir, "screenshots", "mobile", "4-template-gallery.webp"),
  },
  {
    width: 1280,
    height: 720,
    title: "Currículos IA",
    subtitle: "Crie currículos profissionais em português",
    output: path.join(publicDir, "opengraph", "banner.jpg"),
  },
  {
    width: 1920,
    height: 1080,
    title: "Currículos IA",
    subtitle: "Modelos, IA e exportação em PDF",
    output: path.join(publicDir, "opengraph", "features.jpg"),
  },
];

for (const job of posterJobs) {
  await renderImage(posterSvg(job), job.output);
}

const iconJobs = [
  { size: 64, output: path.join(publicDir, "pwa-64x64.png") },
  { size: 180, output: path.join(publicDir, "apple-touch-icon-180x180.png") },
  { size: 192, output: path.join(publicDir, "pwa-192x192.png") },
  { size: 512, output: path.join(publicDir, "pwa-512x512.png") },
  { size: 512, output: path.join(publicDir, "maskable-icon-512x512.png") },
];

for (const job of iconJobs) {
  await renderImage(iconSvg(job.size), job.output);
}

const faviconPngs = [16, 32, 48, 64, 128, 256];

for (const size of faviconPngs) {
  const output = path.join(tmpDir, `favicon-${size}.png`);
  await renderImage(faviconSvg(size), output);
}

await execFileAsync("/opt/homebrew/bin/magick", [
  path.join(tmpDir, "favicon-16.png"),
  path.join(tmpDir, "favicon-32.png"),
  path.join(tmpDir, "favicon-48.png"),
  path.join(tmpDir, "favicon-64.png"),
  path.join(tmpDir, "favicon-128.png"),
  path.join(tmpDir, "favicon-256.png"),
  path.join(publicDir, "favicon.ico"),
]);

await writeFile(path.join(tmpDir, ".gitkeep"), "");

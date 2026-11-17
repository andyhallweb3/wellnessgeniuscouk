import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const sourcePath = "dist/index.html";
const title = "Score your CV for hospitality, fitness and wellness roles | Wellness Genius";
const description =
  "For people working in hotels, spas, gyms, clinics and clubs. Upload a CV and get a score out of 10, with the fixes to make first.";
const url = "https://wellnessgenius.co.uk/cv-score";

const original = readFileSync(sourcePath, "utf8");
const image = original.match(/<meta property="og:image" content="([^"]*)"/)?.[1];
if (!image) throw new Error("Built index.html is missing og:image");

function replaceTag(html, pattern, replacement, label) {
  const next = html.replace(pattern, replacement);
  if (next === html) throw new Error(`Could not replace ${label} in dist/index.html`);
  return next;
}

let html = original;
html = replaceTag(html, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`, "title");
html = replaceTag(
  html,
  /<meta name="description" content="[^"]*"\s*\/?>/,
  `<meta name="description" content="${description}" />`,
  "description",
);
html = replaceTag(
  html,
  /<meta property="og:title" content="[^"]*"\s*\/?>/,
  `<meta property="og:title" content="${title}" />`,
  "og:title",
);
html = replaceTag(
  html,
  /<meta property="og:description" content="[^"]*"\s*\/?>/,
  `<meta property="og:description" content="${description}" />`,
  "og:description",
);
html = replaceTag(
  html,
  /<meta property="og:url" content="[^"]*"\s*\/?>/,
  `<meta property="og:url" content="${url}" />`,
  "og:url",
);
html = replaceTag(
  html,
  /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
  `<meta name="twitter:title" content="${title}" />`,
  "twitter:title",
);
html = replaceTag(
  html,
  /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
  `<meta name="twitter:description" content="${description}" />`,
  "twitter:description",
);
html = replaceTag(
  html,
  /<link rel="canonical" href="[^"]*"\s*\/?>/,
  `<link rel="canonical" href="${url}" />`,
  "canonical",
);

if (!html.includes(`content="${image}"`)) throw new Error("og:image was changed");
if (html.includes('property="og:url" content="https://wellnessgenius.co.uk"')) {
  throw new Error("og:url still points at the homepage");
}

mkdirSync("dist/cv-score", { recursive: true });
writeFileSync("dist/cv-score/index.html", html);
console.log("Wrote dist/cv-score/index.html");

import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import http from "node:http";
import https from "node:https";
import sharp from "sharp";
import YAML from "yaml";

const rootDir = process.cwd();
const contentPath = path.join(rootDir, "content", "site.yaml");
const docsDir = path.join(rootDir, "docs");
const assetsDir = path.join(docsDir, "assets");

const iconSvg = {
  globe: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20Zm7.94 9h-3.02a15.6 15.6 0 0 0-1.4-5.02A8.02 8.02 0 0 1 19.94 11ZM12 4.06c.92 1.1 1.93 3.18 2.38 5.94H9.62C10.07 7.24 11.08 5.16 12 4.06ZM8.48 5.98A15.6 15.6 0 0 0 7.08 11H4.06a8.02 8.02 0 0 1 4.42-5.02ZM4.06 13h3.02a15.6 15.6 0 0 0 1.4 5.02A8.02 8.02 0 0 1 4.06 13Zm7.94 6.94c-.92-1.1-1.93-3.18-2.38-5.94h4.76c-.45 2.76-1.46 4.84-2.38 5.94Zm3.52-1.92A15.6 15.6 0 0 0 16.92 13h3.02a8.02 8.02 0 0 1-4.42 5.02Z" fill="currentColor"/></svg>`,
  github: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5C5.65.5.5 5.7.5 12.12c0 5.14 3.3 9.49 7.88 11.03c.58.11.79-.25.79-.57c0-.28-.01-1.2-.02-2.18c-3.2.7-3.88-1.38-3.88-1.38c-.52-1.35-1.28-1.71-1.28-1.71c-1.05-.73.08-.72.08-.72c1.16.08 1.77 1.21 1.77 1.21c1.03 1.8 2.7 1.28 3.36.98c.1-.76.4-1.28.72-1.58c-2.55-.3-5.23-1.3-5.23-5.77c0-1.28.45-2.33 1.18-3.16c-.12-.3-.51-1.5.11-3.13c0 0 .97-.32 3.19 1.21a10.9 10.9 0 0 1 5.8 0c2.21-1.53 3.18-1.21 3.18-1.21c.62 1.63.23 2.83.11 3.13c.74.83 1.18 1.88 1.18 3.16c0 4.48-2.69 5.47-5.25 5.77c.42.36.78 1.08.78 2.18c0 1.58-.01 2.85-.01 3.24c0 .32.21.69.8.57c4.57-1.55 7.86-5.89 7.86-11.03C23.5 5.7 18.35.5 12 .5Z" fill="currentColor"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.43 8.98H3.88V21h2.55V8.98ZM5.15 7.33c.89 0 1.61-.74 1.61-1.66C6.76 4.74 6.04 4 5.15 4s-1.61.74-1.61 1.67c0 .92.72 1.66 1.61 1.66ZM20.45 21h-2.54v-6.16c0-1.47-.03-3.35-1.98-3.35c-1.98 0-2.28 1.6-2.28 3.24V21h-2.54V8.98h2.44v1.64h.03c.34-.66 1.17-1.93 3.01-1.93c3.21 0 3.81 2.19 3.81 5.03V21Z" fill="currentColor"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.75A2.75 2.75 0 0 1 5.75 4h12.5A2.75 2.75 0 0 1 21 6.75v10.5A2.75 2.75 0 0 1 18.25 20H5.75A2.75 2.75 0 0 1 3 17.25V6.75Zm2 .47v.03l6.62 4.73a.66.66 0 0 0 .76 0L19 7.25v-.03a.75.75 0 0 0-.75-.72H5.75A.75.75 0 0 0 5 7.22Zm14 2.49-5.46 3.9a2.66 2.66 0 0 1-3.08 0L5 9.71v7.54c0 .41.34.75.75.75h12.5c.41 0 .75-.34.75-.75V9.71Z" fill="currentColor"/></svg>`,
  file: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2.75A2.75 2.75 0 0 1 8.75 0h5.69c.73 0 1.43.29 1.94.8l4.82 4.82c.51.51.8 1.21.8 1.94v13.69A2.75 2.75 0 0 1 19.25 24H8.75A2.75 2.75 0 0 1 6 21.25V2.75Zm8 0V6h3.25L14 2.75ZM9 11.25c0-.41.34-.75.75-.75h4.5a.75.75 0 1 1 0 1.5h-4.5A.75.75 0 0 1 9 11.25Zm0 4c0-.41.34-.75.75-.75h7.5a.75.75 0 1 1 0 1.5h-7.5A.75.75 0 0 1 9 15.25Z" fill="currentColor"/></svg>`,
  copy: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.75 3A2.75 2.75 0 0 0 6 5.75v9.5A2.75 2.75 0 0 0 8.75 18h7.5A2.75 2.75 0 0 0 19 15.25v-9.5A2.75 2.75 0 0 0 16.25 3h-7.5Zm-4 5A2.75 2.75 0 0 0 2 10.75v9.5A2.75 2.75 0 0 0 4.75 23h7.5A2.75 2.75 0 0 0 15 20.25V20h-1.5v.25a1.25 1.25 0 0 1-1.25 1.25h-7.5A1.25 1.25 0 0 1 3.5 20.25v-9.5A1.25 1.25 0 0 1 4.75 9.5H5V8h-.25Z" fill="currentColor"/></svg>`,
  check: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.55 17.2 4.9 12.55l1.4-1.4 3.25 3.24 8.15-8.14 1.4 1.4-9.55 9.55Z" fill="currentColor"/></svg>`,
  share: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 16.08a3.2 3.2 0 0 0-2.53 1.23l-5.78-3.2a3.31 3.31 0 0 0 0-1.22l5.78-3.2A3.2 3.2 0 1 0 14.8 8a3.1 3.1 0 0 0 .06.59l-5.8 3.2a3.2 3.2 0 1 0 0 4.42l5.8 3.2A3.1 3.1 0 0 0 14.8 20A3.2 3.2 0 1 0 18 16.08Z" fill="currentColor"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4a1 1 0 0 1 1 1v1.25a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1Zm0 12.75a1 1 0 0 1 1 1V19a1 1 0 1 1-2 0v-1.25a1 1 0 0 1 1-1Zm8-4.75a1 1 0 1 1 0 2h-1.25a1 1 0 1 1 0-2H20ZM6.25 12a1 1 0 1 1 0 2H5a1 1 0 1 1 0-2h1.25Zm9.41-4.66a1 1 0 0 1 1.41 0l.88.88a1 1 0 1 1-1.41 1.41l-.88-.88a1 1 0 0 1 0-1.41Zm-9.61 9.61a1 1 0 0 1 1.41 0l.88.88a1 1 0 1 1-1.41 1.41l-.88-.88a1 1 0 0 1 0-1.41Zm11.02.88a1 1 0 0 1 0-1.41l.88-.88a1 1 0 1 1 1.41 1.41l-.88.88a1 1 0 0 1-1.41 0ZM7.34 7.34a1 1 0 0 1 0 1.41l-.88.88A1 1 0 0 1 5.05 8.22l.88-.88a1 1 0 0 1 1.41 0ZM12 8a4 4 0 1 1 0 8a4 4 0 0 1 0-8Z" fill="currentColor"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.77 4.58a1 1 0 0 1 .19 1.08a6.98 6.98 0 0 0 8.43 9.38a1 1 0 0 1 1.13 1.43A10 10 0 1 1 13.3 3.45a1 1 0 0 1 1.47 1.13Z" fill="currentColor"/></svg>`
};

const uiMessages = {
  ko: {
    open: "열기",
    copied: "링크가 클립보드에 복사되었습니다.",
    copy: "링크 복사",
    share: "공유",
    shareLink: "페이지 공유",
    siteUrl: "사이트 주소",
    themeSystem: "시스템",
    themeLight: "라이트",
    themeDark: "다크",
    language: "언어",
    theme: "테마",
    noDescription: "설명은 링크 메타데이터 또는 기본 정보로 자동 보완됩니다.",
    onlyLanguage: "현재 이 페이지는 한국어만 제공됩니다.",
    fallbackNotice: "현재 선택한 언어 정보가 없어 한국어 콘텐츠를 표시합니다.",
    builtFrom: "설정 파일 기반 정적 페이지"
  },
  en: {
    open: "Open",
    copied: "Link copied to your clipboard.",
    copy: "Copy link",
    share: "Share",
    shareLink: "Share page",
    siteUrl: "Site URL",
    themeSystem: "System",
    themeLight: "Light",
    themeDark: "Dark",
    language: "Language",
    theme: "Theme",
    noDescription: "Descriptions are automatically supplemented from metadata or defaults.",
    onlyLanguage: "This page is currently available only in English.",
    fallbackNotice: "The selected language is unavailable, so the English content is shown instead.",
    builtFrom: "Static page generated from config"
  }
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeXml(value = "") {
  return escapeHtml(value);
}

function stripTags(value = "") {
  return String(value).replace(/<[^>]*>/g, "").trim();
}

function joinUrl(baseUrl, assetPath) {
  if (!baseUrl) {
    return assetPath;
  }
  return new URL(assetPath.replace(/^\.\//, ""), baseUrl).toString();
}

function wrapTextByWords(text, maxCharsPerLine = 44, maxLines = 2) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxCharsPerLine || !current) {
      current = candidate;
      continue;
    }

    lines.push(current);
    current = word;
    if (lines.length === maxLines - 1) {
      break;
    }
  }

  if (lines.length < maxLines && current) {
    lines.push(current);
  }

  const remainingWords = words.slice(lines.join(" ").split(/\s+/).filter(Boolean).length);
  if (remainingWords.length > 0 && lines.length > 0) {
    const last = lines[lines.length - 1];
    lines[lines.length - 1] = last.length > maxCharsPerLine - 3
      ? `${last.slice(0, Math.max(0, maxCharsPerLine - 3)).trimEnd()}...`
      : `${last}...`;
  }

  while (lines.length < maxLines) {
    lines.push("");
  }

  return lines;
}

function normalizeLanguage(value) {
  return value === "ko" || value === "en" ? value : null;
}

function pickLocalized(field, lang, fallbackLang) {
  if (typeof field === "string") {
    return field;
  }
  if (!field || typeof field !== "object") {
    return "";
  }
  return field[lang] || field[fallbackLang] || Object.values(field).find(Boolean) || "";
}

function resolveLocalizedUrl(field, fallbackLang) {
  if (typeof field === "string") {
    return field;
  }
  if (!field || typeof field !== "object") {
    return "";
  }
  return field[fallbackLang] || field.en || field.ko || Object.values(field).find(Boolean) || "";
}

function getLocaleAvailability(field) {
  if (typeof field === "string") {
    return { ko: true, en: true };
  }
  if (!field || typeof field !== "object") {
    return { ko: false, en: false };
  }
  return {
    ko: Boolean(field.ko),
    en: Boolean(field.en)
  };
}

function pickDescription(link, language, fallbackLanguage) {
  if (link.descriptionConfigured) {
    return pickLocalized(link.description, language, fallbackLanguage) || "";
  }
  return (
    pickLocalized(link.metadataDescription, language, fallbackLanguage) ||
    pickLocalized(link.fallbackDescription, language, fallbackLanguage) ||
    ""
  );
}

function getLocaleSuffix(field, language) {
  const availability = getLocaleAvailability(field);
  if (language === "en" && !availability.en && availability.ko) {
    return " (Korean)";
  }
  if (language === "ko" && !availability.ko && availability.en) {
    return ` (${String.fromCharCode(0xC601, 0xBB38)})`;
  }
  return "";
}

function toDisplayUrl(value) {
  const normalized = String(value).replace(/^mailto:/, "");
  if (!/^https?:\/\//i.test(normalized)) {
    return normalized;
  }
  return normalized.replace(/\/$/, "");
}

function parseTagAttributes(tag) {
  const attributes = {};
  const attributeRegex = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let match;
  while ((match = attributeRegex.exec(tag))) {
    const key = match[1]?.toLowerCase();
    if (!key || key === "link") {
      continue;
    }
    attributes[key] = match[2] ?? match[3] ?? match[4] ?? "";
  }
  return attributes;
}

function parseIconSize(value) {
  const match = String(value || "").match(/(\d+)[xX](\d+)/);
  if (!match) {
    return 0;
  }
  return Number(match[1]) * Number(match[2]);
}

function scoreIconCandidate(candidate) {
  let score = 0;
  if (candidate.fromManifest) {
    score += 5000;
  }
  if (candidate.purpose?.includes("maskable")) {
    score += 1200;
  }
  if (candidate.rel?.includes("apple-touch-icon")) {
    score += 900;
  }
  if (candidate.type === "image/png") {
    score += 700;
  }
  if (candidate.rel?.includes("icon")) {
    score += 400;
  }
  if (candidate.url.endsWith(".svg")) {
    score += 300;
  }
  if (candidate.url.endsWith(".png")) {
    score += 200;
  }
  score += Math.min(candidate.size || 0, 4096);
  return score;
}

function chooseBestIconCandidate(candidates) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return "";
  }
  return [...candidates]
    .filter((candidate) => candidate?.url)
    .sort((left, right) => scoreIconCandidate(right) - scoreIconCandidate(left))[0]?.url || "";
}

async function fetchUrlText(url, redirectCount = 0) {
  if (redirectCount > 4) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const client = url.startsWith("https:") ? https : http;
    const request = client.get(
      url,
      {
        headers: {
          "user-agent": "Mozilla/5.0 (compatible; CardBuilder/1.0)"
        }
      },
      (response) => {
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          response.resume();
          resolve(fetchUrlText(new URL(response.headers.location, url).toString(), redirectCount + 1));
          return;
        }

        if (!response.statusCode || response.statusCode >= 400) {
          response.resume();
          resolve(null);
          return;
        }

        let body = "";
        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => resolve({ body, finalUrl: url }));
      }
    );

    request.setTimeout(4500, () => {
      request.destroy(new Error("Request timed out"));
    });
    request.on("error", reject);
  });
}

async function resolveBestIconFromHtml(pageUrl, html) {
  const linkTags = [...String(html).matchAll(/<link\b[^>]*>/gi)].map((match) => parseTagAttributes(match[0]));
  const iconCandidates = [];
  let manifestUrl = "";

  for (const attributes of linkTags) {
    const rel = String(attributes.rel || "").toLowerCase();
    const href = attributes.href ? new URL(attributes.href, pageUrl).toString() : "";
    if (!href) {
      continue;
    }

    if (rel.includes("manifest") && !manifestUrl) {
      manifestUrl = href;
    }

    if (!rel.includes("icon")) {
      continue;
    }

    iconCandidates.push({
      url: href,
      rel,
      type: String(attributes.type || "").toLowerCase(),
      purpose: String(attributes.purpose || "").toLowerCase(),
      size: parseIconSize(attributes.sizes)
    });
  }

  if (manifestUrl) {
    try {
      const manifestResponse = await fetchUrlText(manifestUrl);
      const manifestText = manifestResponse?.body || "";
      const manifestBaseUrl = manifestResponse?.finalUrl || manifestUrl;
      const manifest = manifestText ? JSON.parse(manifestText) : null;
      if (Array.isArray(manifest?.icons)) {
        for (const icon of manifest.icons) {
          if (!icon?.src) {
            continue;
          }
          iconCandidates.push({
            url: new URL(icon.src, manifestBaseUrl).toString(),
            rel: "manifest",
            type: String(icon.type || "").toLowerCase(),
            purpose: String(icon.purpose || "").toLowerCase(),
            size: parseIconSize(icon.sizes),
            fromManifest: true
          });
        }
      }
    } catch {}
  }

  return (
    chooseBestIconCandidate(iconCandidates) ||
    new URL("/favicon.ico", new URL(pageUrl).origin).toString()
  );
}

function inferIcon(url, metadataIconUrl = "") {
  if (url.startsWith("mailto:")) {
    return { kind: "inline", value: "mail" };
  }
  if (url.match(/\.(pdf|doc|docx)$/i)) {
    return { kind: "inline", value: "file" };
  }
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "github.com" || parsed.hostname === "www.github.com") {
      return { kind: "inline", value: "github", plain: true };
    }
    if (parsed.hostname === "linkedin.com" || parsed.hostname === "www.linkedin.com") {
      return {
        kind: "image",
        value: "https://static.licdn.com/scds/common/u/images/logos/favicons/v1/favicon.ico"
      };
    }
    return {
      kind: "image",
      value: metadataIconUrl || new URL("/favicon.ico", parsed.origin).toString()
    };
  } catch {
    return { kind: "inline", value: "globe" };
  }
}

function extractHostLabel(url) {
  if (url.startsWith("mailto:")) {
    return url.replace("mailto:", "");
  }
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function buildMetaFallbacks(url) {
  const host = extractHostLabel(url);
  return {
    name: host,
    description: {
      ko: `${host} 링크`,
      en: `${host} link`
    }
  };
}

async function fetchMetadata(url) {
  if (!/^https?:\/\//i.test(url)) {
    return null;
  }

  try {
    const pageResponse = await fetchUrlText(url);
    const html = pageResponse?.body || "";
    const finalUrl = pageResponse?.finalUrl || url;

    if (!html) {
      return null;
    }

    const readMeta = (property) => {
      const regex = new RegExp(
        `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
        "i"
      );
      return html.match(regex)?.[1]?.trim() || "";
    };

    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = readMeta("og:title") || readMeta("twitter:title") || titleMatch?.[1]?.trim() || "";
    const description =
      readMeta("og:description") ||
      readMeta("twitter:description") ||
      html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() ||
      "";
    const iconUrl = await resolveBestIconFromHtml(finalUrl, html);

    return title || description || iconUrl ? { title, description, iconUrl } : null;
  } catch {
    return null;
  }
}

function resolveLanguageState(site) {
  const configured = Array.isArray(site.availableLanguages)
    ? site.availableLanguages.map(normalizeLanguage).filter(Boolean)
    : [];
  const languages = configured.length > 0 ? configured : ["ko"];
  const fallbackLanguage = languages.includes("en") ? "en" : languages[0];
  const normalizedDefaultLanguage = normalizeLanguage(site.defaultLanguage);
  const prerenderLanguage =
    normalizedDefaultLanguage !== "auto" && languages.includes(normalizedDefaultLanguage)
      ? normalizedDefaultLanguage
      : fallbackLanguage;
  return { languages, fallbackLanguage, prerenderLanguage };
}

function buildOgImageSvg(data) {
  const language = data.prerenderLanguage;
  const name = pickLocalized(data.site.person.name, language, data.fallbackLanguage);
  const role = pickLocalized(data.site.person.role, language, data.fallbackLanguage);
  const intro = pickLocalized(data.site.intro, language, data.fallbackLanguage);
  const email = pickLocalized(data.site.person.email, language, data.fallbackLanguage);
  const [introLineOne, introLineTwo] = wrapTextByWords(intro, 120, 2).map(escapeXml);

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="80" y1="44" x2="1088" y2="602" gradientUnits="userSpaceOnUse">
      <stop stop-color="#081325"/>
      <stop offset="0.52" stop-color="#10203A"/>
      <stop offset="1" stop-color="#1B3055"/>
    </linearGradient>
    <radialGradient id="glowA" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1010 110) rotate(140) scale(380 260)">
      <stop stop-color="#8FB0FF" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#8FB0FF" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glowB" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(180 580) rotate(-18) scale(420 220)">
      <stop stop-color="#5A76B8" stop-opacity="0.24"/>
      <stop offset="1" stop-color="#5A76B8" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glowA)"/>
  <rect width="1200" height="630" fill="url(#glowB)"/>
  <rect x="52" y="52" width="1096" height="526" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)"/>
  <rect x="84" y="84" width="156" height="8" fill="rgba(221,231,255,0.9)"/>
  <rect x="84" y="110" width="108" height="8" fill="rgba(221,231,255,0.32)"/>
  <text x="84" y="246" fill="#F4F7FF" font-family="Manrope, Arial, sans-serif" font-size="76" font-weight="800" letter-spacing="-2.8">${escapeXml(name)}</text>
  <text x="84" y="302" fill="#A9B7D3" font-family="Manrope, Arial, sans-serif" font-size="32" font-weight="600" letter-spacing="0.2">${escapeXml(role)}</text>
  <text x="84" y="384" fill="#DDE7FF" font-family="Manrope, Arial, sans-serif" font-size="24" font-weight="700">${escapeXml(email)}</text>
  <text x="84" y="424" fill="#9FB0CF" font-family="Manrope, Arial, sans-serif" font-size="22" font-weight="500">${introLineOne}</text>
  <text x="84" y="456" fill="#9FB0CF" font-family="Manrope, Arial, sans-serif" font-size="22" font-weight="500">${introLineTwo}</text>
  ${(Array.isArray(data.site.skills) ? data.site.skills : []).slice(0, 6).map((skill, index) => {
    const x = 84 + index * 164;
    return `<g transform="translate(${x} 520)">
  <rect width="144" height="40" rx="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)"/>
  <text x="72" y="26" text-anchor="middle" fill="#B8C6E3" font-family="Manrope, Arial, sans-serif" font-size="18" font-weight="700">${escapeXml(skill)}</text>
</g>`;
  }).join("")}
</svg>`;
}

function buildCss() {
  return `:root {
  color-scheme: light dark;
  --bg: #edf1f7;
  --bg-accent: rgba(44, 61, 104, 0.16);
  --surface: rgba(255, 255, 255, 0.78);
  --surface-strong: rgba(255, 255, 255, 0.9);
  --text: #0f172a;
  --muted: #5b6780;
  --line: rgba(15, 23, 42, 0.08);
  --accent: #1e3a5f;
  --accent-strong: #132845;
  --accent-soft: rgba(30, 58, 95, 0.1);
  --shadow: 0 14px 34px rgba(15, 23, 42, 0.1);
  --radius-xl: 24px;
  --radius-lg: 18px;
  --radius-md: 16px;
  --max-width: 1080px;
  --font-sans: "Manrope", "Pretendard Variable", "Pretendard", "Noto Sans KR", sans-serif;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #06101f;
    --bg-accent: rgba(73, 102, 176, 0.18);
    --surface: rgba(10, 20, 40, 0.78);
    --surface-strong: rgba(8, 17, 34, 0.9);
    --text: #eef3ff;
    --muted: #9aa8c3;
    --line: rgba(238, 243, 255, 0.08);
    --accent: #88a7ff;
    --accent-strong: #c6d5ff;
    --accent-soft: rgba(136, 167, 255, 0.12);
    --shadow: 0 18px 44px rgba(0, 0, 0, 0.28);
  }
}

html[data-theme="light"] {
  color-scheme: light;
  --bg: #edf1f7;
  --bg-accent: rgba(44, 61, 104, 0.16);
  --surface: rgba(255, 255, 255, 0.78);
  --surface-strong: rgba(255, 255, 255, 0.9);
  --text: #0f172a;
  --muted: #5b6780;
  --line: rgba(15, 23, 42, 0.08);
  --accent: #1e3a5f;
  --accent-strong: #132845;
  --accent-soft: rgba(30, 58, 95, 0.1);
  --shadow: 0 14px 34px rgba(15, 23, 42, 0.1);
}

html[data-theme="dark"] {
  color-scheme: dark;
  --bg: #06101f;
  --bg-accent: rgba(73, 102, 176, 0.18);
  --surface: rgba(10, 20, 40, 0.78);
  --surface-strong: rgba(8, 17, 34, 0.9);
  --text: #eef3ff;
  --muted: #9aa8c3;
  --line: rgba(238, 243, 255, 0.08);
  --accent: #88a7ff;
  --accent-strong: #c6d5ff;
  --accent-soft: rgba(136, 167, 255, 0.12);
  --shadow: 0 18px 44px rgba(0, 0, 0, 0.28);
}

* {
  box-sizing: border-box;
}

html.theme-switching *,
html.theme-switching *::before,
html.theme-switching *::after {
  transition: none !important;
  animation: none !important;
}

html, body {
  margin: 0;
  min-height: 100%;
}

html {
  background-color: var(--bg);
}

body {
  font-family: var(--font-sans);
  color: var(--text);
  background:
    radial-gradient(circle at top left, var(--bg-accent), transparent 30%),
    radial-gradient(circle at right 18%, rgba(105, 124, 201, 0.14), transparent 24%),
    linear-gradient(180deg, color-mix(in srgb, var(--bg) 92%, #ffffff 8%) 0%, var(--bg) 100%);
}

body[data-ready="false"] {
  overflow: hidden;
}

a {
  color: inherit;
  text-decoration: none;
}

button, select {
  font: inherit;
}

.page {
  width: min(100%, var(--max-width));
  margin: 0 auto;
  padding: 24px 18px 56px;
}

body[data-ready="false"] .page {
  opacity: 0;
  transform: translateY(8px);
  pointer-events: none;
}

body[data-ready="true"] .page {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 220ms ease, transform 220ms ease;
}

.boot {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at top left, var(--bg-accent), transparent 30%),
    linear-gradient(180deg, color-mix(in srgb, var(--bg) 94%, #ffffff 6%) 0%, var(--bg) 100%);
  opacity: 1;
  visibility: visible;
  transition: opacity 220ms ease, visibility 220ms ease;
}

.boot[data-visible="false"] {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.boot-panel {
  display: grid;
  justify-items: center;
  padding: 8px;
}

.boot-spinner {
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 2px solid color-mix(in srgb, var(--accent) 18%, transparent);
  border-top-color: var(--accent);
  animation: boot-spin 0.9s linear infinite;
}

@keyframes boot-spin {
  to {
    transform: rotate(360deg);
  }
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.lang-switch,
.theme-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: color-mix(in srgb, var(--surface-strong) 86%, transparent);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(14px);
}

.lang-button,
.theme-button {
  border: 0;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: background 160ms ease, color 160ms ease, transform 160ms ease;
}

.lang-button {
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 700;
}

.theme-button {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 999px;
}

.theme-button svg {
  width: 20px;
  height: 20px;
}

.lang-button[aria-pressed="true"],
.theme-button[aria-pressed="true"] {
  background: var(--accent-soft);
  color: var(--accent-strong);
}

.lang-button:hover,
.theme-button:hover,
.lang-button:focus-visible,
.theme-button:focus-visible {
  transform: translateY(-1px);
  outline: none;
}

.hero {
  position: relative;
  overflow: hidden;
  display: grid;
  padding: 16px 24px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-xl);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(18px);
}

.identity {
  display: grid;
  gap: 10px;
  padding: 2px 0;
  max-width: 100%;
}

.identity-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 10px;
}

.identity-name {
  font-size: clamp(1.6rem, 5vw, 2.2rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  margin-inline: 4px;
}

.identity-name-sub {
  margin-inline: 0 4px;
  color: var(--muted);
  font-size: clamp(0.98rem, 2.4vw, 1.1rem);
  font-weight: 700;
  letter-spacing: 0.01em;
}

.identity-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  color: var(--muted);
}

.identity-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.identity-skill {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 700;
}

.notice {
  display: none;
  padding: 14px 16px;
  border-radius: var(--radius-md);
  background: var(--accent-soft);
  color: var(--text);
  border: 1px solid var(--line);
}

.notice[data-visible="true"] {
  display: block;
}

.toast {
  position: fixed;
  top: 18px;
  left: 50%;
  z-index: 40;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transform: translate(-50%, -12px);
  padding: 11px 16px;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, #3fa56f 45%, var(--line));
  background: color-mix(in srgb, #e8f8ef 76%, var(--surface));
  color: #0f5a35;
  box-shadow: 0 8px 18px rgba(11, 72, 43, 0.12);
  font-size: 0.92rem;
  font-weight: 800;
  letter-spacing: 0.01em;
  opacity: 0;
  pointer-events: none;
  transition: opacity 180ms ease, transform 180ms ease;
}

.toast svg {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
}

.toast[data-visible="true"] {
  opacity: 1;
  transform: translate(-50%, 0);
}

html[data-theme="dark"] .toast {
  border-color: rgba(86, 190, 128, 0.42);
  background: linear-gradient(180deg, rgba(16, 52, 33, 0.96), rgba(13, 42, 27, 0.96));
  color: #dff7e6;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.22);
}

.links {
  display: grid;
  gap: 14px;
  margin-top: 20px;
}

.link-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 18px;
  border-radius: var(--radius-lg);
  border: 1px solid var(--line);
  background: var(--surface);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
  transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
}

.link-card:hover,
.link-card:focus-within {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--accent) 36%, var(--line));
}

.link-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: var(--accent-soft);
  color: var(--accent);
  overflow: hidden;
}

.link-icon.plain {
  background: transparent;
}

.link-icon img,
.link-icon svg {
  width: 26px;
  height: 26px;
}

.link-copy {
  border: 0;
  width: 40px;
  height: 40px;
  min-width: 40px;
  padding: 0;
  display: inline-grid;
  place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--accent-strong);
  cursor: pointer;
}

.link-copy svg {
  width: 18px;
  height: 18px;
}

.link-main {
  min-width: 0;
}

.link-name {
  font-weight: 800;
  font-size: 1rem;
}

.link-url {
  margin-top: 4px;
  color: var(--muted);
  font-size: 0.92rem;
  overflow-wrap: anywhere;
}

.link-description {
  margin-top: 5px;
  color: var(--muted);
  line-height: 1.6;
}

.footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-top: 22px;
  padding: 14px 2px 6px;
  color: var(--muted);
  font-size: 0.94rem;
}

.footer-site {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.footer-label {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.footer-url {
  color: var(--text);
  text-decoration: none;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.footer-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-copy {
  border: 0;
  width: 44px;
  height: 44px;
  min-width: 44px;
  padding: 0;
  display: inline-grid;
  place-items: center;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  color: var(--accent-strong);
  cursor: pointer;
}

.footer-share {
  border: 0;
  min-width: 44px;
  height: 44px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--accent) 16%, transparent);
  color: var(--accent-strong);
  font-weight: 800;
  cursor: pointer;
}

.footer-copy svg,
.footer-share svg {
  width: 18px;
  height: 18px;
}

@media (min-width: 840px) {
  .page {
    padding: 40px 28px 80px;
  }

  .hero {
    padding: 18px 26px;
  }
}

@media (max-width: 639px) {
  .page {
    padding-inline: 14px;
  }

  .toolbar {
    gap: 10px;
  }

  .lang-button {
    padding-inline: 12px;
  }

  .hero {
    padding: 14px 18px;
    border-radius: 20px;
  }

  .link-card {
    grid-template-columns: auto 1fr auto;
    align-items: start;
  }

  .link-copy {
    margin-top: 2px;
  }

  .footer {
    align-items: stretch;
  }

  .footer-actions {
    width: 100%;
  }

  .footer-share {
    width: 100%;
    justify-content: center;
  }

  .footer-copy {
    flex: 0 0 44px;
  }
}`;
}

function buildClientScript(data) {
  return `const DATA = ${JSON.stringify(data)};
const MESSAGES = ${JSON.stringify(uiMessages)};
const ICONS = ${JSON.stringify(iconSvg)};

const state = {
  theme: "system",
  language: "ko",
  requestedLanguage: null,
  toastTimer: null,
  bootStartedAt: performance.now()
};

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getStored(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setStored(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function resolveInitialLanguage() {
  const saved = getStored("card-language");
  if (DATA.languages.includes(saved)) {
    state.requestedLanguage = saved;
    return saved;
  }

  if (DATA.defaultLanguage !== "auto" && DATA.languages.includes(DATA.defaultLanguage)) {
    state.requestedLanguage = DATA.defaultLanguage;
    return DATA.defaultLanguage;
  }

  const preferred = navigator.languages
    .map((value) => value.toLowerCase().slice(0, 2))
    .find(Boolean);

  state.requestedLanguage = preferred || DATA.fallbackLanguage;
  const availablePreferred = navigator.languages
    .map((value) => value.toLowerCase().slice(0, 2))
    .find((value) => DATA.languages.includes(value));

  return availablePreferred || DATA.fallbackLanguage;
}

function resolveInitialTheme() {
  const saved = getStored("card-theme");
  return ["light", "dark"].includes(saved) ? saved : "system";
}

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getEffectiveTheme() {
  return state.theme === "system" ? getSystemTheme() : state.theme;
}

function updateThemeColor() {
  const meta = document.querySelector('meta[name="theme-color"][data-dynamic-theme]');
  if (!meta) {
    return;
  }
  meta.setAttribute("content", getEffectiveTheme() === "dark" ? "#06101f" : "#edf1f7");
}

function withoutThemeMotion(callback) {
  const root = document.documentElement;
  root.classList.add("theme-switching");
  callback();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove("theme-switching");
    });
  });
}

function stripTrailingSlash(value) {
  return typeof value === "string" && value.endsWith("/") ? value.slice(0, -1) : value;
}

function pickLocalized(field, language) {
  if (typeof field === "string") {
    return field;
  }
  if (!field || typeof field !== "object") {
    return "";
  }
  return field[language] || field[DATA.fallbackLanguage] || Object.values(field).find(Boolean) || "";
}

function getLocaleAvailability(field) {
  if (typeof field === "string") {
    return { ko: true, en: true };
  }
  if (!field || typeof field !== "object") {
    return { ko: false, en: false };
  }
  return {
    ko: Boolean(field.ko),
    en: Boolean(field.en)
  };
}

function pickDescription(link, language, fallbackLanguage) {
  if (link.descriptionConfigured) {
    return pickLocalized(link.description, language, fallbackLanguage) || "";
  }
  return (
    pickLocalized(link.metadataDescription, language, fallbackLanguage) ||
    pickLocalized(link.fallbackDescription, language, fallbackLanguage) ||
    ""
  );
}

function getLocaleSuffix(field, language) {
  const availability = getLocaleAvailability(field);
  if (language === "en" && !availability.en && availability.ko) {
    return " (Korean)";
  }
  if (language === "ko" && !availability.ko && availability.en) {
    return " (" + String.fromCharCode(0xC601, 0xBB38) + ")";
  }
  return "";
}

function localeSuffix(field, language) {
  const availability = getLocaleAvailability(field);
  if (language === "en" && !availability.en && availability.ko) {
    return " (Korean)";
  }
  if (language === "ko" && !availability.ko && availability.en) {
    return " (영문)";
  }
  return "";
}

function renderIcon(link) {
  if (link.icon?.kind === "image") {
    return '<img alt="" src="' + escapeHtml(link.icon.value) + '" loading="lazy" referrerpolicy="no-referrer">';
  }
  const key = link.icon?.value || "globe";
  return ICONS[key] || ICONS.globe;
}

function applyTheme() {
  document.documentElement.dataset.theme = getEffectiveTheme();
  updateThemeColor();
}

function renderThemeButtons() {
  const light = document.getElementById("theme-light");
  const dark = document.getElementById("theme-dark");
  const effectiveTheme = getEffectiveTheme();
  light.setAttribute("aria-pressed", String(effectiveTheme === "light"));
  dark.setAttribute("aria-pressed", String(effectiveTheme === "dark"));
}

function renderLanguageButtons() {
  document.querySelectorAll("[data-language]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.language === state.language));
  });
}

function renderNotices(language) {
  const messages = MESSAGES[language];
  const only = document.getElementById("only-language-notice");
  const fallback = document.getElementById("fallback-notice");
  const hasSingleLanguage = DATA.languages.length === 1;
  const selectedUnavailable = !DATA.languages.includes(state.requestedLanguage) && DATA.languages.length > 1;

  only.textContent = messages.onlyLanguage;
  fallback.textContent = messages.fallbackNotice;
  only.dataset.visible = String(hasSingleLanguage);
  fallback.dataset.visible = String(!hasSingleLanguage && selectedUnavailable);
}

function renderFooter(language) {
  const messages = MESSAGES[language];
  const siteUrl = DATA.siteUrl || "";
  const footerLabel = document.getElementById("footer-site-label");
  const footerLink = document.getElementById("footer-site-link");
  const copyButton = document.getElementById("footer-copy");
  const shareButton = document.getElementById("footer-share");

  footerLabel.textContent = messages.siteUrl;
  footerLink.textContent = siteUrl ? stripTrailingSlash(siteUrl) : "";
  footerLink.href = siteUrl || "#";
  footerLink.hidden = !siteUrl;
  copyButton.hidden = !siteUrl;
  copyButton.dataset.copy = siteUrl;
  copyButton.setAttribute("aria-label", messages.copy);
  copyButton.setAttribute("title", messages.copy);
  shareButton.hidden = !siteUrl;
  shareButton.setAttribute("aria-label", messages.shareLink);
  shareButton.setAttribute("title", messages.shareLink);
  shareButton.querySelector(".footer-share-text").textContent = messages.share;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) {
    return;
  }

  toast.innerHTML = ICONS.check + '<span>' + escapeHtml(message) + '</span>';
  toast.dataset.visible = "true";
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => {
    toast.dataset.visible = "false";
  }, 1600);
}

function finishBoot() {
  const boot = document.getElementById("boot");
  document.documentElement.style.removeProperty("background-color");
  document.documentElement.style.removeProperty("color-scheme");
  document.body.dataset.ready = "true";
  if (boot) {
    boot.dataset.visible = "false";
  }
}

function render() {
  const language = state.language;
  const messages = MESSAGES[language];

  document.title = pickLocalized(DATA.site.title, language);
  document.getElementById("person-name").textContent = pickLocalized(DATA.site.person.name, language);
  document.getElementById("person-name-sub").textContent = language === "ko"
    ? pickLocalized(DATA.site.person.name, "en")
    : "";
  document.getElementById("person-name-sub").hidden = language !== "ko";
  document.getElementById("person-role").textContent = pickLocalized(DATA.site.person.role, language);
  document.getElementById("person-location").textContent = pickLocalized(DATA.site.person.location, language);
  document.getElementById("person-email").textContent = pickLocalized(DATA.site.person.email, language);
  document.getElementById("person-skills").innerHTML = (DATA.site.skills || [])
    .map((skill) => \`<span class="identity-skill">\${escapeHtml(skill)}</span>\`)
    .join("");
  renderLanguageButtons();
  renderThemeButtons();

  const linksEl = document.getElementById("links");
  linksEl.innerHTML = DATA.links.map((link, index) => {
    const name = escapeHtml((pickLocalized(link.name, language) || link.metadataName || link.fallbackName) + getLocaleSuffix(link.url, language));
    const description = escapeHtml(pickDescription(link, language, DATA.fallbackLanguage));
    const href = pickLocalized(link.url, language);
    const escapedHref = escapeHtml(href);
    const displayUrl = escapeHtml(pickLocalized(link.displayUrl, language));

    return \`<article class="link-card" style="animation-delay:\${index * 60}ms">
      <a class="link-icon\${link.icon?.plain ? " plain" : ""}" href="\${escapedHref}" target="_blank" rel="noreferrer noopener">\${renderIcon(link)}</a>
      <a class="link-main" href="\${escapedHref}" target="_blank" rel="noreferrer noopener">
        <div class="link-name">\${name}</div>
        <div class="link-url">\${displayUrl}</div>
        \${description ? \`<div class="link-description">\${description}</div>\` : ""}
      </a>
      <button class="link-copy" type="button" data-copy="\${escapedHref}" aria-label="\${escapeHtml(messages.copy)}" title="\${escapeHtml(messages.copy)}">\${ICONS.copy}</button>
    </article>\`;
  }).join("");

  renderNotices(language);
  renderFooter(language);
}

document.addEventListener("click", async (event) => {
  const languageButton = event.target.closest("[data-language]");
  if (languageButton) {
    state.language = languageButton.dataset.language;
    state.requestedLanguage = state.language;
    setStored("card-language", state.language);
    render();
    return;
  }

  const themeButton = event.target.closest("[data-theme-mode]");
  if (themeButton) {
    state.theme = themeButton.dataset.themeMode;
    setStored("card-theme", state.theme);
    withoutThemeMotion(() => {
      applyTheme();
      renderThemeButtons();
    });
    return;
  }

  const button = event.target.closest("[data-copy]");
  if (button) {
    const messages = MESSAGES[state.language];
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      showToast(messages.copied);
    } catch {}
    return;
  }

  const shareButton = event.target.closest("[data-share-url]");
  if (!shareButton) {
    return;
  }

  const shareUrl = shareButton.dataset.shareUrl;
  const title = pickLocalized(DATA.site.title, state.language);
  try {
    if (navigator.share) {
      await navigator.share({ title, url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      showToast(MESSAGES[state.language].copied);
    }
  } catch {}
});

document.addEventListener("DOMContentLoaded", () => {
  state.language = resolveInitialLanguage();
  state.theme = resolveInitialTheme();
  applyTheme();
  render();

  const elapsed = performance.now() - state.bootStartedAt;
  const remaining = Math.max(500 - elapsed, 0);
  setTimeout(() => {
    finishBoot();
  }, remaining);

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", () => {
    if (state.theme === "system") {
      withoutThemeMotion(() => {
        applyTheme();
        renderThemeButtons();
      });
    }
  });
});`;
}

function buildHtml(data) {
  const language = data.prerenderLanguage;
  const messages = uiMessages[language];
  const title = pickLocalized(data.site.title, language, data.fallbackLanguage);
  const description = pickLocalized(data.site.intro, language, data.fallbackLanguage);
  const pageUrl = data.siteUrl || "";
  const displaySiteUrl = pageUrl ? pageUrl.replace(/\/$/, "") : "";
  const ogImagePath = data.assetPaths?.ogImage || "./assets/og-image.png";
  const stylesheetPath = data.assetPaths?.styles || "./assets/styles.css";
  const appScriptPath = data.assetPaths?.app || "./assets/app.js";
  const ogImageUrl = joinUrl(pageUrl, ogImagePath);
  const locale = language === "ko" ? "ko_KR" : "en_US";
  const initialThemeScript = `(function(){try{var saved=localStorage.getItem("card-theme");var mode=(saved==="light"||saved==="dark")?saved:"system";var dark=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches;var theme=mode==="system"?(dark?"dark":"light"):mode;var root=document.documentElement;root.dataset.theme=theme;root.style.backgroundColor=theme==="dark"?"#06101f":"#edf1f7";root.style.colorScheme=theme;}catch(e){}})();`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: pickLocalized(data.site.person.name, language, data.fallbackLanguage),
    jobTitle: pickLocalized(data.site.person.role, language, data.fallbackLanguage),
    email: pickLocalized(data.site.person.email, language, data.fallbackLanguage),
    address: pickLocalized(data.site.person.location, language, data.fallbackLanguage),
    url: pageUrl || undefined,
    sameAs: data.links
      .map((link) => resolveLocalizedUrl(link.url, language))
      .filter((url) => /^https?:/i.test(url))
  };
  const structuredDataJson = JSON.stringify(structuredData).replace(/</g, "\\u003C");
  const linksHtml = data.links
    .map((link) => {
      const name = escapeHtml(
        (pickLocalized(link.name, language, data.fallbackLanguage) || link.metadataName || link.fallbackName) +
        ((language === "en" && !getLocaleAvailability(link.url).en && getLocaleAvailability(link.url).ko)
          ? " (Korean)"
          : (language === "ko" && !getLocaleAvailability(link.url).ko && getLocaleAvailability(link.url).en)
            ? " (영문)"
            : "")
      );
      const safeName = escapeHtml(
        (pickLocalized(link.name, language, data.fallbackLanguage) || link.metadataName || link.fallbackName) +
        getLocaleSuffix(link.url, language)
      );
      const description = escapeHtml(pickDescription(link, language, data.fallbackLanguage));
      const href = pickLocalized(link.url, language, data.fallbackLanguage);
      const displayUrl = pickLocalized(link.displayUrl, language, data.fallbackLanguage);
      const iconHtml =
        link.icon?.kind === "image"
          ? `<img alt="" src="${escapeHtml(link.icon.value)}" loading="lazy" referrerpolicy="no-referrer">`
          : iconSvg[link.icon?.value || "globe"] || iconSvg.globe;

      return `<article class="link-card">
        <a class="link-icon${link.icon?.plain ? " plain" : ""}" href="${escapeHtml(href)}" target="_blank" rel="noreferrer noopener">${iconHtml}</a>
        <a class="link-main" href="${escapeHtml(href)}" target="_blank" rel="noreferrer noopener">
          <div class="link-name">${safeName}</div>
          <div class="link-url">${escapeHtml(displayUrl)}</div>
          ${description ? `<div class="link-description">${description}</div>` : ""}
        </a>
        <button class="link-copy" type="button" data-copy="${escapeHtml(href)}" aria-label="${escapeHtml(messages.copy)}" title="${escapeHtml(messages.copy)}">${iconSvg.copy}</button>
      </article>`;
    })
    .join("");

  return `<!doctype html>
<html lang="${escapeHtml(language)}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="noindex,nofollow,noarchive,nosnippet,noimageindex">
    <meta property="og:type" content="website">
    <meta property="og:locale" content="${escapeHtml(locale)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${escapeHtml(ogImageUrl)}">
    <meta property="og:image:alt" content="${escapeHtml(title)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(ogImageUrl)}">
    <meta name="theme-color" content="#edf1f7" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#06101f" media="(prefers-color-scheme: dark)">
    <meta name="theme-color" content="${language === "ko" ? "#06101f" : "#edf1f7"}" data-dynamic-theme>
    ${pageUrl ? `<link rel="canonical" href="${escapeHtml(pageUrl)}">` : ""}
    ${pageUrl ? `<meta property="og:url" content="${escapeHtml(pageUrl)}">` : ""}
    <script>${initialThemeScript}</script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${escapeHtml(stylesheetPath)}">
    <script type="application/ld+json">${structuredDataJson}</script>
  </head>
  <body data-ready="false">
    <div class="boot" id="boot" data-visible="true" aria-live="polite" aria-busy="true">
      <div class="boot-panel">
        <div class="boot-spinner" aria-hidden="true"></div>
      </div>
    </div>
    <div class="toast" id="toast" data-visible="false" aria-live="polite" aria-atomic="true"></div>
    <main class="page">
      <section class="toolbar" aria-label="Controls">
        <div class="lang-switch" role="group" aria-label="Language">
          ${data.languages.includes("ko") ? `<button class="lang-button" id="lang-ko" type="button" data-language="ko" aria-pressed="${language === "ko" ? "true" : "false"}">&#54620;&#44397;&#50612;</button>` : ""}
          ${data.languages.includes("en") ? `<button class="lang-button" id="lang-en" type="button" data-language="en" aria-pressed="${language === "en" ? "true" : "false"}">English</button>` : ""}
        </div>
        <div class="theme-switch" role="group" aria-label="Theme">
          <button class="theme-button" id="theme-light" type="button" data-theme-mode="light" aria-pressed="${data.defaultTheme === "dark" ? "false" : "true"}" aria-label="Light mode">${iconSvg.sun}</button>
          <button class="theme-button" id="theme-dark" type="button" data-theme-mode="dark" aria-pressed="${data.defaultTheme === "dark" ? "true" : "false"}" aria-label="Dark mode">${iconSvg.moon}</button>
        </div>
      </section>
      <section class="hero">
        <aside class="identity">
          <div class="identity-heading">
            <div class="identity-name" id="person-name">${escapeHtml(pickLocalized(data.site.person.name, language, data.fallbackLanguage))}</div>
            <div class="identity-name-sub" id="person-name-sub"${language === "ko" ? "" : " hidden"}>${language === "ko" ? escapeHtml(pickLocalized(data.site.person.name, "en", data.fallbackLanguage)) : ""}</div>
          </div>
          <div id="person-role">${escapeHtml(pickLocalized(data.site.person.role, language, data.fallbackLanguage))}</div>
          <div class="identity-meta">
            <span id="person-location">${escapeHtml(pickLocalized(data.site.person.location, language, data.fallbackLanguage))}</span>
            <span id="person-email">${escapeHtml(pickLocalized(data.site.person.email, language, data.fallbackLanguage))}</span>
          </div>
          <div class="identity-skills" id="person-skills">${(Array.isArray(data.site.skills) ? data.site.skills : []).map((skill) => `<span class="identity-skill">${escapeHtml(skill)}</span>`).join("")}</div>
        </aside>
        <div class="notice" id="only-language-notice" data-visible="${data.languages.length === 1 ? "true" : "false"}">${escapeHtml(messages.onlyLanguage)}</div>
        <div class="notice" id="fallback-notice" data-visible="false">${escapeHtml(messages.fallbackNotice)}</div>
      </section>
      <section class="links" id="links" aria-label="Links">${linksHtml}</section>
      <footer class="footer">
        <div class="footer-site">
          <div class="footer-label" id="footer-site-label">${escapeHtml(messages.siteUrl)}</div>
          <a class="footer-url" id="footer-site-link" href="${escapeHtml(pageUrl || "#")}"${pageUrl ? "" : " hidden"}>${escapeHtml(displaySiteUrl)}</a>
        </div>
        <div class="footer-actions">
          <button class="footer-copy" id="footer-copy" type="button" data-copy="${escapeHtml(pageUrl)}"${pageUrl ? "" : " hidden"} aria-label="${escapeHtml(messages.copy)}" title="${escapeHtml(messages.copy)}">${iconSvg.copy}</button>
          <button class="footer-share" id="footer-share" type="button" data-share-url="${escapeHtml(pageUrl)}"${pageUrl ? "" : " hidden"} aria-label="${escapeHtml(messages.shareLink)}" title="${escapeHtml(messages.shareLink)}">
            ${iconSvg.share}
            <span class="footer-share-text">${escapeHtml(messages.share)}</span>
          </button>
        </div>
      </footer>
    </main>
    <script type="module" src="${escapeHtml(appScriptPath)}"></script>
  </body>
</html>`;
}

async function main() {
  const raw = await fs.readFile(contentPath, "utf8");
  const parsed = YAML.parse(raw);
  const { site, links } = parsed;
  const { languages, fallbackLanguage, prerenderLanguage } = resolveLanguageState(site);

  const builtLinks = [];
  for (const link of links) {
    const descriptionConfigured = Object.prototype.hasOwnProperty.call(link, "description");
    const primaryUrl = resolveLocalizedUrl(link.url, fallbackLanguage);
    const metadata = await fetchMetadata(primaryUrl);
    const fallbacks = buildMetaFallbacks(primaryUrl);
    builtLinks.push({
      url: link.url,
      displayUrl: typeof link.url === "string"
        ? toDisplayUrl(link.url)
        : Object.fromEntries(
            Object.entries(link.url).map(([key, value]) => [key, toDisplayUrl(value)])
          ),
      name: link.name || metadata?.title || fallbacks.name,
      descriptionConfigured,
      description: descriptionConfigured ? link.description : null,
      metadataName: metadata?.title || "",
      metadataDescription: metadata?.description
        ? { [fallbackLanguage]: metadata.description, en: metadata.description, ko: metadata.description }
        : null,
      fallbackName: fallbacks.name,
      fallbackDescription: fallbacks.description,
      icon: typeof link.icon === "string"
        ? { kind: "inline", value: link.icon }
        : inferIcon(primaryUrl, metadata?.iconUrl || "")
    });
  }

  const buildData = {
    site,
    links: builtLinks,
    languages,
    fallbackLanguage,
    prerenderLanguage,
    siteUrl: typeof site.url === "string" ? site.url : "",
    defaultLanguage: normalizeLanguage(site.defaultLanguage) || "auto",
    defaultTheme: ["system", "light", "dark"].includes(site.theme?.defaultMode) ? site.theme.defaultMode : "system"
  };

  const css = buildCss();
  const appJs = buildClientScript(buildData);
  const ogImageSvg = buildOgImageSvg(buildData);
  const ogImagePng = await sharp(Buffer.from(ogImageSvg)).png().toBuffer();
  const stylesHash = createHash("sha256").update(css).digest("hex").slice(0, 12);
  const appHash = createHash("sha256").update(appJs).digest("hex").slice(0, 12);
  const ogImageHash = createHash("sha256").update(ogImagePng).digest("hex").slice(0, 12);

  buildData.assetPaths = {
    styles: `./assets/styles.${stylesHash}.css`,
    app: `./assets/app.${appHash}.js`,
    ogImage: `./assets/og-image.${ogImageHash}.png`
  };

  const html = buildHtml(buildData);

  await fs.rm(assetsDir, { recursive: true, force: true });
  await fs.mkdir(assetsDir, { recursive: true });
  await fs.writeFile(path.join(assetsDir, `styles.${stylesHash}.css`), css, "utf8");
  await fs.writeFile(path.join(assetsDir, `app.${appHash}.js`), appJs, "utf8");
  await fs.writeFile(path.join(assetsDir, "og-image.svg"), ogImageSvg, "utf8");
  await fs.writeFile(path.join(assetsDir, `og-image.${ogImageHash}.png`), ogImagePng);
  await fs.writeFile(path.join(docsDir, "index.html"), html, "utf8");
  await fs.writeFile(
    path.join(docsDir, ".nojekyll"),
    "",
    "utf8"
  );

  const hash = createHash("sha256").update(JSON.stringify(buildData)).digest("hex").slice(0, 12);
  console.log(`Generated docs/index.html (${hash})`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

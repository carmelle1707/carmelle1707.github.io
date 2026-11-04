import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getSiteContent } from "@/lib/content";
import { parseEmphasis } from "@/lib/rich-title";
import { siteUrl } from "@/lib/site-url";

export const alt = "Ange Carmelle Gbedji, développeuse web et mobile à Abidjan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Mêmes couleurs que le bandeau sombre du site : nuit, or pour l'accent, texte clair
const NIGHT = "#0f1b2d";
const GOLD = "#d2a44a";
const INK = "#eef1f6";
const MUTED = "#9aa7bb";

/** Photo en data URL : fichier de public/ lu sur le disque, ou adresse Blob absolue. */
async function photoSrc(url: string | undefined) {
  if (!url) return null;
  if (/^https:\/\//.test(url)) return url;
  try {
    const file = await readFile(join(process.cwd(), "public", url));
    const type = url.endsWith(".png") ? "image/png" : "image/jpeg";
    return `data:${type};base64,${file.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const { profile } = await getSiteContent();
  const photo = await photoSrc(profile.photo?.url);
  const host = siteUrl().replace(/^https?:\/\//, "");

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: NIGHT,
        color: INK,
        padding: 64,
        gap: 56,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 3, color: GOLD }}>
          {`${profile.role} · ${profile.location}`.toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            marginTop: 36,
            fontSize: 62,
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: -1.5,
          }}
        >
          {parseEmphasis(profile.headline).map((part, i) => (
            <span key={i} style={{ color: part.em ? GOLD : INK, whiteSpace: "pre-wrap" }}>
              {part.text}
            </span>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: "auto",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
          }}
        >
          <span style={{ fontWeight: 700 }}>{profile.name}</span>
          <span style={{ color: MUTED }}>{host}</span>
        </div>
      </div>
      {photo && (
        <img
          src={photo}
          alt=""
          width={340}
          height={502}
          style={{ objectFit: "cover", borderRadius: 22, border: `2px solid ${GOLD}` }}
        />
      )}
    </div>,
    { ...size },
  );
}

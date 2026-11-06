import type { Metadata, Viewport } from "next";
import { themeScript } from "@/components/site/theme-toggle";
import { fontVariables } from "@/lib/fonts";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

// Valeurs par défaut ; la page d'accueil les précise à partir du contenu (generateMetadata)
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  // Search Console › Ajouter une propriété › Préfixe d'URL › Balise HTML : le code du content="…"
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  title: "Ange Carmelle Gbedji",
  description:
    "Ange Carmelle Gbedji, développeuse web et mobile freelance à Abidjan. Sites vitrines, applications web et applications mobiles pour PME, commerces et startups.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1220" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

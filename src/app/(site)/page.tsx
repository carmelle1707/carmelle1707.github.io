import type { Metadata } from "next";
import { Background } from "@/components/site/background";
import { ContactSection } from "@/components/site/contact-section";
import { Hero } from "@/components/site/hero";
import { Marquee } from "@/components/site/marquee";
import { Method } from "@/components/site/method";
import { Projects } from "@/components/site/projects";
import { Services } from "@/components/site/services";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SiteMotion } from "@/components/site/site-motion";
import { getSiteContent } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import { jsonLdString, structuredData } from "@/lib/structured-data";

/** Titre et description tirés du profil : ils suivent les modifications faites dans l'admin. */
export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getSiteContent();
  const title = `${profile.name} · ${profile.role} à Abidjan`;
  return {
    title,
    description: profile.lead,
    alternates: { canonical: "/" },
    openGraph: {
      type: "profile",
      locale: "fr_FR",
      url: "/",
      siteName: profile.name,
      title,
      description: profile.lead,
    },
    twitter: { card: "summary_large_image", title, description: profile.lead },
  };
}

export default async function HomePage() {
  const c = await getSiteContent();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(structuredData(c, siteUrl())) }}
      />
      <div className="grain" aria-hidden="true" />
      <SiteHeader shortName={c.profile.shortName || c.profile.name} />
      <main id="top">
        <Hero profile={c.profile} contact={c.contact} />
        <Marquee marquee={c.marquee} skills={c.skills} />
        <Services services={c.services} />
        <Method steps={c.steps} />
        <Projects projects={c.projects} />
        <Background skills={c.skills} education={c.education} profile={c.profile} />
        <ContactSection contact={c.contact} profile={c.profile} />
      </main>
      <SiteFooter name={c.profile.name} />
      <SiteMotion />
    </>
  );
}

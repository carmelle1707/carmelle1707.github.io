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

export default async function HomePage() {
  const c = await getSiteContent();
  return (
    <>
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

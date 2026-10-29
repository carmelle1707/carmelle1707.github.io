import type { SiteContent } from "@/lib/content-types";
import { githubHandle, whatsappLink } from "@/lib/links";
import { RichTitle, stripEmphasis } from "@/lib/rich-title";
import { ContactForm } from "./contact-form";

function Arrow() {
  return (
    <span className="arr" aria-hidden="true">
      →
    </span>
  );
}

export function ContactSection({ contact, profile }: Pick<SiteContent, "contact" | "profile">) {
  const wa = whatsappLink(contact.whatsapp);
  return (
    <section id="contact" className="band py-24" aria-labelledby="contact-title">
      <div className="wrap grid items-end gap-12 min-[861px]:grid-cols-[1.2fr_1fr]">
        <div data-reveal>
          <span className="eyebrow">Contact</span>
          <h2
            id="contact-title"
            className="contact-title mt-3.5 text-[clamp(40px,6.4vw,76px)] font-extrabold"
            aria-label={stripEmphasis(contact.title)}
            data-fill
          >
            <RichTitle text={contact.title} />
          </h2>
          {contact.text && <p className="mt-[18px] max-w-[46ch] text-band-muted">{contact.text}</p>}
        </div>
        <div className="grid gap-3">
          {wa && (
            <a className="channel main" href={wa} target="_blank" rel="noopener" data-reveal>
              <strong className="inline-flex items-center gap-2 font-semibold">
                WhatsApp <Arrow />
              </strong>
              <span>{contact.whatsapp}</span>
            </a>
          )}
          {contact.email && (
            <a className="channel" href={`mailto:${contact.email}`} data-reveal>
              <strong className="inline-flex items-center gap-2 font-semibold">
                Email <Arrow />
              </strong>
              <span>{contact.email}</span>
            </a>
          )}
          {contact.linkedin && (
            <a
              className="channel"
              href={contact.linkedin}
              target="_blank"
              rel="noopener"
              data-reveal
            >
              <strong className="inline-flex items-center gap-2 font-semibold">
                LinkedIn <Arrow />
              </strong>
              <span>{profile.name}</span>
            </a>
          )}
          {contact.github && (
            <a className="channel" href={contact.github} target="_blank" rel="noopener" data-reveal>
              <strong className="inline-flex items-center gap-2 font-semibold">
                GitHub <Arrow />
              </strong>
              <span>{githubHandle(contact.github)}</span>
            </a>
          )}
        </div>
      </div>

      <div className="wrap mt-20">
        <div className="grid gap-10 border-t border-band-dim pt-14 min-[861px]:grid-cols-[1fr_1.6fr] min-[861px]:gap-16">
          <div data-reveal>
            <h3 className="text-[clamp(26px,3vw,34px)] font-extrabold">
              Ou décrivez-moi{" "}
              <em className="font-serif font-normal text-gold italic">votre projet</em>
            </h3>
            <p className="mt-3 max-w-[38ch] text-band-muted">
              Quelques lignes suffisent. Je reçois votre message par email et je vous réponds
              directement.
            </p>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

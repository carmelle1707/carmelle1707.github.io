import { useRef } from "react";
import { CONTACT, PROFILE } from "../content/site";
import { gsap } from "../motion/scroll";
import { magnetic, pick, useMotion } from "../motion/useMotion";
import { Words } from "../motion/split";
import { ContactForm } from "./ContactForm";
import { Chapter } from "./Sections";

/**
 * Contact. La nuit monte derrière la tour, une dernière plaque dorée vient la coiffer,
 * et la question arrive mot à mot. Un message envoyé fait remonter un éclair le long de la pile.
 */
export function Contact() {
  const ref = useRef<HTMLElement>(null);

  useMotion(ref, (root) => {
    const title = root.querySelector("#contact-title");
    gsap.fromTo(
      pick(root, "#contact-title .w"),
      { yPercent: 110 },
      {
        yPercent: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: title, start: "top 82%", toggleActions: "play none none reverse" },
      },
    );
    const form = root.querySelector(".contact-form");
    gsap.fromTo(
      pick(root, ".section-lead, .contact-form .field, .contact-form .form-foot, .contact-list li"),
      { y: 28, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.05, scrollTrigger: { trigger: form ?? root, start: "top 88%" } },
    );
    return magnetic(root.querySelector<HTMLElement>(".form-foot .btn"));
  });

  return (
    <Chapter ref={ref} id="contact" className="contact" labelledBy="contact-title" window="start">
      <h2 id="contact-title">
        <Words text={"Un projet en tête\u00a0? Écrivez-moi."} mask />
      </h2>
      <p className="section-lead">Je réponds sous 24 h.</p>
      <ContactForm />
      <ul className="contact-list">
        {CONTACT.whatsapp && (
          <li>
            <span>WhatsApp</span>
            <a href={CONTACT.whatsapp.href} target="_blank" rel="noopener">
              {CONTACT.whatsapp.label}
            </a>
          </li>
        )}
        {CONTACT.email && (
          <li>
            <span>Email</span>
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          </li>
        )}
        {CONTACT.linkedin && (
          <li>
            <span>LinkedIn</span>
            <a href={CONTACT.linkedin} target="_blank" rel="noopener">
              {PROFILE.name}
            </a>
          </li>
        )}
        {CONTACT.github && (
          <li>
            <span>GitHub</span>
            <a href={CONTACT.github} target="_blank" rel="noopener">
              {CONTACT.github.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
            </a>
          </li>
        )}
        {PROFILE.cv && (
          <li>
            <span>CV</span>
            <a href={PROFILE.cv} target="_blank" rel="noopener">
              Télécharger le PDF
            </a>
          </li>
        )}
      </ul>
    </Chapter>
  );
}

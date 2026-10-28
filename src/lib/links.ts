/** Lien wa.me à partir d'un numéro saisi librement (+225 01 05 …). */
export function whatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

/** « https://github.com/carmelle1707 » → « carmelle1707 » */
export function githubHandle(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?github\.com\//, "").replace(/\/$/, "");
}

export function initials(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "•"
  );
}

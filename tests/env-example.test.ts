import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// .env.example est public (commité sur GitHub) : aucune vraie valeur secrète ne doit y entrer.
const SECRET_KEYS = [
  "MONGODB_URI",
  "AUTH_SECRET",
  "ADMIN_EMAIL",
  "ADMIN_PASSWORD",
  "BLOB_READ_WRITE_TOKEN",
  "RESEND_API_KEY",
  "RATE_LIMIT_SALT",
  "GOOGLE_SITE_VERIFICATION",
];

describe(".env.example", () => {
  const lines = readFileSync(".env.example", "utf8").split(/\r?\n/);

  it.each(SECRET_KEYS)("%s y reste vide", (key) => {
    const line = lines.find((l) => l.startsWith(`${key}=`));
    if (line) expect(line).toBe(`${key}=`);
  });
});

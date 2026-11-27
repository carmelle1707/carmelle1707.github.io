import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/contact-submission", () => ({
  submitContact: vi.fn(async () => ({ status: "success" })),
}));

import { POST, OPTIONS } from "@/app/api/public/contact/route";
import { submitContact } from "@/lib/contact-submission";
import { V2_URL, corsHeaders } from "@/lib/v2";

function post(origin: string | null) {
  const body = new FormData();
  body.set("name", "Awa");
  const headers = new Headers({ "x-forwarded-for": "2.2.2.2, 10.0.0.1" });
  if (origin) headers.set("origin", origin);
  return new Request("http://localhost/api/public/contact", { method: "POST", body, headers });
}

describe("API publique pour la V2", () => {
  it("n'autorise que la V2 et le local", () => {
    expect(corsHeaders(V2_URL)["Access-Control-Allow-Origin"]).toBe(V2_URL);
    expect(corsHeaders("https://ailleurs.example")["Access-Control-Allow-Origin"]).toBeUndefined();
  });

  it("transmet le message de la V2 avec l'IP du visiteur", async () => {
    const res = await POST(post(V2_URL));
    expect(res.status).toBe(200);
    expect(res.headers.get("access-control-allow-origin")).toBe(V2_URL);
    expect(submitContact).toHaveBeenCalledWith(expect.any(FormData), "2.2.2.2");
  });

  it("refuse une autre origine", async () => {
    vi.mocked(submitContact).mockClear();
    const res = await POST(post("https://ailleurs.example"));
    expect(res.status).toBe(403);
    expect(submitContact).not.toHaveBeenCalled();
  });

  it("répond au pré-vol CORS", () => {
    const res = OPTIONS(new Request("http://x", { headers: { origin: V2_URL } }));
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-methods")).toContain("POST");
  });
});

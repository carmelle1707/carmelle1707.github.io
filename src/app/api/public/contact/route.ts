import { submitContact } from "@/lib/contact-submission";
import { allowedOrigins, corsHeaders } from "@/lib/v2";

/**
 * Formulaire de contact de la V2 : mêmes règles que celui du site (validation, anti-spam,
 * 5 messages par heure), et le message arrive dans la même boîte de l'admin.
 */
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);
  if (!origin || !allowedOrigins().includes(origin)) {
    return Response.json({ status: "error", message: "Origine non autorisée." }, { status: 403, headers });
  }
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ status: "error", message: "Formulaire illisible." }, { status: 400, headers });
  }
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "inconnue";
  const state = await submitContact(formData, ip);
  return Response.json(state, { status: state.status === "error" ? 422 : 200, headers });
}

export function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

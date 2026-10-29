import { type HandleUploadBody, handleUpload } from "@vercel/blob/client";
import { auth } from "@/auth";
import { UPLOAD_RULES, type UploadKind } from "@/lib/upload-rules";

/**
 * Envoi direct navigateur → Vercel Blob : le fichier ne passe pas par nos fonctions
 * (pas de limite de 4,5 Mo). Ici, on ne fait que délivrer un jeton, à l'admin seulement.
 */
export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      { error: "Stockage non configuré : BLOB_READ_WRITE_TOKEN manque dans .env.local." },
      { status: 503 },
    );
  }
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        const session = await auth();
        if (!session?.user) throw new Error("Session expirée : reconnectez-vous.");
        const kind: UploadKind = clientPayload === "pdf" ? "pdf" : "image";
        const rule = UPLOAD_RULES[kind];
        return {
          allowedContentTypes: [...rule.types],
          maximumSizeInBytes: rule.maxBytes,
          addRandomSuffix: true,
        };
      },
    });
    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Envoi impossible.";
    return Response.json({ error: message }, { status: 400 });
  }
}

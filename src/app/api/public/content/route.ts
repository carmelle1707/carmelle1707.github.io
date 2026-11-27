import { getPagesContent } from "@/lib/pages";
import { corsHeaders } from "@/lib/v2";

/**
 * Contenu public en lecture seule, pour la V2 : ce que la page d'accueil affiche déjà
 * (aucun message, aucun compte). Les projets portent leur slug de page.
 */
export async function GET(request: Request) {
  const { content, projects } = await getPagesContent();
  return Response.json(
    { ...content, projects },
    {
      headers: {
        ...corsHeaders(request.headers.get("origin")),
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=86400",
      },
    },
  );
}

export function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

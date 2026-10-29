/**
 * Compte admin des tests de bout en bout. Il n'existe que dans la base jetable
 * démarrée par scripts/e2e-server.ts : ce ne sont pas de vrais identifiants.
 */
export const E2E_ADMIN = {
  email: "admin@e2e.test",
  password: "mot-de-passe-e2e-123",
} as const;

export const E2E_PORT = 3100;

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { afterAll, afterEach, beforeAll } from "vitest";

/** Démarre une base MongoDB jetable pour le fichier de test courant. */
export function setupMemoryDb() {
  let server: MongoMemoryServer;

  beforeAll(async () => {
    // Plusieurs fichiers de test démarrent leur base en même temps : on laisse du temps
    // aux machines chargées (10 s par défaut)
    server = await MongoMemoryServer.create({ instance: { launchTimeout: 60_000 } });
    process.env.MONGODB_URI = server.getUri("portfolio-test");
    await mongoose.connect(process.env.MONGODB_URI);
    await mongoose.connection.syncIndexes();
  });

  afterEach(async () => {
    const { collections } = mongoose.connection;
    await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await server?.stop();
  });
}

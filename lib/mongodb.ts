import { Db, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI?.trim();
const dbName = process.env.MONGODB_DB?.trim() || "rapidreach";

const globalForMongo = globalThis as typeof globalThis & {
  rapidReachMongoClientPromise?: Promise<MongoClient>;
};

function createClientPromise() {
  if (!uri) throw new Error("MONGODB_URI is not configured");

  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 5000,
  });

  return client.connect();
}

export function hasDatabase() {
  return Boolean(uri);
}

export async function getDb(): Promise<Db> {
  if (!uri) throw new Error("MONGODB_URI is not configured");

  if (!globalForMongo.rapidReachMongoClientPromise) {
    globalForMongo.rapidReachMongoClientPromise = createClientPromise().catch((error) => {
      globalForMongo.rapidReachMongoClientPromise = undefined;
      throw error;
    });
  }

  const client = await globalForMongo.rapidReachMongoClientPromise;
  return client.db(dbName);
}

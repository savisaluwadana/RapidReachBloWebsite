import { Db, MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "rapidreach";

let clientPromise: Promise<MongoClient> | null = null;

export function hasDatabase() {
  return Boolean(uri);
}

export async function getDb(): Promise<Db> {
  if (!uri) throw new Error("MONGODB_URI is not configured");

  if (!clientPromise) {
    const client = new MongoClient(uri, { maxPoolSize: 10 });
    clientPromise = client.connect();
  }

  const client = await clientPromise;
  return client.db(dbName);
}

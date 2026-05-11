import { MongoClient } from "mongodb";

const dbName = process.env.MONGODB_DB || "ansame";

type CachedMongo = {
  client?: MongoClient;
  promise?: Promise<MongoClient>;
};

const globalForMongo = globalThis as typeof globalThis & {
  _ansaMeMongo?: CachedMongo;
};

const cached = globalForMongo._ansaMeMongo || {};
globalForMongo._ansaMeMongo = cached;

export async function getDb() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("Missing MONGODB_URI environment variable");
  }

  if (!cached.promise) {
    cached.client = new MongoClient(uri);
    cached.promise = cached.client.connect();
  }

  const client = await cached.promise;
  return client.db(dbName);
}

import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "tutorconnect";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  // Ensure unique index on email (idempotent)
  await db.collection(USERS_COLLECTION).createIndex({ email: 1 }, { unique: true });
  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

export async function getDb(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}

export type UserDoc = {
  _id?: import("mongodb").ObjectId;
  email: string;
  passwordHash: string;
  name: string | null;
  role: "student" | "teacher" | "admin";
  createdAt?: Date;
  updatedAt?: Date;
};

export const USERS_COLLECTION = "users";

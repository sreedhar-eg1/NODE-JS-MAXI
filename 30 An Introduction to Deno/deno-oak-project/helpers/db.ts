import { MongoClient } from "mongodb";

export const client = new MongoClient(
  "mongodb+srv://sreedhareg1997_db_user:eT6lQe9C74f65Jpq@node-complete.ra50bsw.mongodb.net",
);

export async function connectToDatabase() {
  await client.connect();

  console.log("Connected to MongoDB");

  const db = client.db("todo-app");

  return db;
}

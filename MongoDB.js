import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const mongourl = process.env.Mongo_URL;

const client = new MongoClient(mongourl);
export async function MongoConnect() {
    try {
        await client.connect(); // ❗ Await the connection
        const db = client.db(); // 👈 You can optionally pass the DB name here: client.db("your-db-name")
        console.log("DB is connected...");
        return db;
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err);
        throw err; // 👈 So calling code knows something went wrong
    }
}

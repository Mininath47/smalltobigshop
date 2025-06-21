import express from "express";
import cors from "cors";
import { MongoConnect } from "./MongoDB.js";
import process from "node:process";
import dotenv from "dotenv";
dotenv.config()

const app = express();
const db = await MongoConnect();
const Port = process.env.PORT || 6000;
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/products", async (req, res) => {
    const collection = await db.collection("products").find().toArray();
    res.send(collection);
});

app.get("/products/id/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const collection = await db.collection("products").find({ id: id }).toArray();
    res.send(collection);
});

app.get("/products/category/:category", async (req, res) => {
    const category = req.params.category;
    const collection = await db.collection("products").find({ category: category }).toArray();
    res.send(collection);
});

app.get("/products/categorielist", async (req, res) => {
    try {
        const collection = await db.collection("products").find().toArray();
        
        // Extract all categories from the products
        const categories = collection.map(item => item.category);

        // Optional: remove duplicates
        const uniqueCategories = [...new Set(categories)];

        res.set("Content-Type", "application/json");
        res.json(uniqueCategories);
    } catch (err) {
        res.status(500).send({ error: "Failed to fetch product categories" });
    }
});

app.listen(Port,()=>{
    console.log(`server is running http://127.0.0.1:${Port}`);
});

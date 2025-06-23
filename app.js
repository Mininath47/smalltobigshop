import express from "express";
import cors from "cors";
import { MongoConnect } from "./MongoDB.js";
import process from "node:process";
import dotenv from "dotenv";
// import { createReadStream } from "node:fs/promises";
dotenv.config()

const app = express();
const db = await MongoConnect();
const Port = process.env.PORT || 6000;
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/products", async (req, res) => {
    const collection = await db.collection("demo").find().toArray();
    // const images = await createReadStream("./images/1750502271781.jpg");
    // res.pipe(images);
    res.send(collection);
});

app.get("/products/id/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const collection = await db.collection("demo").find({ id: id }).toArray();
    res.send(collection);
});

// Route: Get categories only
app.get("/categories", async (req, res) => {
  try {
    const raw = await db.collection("demo").find({}).toArray(); // 🔁 Replace with your collection
    const categoryBlock = raw.find(doc => Array.isArray(doc.categories));

    if (!categoryBlock || !categoryBlock.categories) {
      return res.status(404).json({ error: "Categories not found" });
    }

    const categories = [];
    for (let i = 0; i < categoryBlock.categories.length; i += 2) {
      categories.push({
        name: categoryBlock.categories[i]?.name || "Unknown",
        image: categoryBlock.categories[i + 1]?.image || "N/A"
      });
    }

    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch categories", details: err });
  }
});


app.get("/products/category/:category", async (req, res) => {
    const category = req.params.category;
    const collection = await db.collection("demo").find({ category: category }).toArray();
    res.send(collection);
});

app.get("/products/categorielist", async (req, res) => {
    try {
        const collection = await db.collection("demo").find().toArray();
        
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

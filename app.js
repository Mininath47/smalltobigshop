import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { writeFile, unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { MongoConnect } from "./MongoDB.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const db = await MongoConnect();
const demoCollection = db.collection("demo")

// Create (POST)
app.post("/products", async (req, res) => {
  const { title, price, category, description, imageBase64 } = req.body;

  if (!imageBase64) return res.status(400).send("Image required");

  const imageName = `${Date.now()}.png`;
  const imagePath = path.join("images", imageName);

  await writeFile(imagePath, imageBase64, "base64");

  const result = await demoCollection.insertOne({
    title,
    price,
    category,
    description,
    image: imageName,
  });

  res.status(201).json(result);
});

// Read All (GET)
app.get("/products", async (req, res) => {
  const projects = await demoCollection.find().toArray();
  res.json(projects);
});
app.get("/products/categories", async (req, res) => {
  const projects = await demoCollection.find().toArray()
  const categoriesdata =  projects.map((items)=>items.categories);
  res.json(categoriesdata);
});

// Read Single (GET)
app.get("/products/:id", async (req, res) => {
  const { ObjectId } = await import("mongodb");
  const project = await demoCollection.findOne({ _id: new ObjectId(req.params.id) });
  if (!project) return res.status(404).send("Not Found");
  res.json(project);
});

// Update Full (PUT)
app.put("/products/:id", async (req, res) => {
  const { ObjectId } = await import("mongodb");
  const { title, price, category, description, imageBase64 } = req.body;

  const old = await demoCollection.findOne({ _id: new ObjectId(req.params.id) });
  if (!old) return res.status(404).send("Not Found");

  let image = old.image;
  if (imageBase64) {
    if (existsSync(`images/${old.image}`)) await unlink(`images/${old.image}`);
    image = `${Date.now()}.png`;
    await writeFile(`images/${image}`, imageBase64, "base64");
  }

  const result = await demoCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    {
      $set: { title, price, category, description, image },
    }
  );

  res.json(result);
});

// Update Partial (PATCH)
app.patch("/products/:id", async (req, res) => {
  const { ObjectId } = await import("mongodb");
  const updateFields = req.body;

  if (updateFields.imageBase64) {
    const old = await demoCollection.findOne({ _id: new ObjectId(req.params.id) });
    if (old?.image && existsSync(`images/${old.image}`)) {
      await unlink(`images/${old.image}`);
    }
    const newImage = `${Date.now()}.png`;
    await writeFile(`images/${newImage}`, updateFields.imageBase64, "base64");
    updateFields.image = newImage;
    delete updateFields.imageBase64;
  }

  const result = await demoCollection.updateOne(
    { _id: new ObjectId(req.params.id) },
    { $set: updateFields }
  );

  res.json(result);
});

// Delete (DELETE)
app.delete("/products/:id", async (req, res) => {
  const { ObjectId } = await import("mongodb");
  const project = await demoCollection.findOne({ _id: new ObjectId(req.params.id) });

  if (!project) return res.status(404).send("Not Found");

  if (existsSync(`images/${project.image}`)) {
    await unlink(`images/${project.image}`);
  }

  const result = await demoCollection.deleteOne({ _id: new ObjectId(req.params.id) });
  res.json(result);
});

app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`)
);

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoConnect } from "./MongoDB.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT || 6000;

// const mongoURL = "mongodb://localhost:27017";
// const client = new MongoClient(mongoURL);
// await client.connect();

const db = await MongoConnect();

const productsCollection = db.collection("products");
const categoriesCollection = db.collection("products");

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/**
 * GET all products
 */
app.get("/products", async (req, res) => {
  const products = await productsCollection.find().toArray();
 const prolist = products.map((items)=>items.products);
 res.send(prolist)
});

/**
 * GET all categories (with name and image)
 */



app.get("/categories", async (req, res) => {
  const categoriesRaw = await categoriesCollection.findOne();
  
  // Handle the alternating name/image array structure
  const categories = [];
  for (let i = 0; i < categoriesRaw.categories.length; i += 2) {
    const nameObj = categoriesRaw.categories[i];
    const imageObj = categoriesRaw.categories[i + 1];
    categories.push({
      name: nameObj.name,
      image: imageObj.image
    });
  }

  res.json(categories);
});

/**
 * GET products by category name
 */
app.get("/categories/:name", async (req, res) => {
  const categoryName = req.params.name;
  const matchedProducts = await productsCollection.find({ category: categoryName }).toArray();
  res.json(matchedProducts);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

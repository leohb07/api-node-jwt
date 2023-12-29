import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { MongoClient } from "mongodb";

const URI = process.env.MONGO_URI;
const client = new MongoClient(URI);

client.connect();
console.log("Connected to Mongo");

const database = client.db("jwt-api");

const userdb = database.collection("users");

const app = express();

app.use(cors());
app.use(express.json());

app.listen(3333, () => {
  console.log("Api Running");
});

app.post("/signup", async (request, response) => {
  const newUser = {
    email: request.body.email,
    password: request.body.password,
  };

  const hashedPassword = await bcrypt.hash(newUser.password, 10);

  userdb.insertOne({
    email: newUser.email,
    password: hashedPassword,
  });

  response.status(201).send("User was added");
});

app.post("/login", async (request, response) => {
  const user = await userdb.findOne({
    email: request.body.email,
  });

  if (user) {
    const userAllowed = await bcrypt.compare(
      request.body.password,
      user.password
    );

    if (userAllowed) {
      const accessToken = jwt.sign(user, "secret-key");
      response.status(200).send({ accessToken: accessToken });
      return;
    }

    response.status(401).send("No user found or invalid password");
  }
});

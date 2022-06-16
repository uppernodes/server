import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import path from "path";
import mongoose from "mongoose";
import fs from "fs";

import authRoutes from "./routes/Auth";
import courseRoutes from "./routes/Course";
import userRoutes from "./routes/User";

import { checkAuthMiddleware, isInstructor } from "./middlewares";

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_DATABASE;
const server = `mongodb+srv://${user}:${password}@0.28cdt.mongodb.net/${database}?retryWrites=true&w=majority`;

const config = { useNewUrlParser: true, useUnifiedTopology: true };

mongoose.connect(server, config).then(() => {
  console.log("Database connection successfully!");
});

const port = 5556;
const version = 0;

const __dirname = path.resolve();
app.use("/images", express.static(path.join(__dirname, "assets")));

app.use(`/auth`, authRoutes);
app.use(`/user`, userRoutes);
app.use(`/course`, checkAuthMiddleware, isInstructor, courseRoutes);

// app.delete("/delete", async (req, res) => {
//   try {
//     await Usuario.deleteMany();
//     return res.status(201).send("Todos usuarios foram excluidos com sucesso!");
//   } catch (err) {
//     return res.status(400).send("Ops erro no metodod");
//   }
// });

app.listen(port, () => {
  console.log("Servidor rodando na porta", port);
});

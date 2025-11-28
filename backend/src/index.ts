import express from "express";
import { prisma } from "./prisma.js"
const app = express();

app.use(express.json());

app.get("/users", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post("/users", async (req, res) => {
  const { email, name } = req.body;
  const newUser = await prisma.user.create({
    data: { email, name },
  });
  res.json(newUser);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
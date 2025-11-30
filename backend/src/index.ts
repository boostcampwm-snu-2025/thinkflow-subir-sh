import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";
import itemsRouter from "./items/items.route.js";
import tagsRouter from "./tags/tags.route.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/items", itemsRouter);
app.use("/tags", tagsRouter);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, () => {
  console.log("Server running on http://localhost:3000");
});
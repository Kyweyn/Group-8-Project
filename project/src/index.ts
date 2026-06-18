// index.ts - main entry point for the app
import express from "express";
import usersRouter from "./routes/users";
import productsRouter from "./routes/products";

const app = express();
const PORT = 3001;

app.use(express.json());

// quick home route so I know the server is alive
app.get("/", (req, res) => {
  res.send("Server is running! Try /users or /products");
});

// register my route files here
// pattern: app.use(prefix, router)
app.use("/users", usersRouter);
app.use("/products", productsRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

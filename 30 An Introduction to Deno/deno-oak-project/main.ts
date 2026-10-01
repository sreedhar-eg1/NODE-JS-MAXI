import { Application } from "@oak/oak";

import { connectToDatabase } from "./helpers/db.ts";

import todoRouter from "./routes/todo.ts";

const app = new Application();

await connectToDatabase();


app.use(async (_, next) => {
  console.log("Some middleware");
  await next();
});

app.use(async (ctx, next) => {
  ctx.response.headers.set("Access-Control-Allow-Origin", "*");
  ctx.response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE",
  );
  ctx.response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  await next();
});

app.use(todoRouter.routes());
app.use(todoRouter.allowedMethods());

console.log("Server running on http://localhost:8000");

await app.listen({ port: 8000 });

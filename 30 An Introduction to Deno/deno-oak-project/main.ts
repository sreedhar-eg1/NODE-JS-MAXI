import { Application } from "@oak/oak";

import todoRouter from "./routes/todo.ts";

const app = new Application();

app.use(async (_, next) => {
  console.log("Some middleware");
  await next();
});

app.use(todoRouter.routes());
app.use(todoRouter.allowedMethods());

console.log("Server running on http://localhost:8000");

await app.listen({ port: 8000 });

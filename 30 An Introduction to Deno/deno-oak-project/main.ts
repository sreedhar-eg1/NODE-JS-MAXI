import { Application } from "@oak/oak";

const app = new Application();

app.use((ctx) => {
  ctx.response.body = "Hello from Oak!";
});

console.log("Server running on http://localhost:8000");

await app.listen({ port: 8000 });
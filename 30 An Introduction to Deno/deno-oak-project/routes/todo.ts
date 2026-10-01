import { Router } from "@oak/oak";

import { Todo } from "../models/todo.ts";

const router = new Router({
  prefix: "/todos",
});

let todos: Todo[] = [];

router.get("/", (ctx, next) => {
  ctx.response.body = { todos };
});

router.post("/", async (ctx) => {
  const body = await ctx.request.body.json();

  const newTodo: Todo = {
    id: new Date().toISOString(),
    text: body.text,
  };

  todos.push(newTodo);

  ctx.response.body = {
    message: "Created new todo item",
    todo: newTodo,
  };
});

router.put("/:todoId", async (ctx) => {
  const todoId = ctx.params.todoId;
  const body = await ctx.request.body.json();

  const index = todos.findIndex((todo) => todo.id === todoId);

  if (index >= 0) {
    todos[index] = { id: todos[index].id, text: body.text };

    ctx.response.status = 201;
    ctx.response.body = { message: "Updated todo", todo: todos[index] };

    return;
  }

  ctx.response.status = 404;
  ctx.response.body = { message: "Could not find todo for this ID" };
});

router.delete("/:todoId", (ctx) => {
  const todoId = ctx.params.todoId;

  const index = todos.findIndex((todo) => todo.id === todoId);

  if (index >= 0) {
    todos = todos.filter((todo) => todo.id !== todoId);

    ctx.response.status = 201;
    ctx.response.body = { message: "Deleted todo item" };

    return;
  }

  ctx.response.status = 404;
  ctx.response.body = { message: "Could not find todo for this ID" };
});

export default router;

import { Router } from "express";

import { RequestBody, RequestParams, Todo } from "../models/todo";

const router = Router();

let todos: Todo[] = [];

router.get("/", (req, res, next) => {
  res.status(200).json({ todos });
});

router.post("/todo", (req, res, next) => {
  const body = req.body as RequestBody;

  const newTodo: Todo = {
    id: new Date().toISOString(),
    text: body.text,
  };

  todos.push(newTodo);

  res.status(201).json({ message: "Created todo", todo: newTodo });
});

router.put("/todo/:todoId", (req, res, next) => {
  const params = req.params as RequestParams
  const body = req.body as RequestBody;

  const todoId = params.todoId;

  const index = todos.findIndex((todo) => todo.id === todoId);

  if (index >= 0) {
    todos[index] = { id: todos[index].id, text: body.text };
    return res
      .status(201)
      .json({ message: "Updated todo", todo: todos[index] });
  }

  res.status(404).json({ message: "Could not find todo for this ID" });
});

router.delete("/todo/:todoId", (req, res, next) => {
  const params = req.params as RequestParams

  const todoId = params.todoId;

  const index = todos.findIndex((todo) => todo.id === todoId);

  if (index >= 0) {
    todos = todos.filter((todo) => todo.id !== todoId);
    return res.status(201).json({ message: "Deleted todo item" });
  }

  res.status(404).json({ message: "Could not find todo for this ID" });
});

export default router;

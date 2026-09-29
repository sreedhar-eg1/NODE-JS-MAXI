import { Router } from "express";

const router = Router();

const todos: any = [];

router.get("/", (req, res, next) => {
  res.status(200).json({ todos });
});



export default router;

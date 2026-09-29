import express from "express";
import bodyParser from "body-parser";

import todosRoute from "./routes/todos";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(todosRoute);

app.listen(3000, () => console.log("Server is running at port 3000"));

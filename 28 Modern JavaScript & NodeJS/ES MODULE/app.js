// const express = require("express");
import express from 'express'

// const resHandler = require("./resHandler");
import resHandler from './resHandler.js';

const app = express();

app.get("/", resHandler);

app.listen(3000, () => console.log("Server running at port 3000"));

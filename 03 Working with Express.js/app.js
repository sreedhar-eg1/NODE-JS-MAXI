const http = require("http");

const express = require("express")

// Create an Express application
const app = express()

// To add new middleware, use app.use()
app.use((req, res, next) => {
    console.log("In one middleware")
    next(); // Call next() to pass control to the next middleware
})

app.use((req, res, next) => {
    console.log("In another middleware")
})

const server = http.createServer(app);

server.listen(3000);

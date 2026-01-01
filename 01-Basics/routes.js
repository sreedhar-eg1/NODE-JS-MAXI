const fs = require("fs");

const requestHandler = (req, res) => {
  console.log("Listening");
  //   console.log(req);

  //   Some important request properties
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", req.headers);

  const url = req.url;
  const method = req.method;

  // To close the server after response
  //   process.exit();

  if (url === "/") {
    // Writing response body
    res.write("<html>");
    res.write("<head><title>Enter Message</title><head>");
    res.write(
      '<body><form action="/message" method="POST"><input type="text" name="message"><button type="submit">Send</button></form></body>'
    );
    res.write("</html>");

    // To tell that response is completed
    return res.end();
  }

  if (url === "/message" && method === "POST") {
    const body = [];

    // on: we can make use of on method to listen to certain events
    // data: event emitted when a new chunk of data is available to read
    req.on("data", (chunk) => {
      console.log("Chunk received:", chunk);
      body.push(chunk);
    });

    // end: event emitted when there is no more data to read
    return req.on("end", () => {
      // Here we can parse the complete body using Buffer
      const parsedBody = Buffer.concat(body).toString();
      console.log(parsedBody);

      // To get the message from the parsed body
      const message = parsedBody.split("=")[1];

      // Writing file synchronously
      // fs.writeFileSync("message.txt", message);

      // Using asynchronous approach to write file
      fs.writeFile("message.txt", message, (err) => {
        // individully setting status code and headers
        // res.statusCode = 302;
        // res.setHeader("Location", "/");

        // Alternative approach using writeHead to set statuscode and headers together
        res.writeHead(302, { Location: "/" });

        return res.end();
      });
    });
  }

  //   To set headers to the response
  res.setHeader("Content-Type", "text/html");

  res.write("<html>");
  res.write("<head><title>My First Page</title><head>");
  res.write("<body><h1>Hello from my Node.js Server!</h1></body>");
  res.write("</html>");
  res.end();
};

// Two way to export modules

// First way
module.exports = requestHandler;

// Second way
// module.exports = {
//   handler: requestHandler,
//   someText: "Some hard coded text",
// };

const mySql = require("mysql2");

// There is two way to create connection to database, one is with connection pool and another one is with single connection. We will use connection pool in this example.
// advantage of connection pool is that it will automatically manage the connections for us and we don't have to worry about closing the connections. It will also improve the performance of our application as it will reuse the connections instead of creating new ones every time.
const pool = mySql.createPool({
  host: "localhost", // replace with your database host
  user: "root", // replace with your database user
  database: "node_complete", // replace with your database name
  password: "MySQL@123456789", // replace with your database password
});

module.exports = pool.promise(); // we are exporting the promise version of the pool so that we can use async/await in our code

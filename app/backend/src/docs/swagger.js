const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Backend API",
      version: "1.0.0",
    },
    servers: [
      { url: "http://http://51.102.250.202/:3000" },
      { url: "http://localhost:3000" }
    ],
  },
  apis: ["./src/routes/*.js"]
};

module.exports = swaggerJsdoc(options);
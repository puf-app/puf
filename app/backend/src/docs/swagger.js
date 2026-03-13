const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Backend API",
      version: "1.0.0",
    },
    servers: [
      { url: "http://AWS.IP:3000" },
      { url: "http://localhost:3000" }
    ],
  },
  apis: ["./src/routes/*.js"]
};

module.exports = swaggerJsdoc(options);
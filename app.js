const express = require("express");
const mongoose = require("mongoose");
const logger = require("./utils/logger");
const config = require("./utils/config");
const middleware = require("./utils/middleware");
const blogRouter = require("./controller/blogs");

const app = express();

mongoose
  .connect(config.MONGODB_URL, { family: 4 })
  .then(() => {
    logger.info("connected to MongoDB");
  })
  .catch((error) => {
    logger.error("error connection to MongoDB:", error.message);
  });

app.use(express.json());
app.use(middleware.requestLogger);
app.use("/api/blogs", blogRouter);

app.use(middleware.unknownEndpoint);

module.exports = app;

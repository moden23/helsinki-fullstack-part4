const logger = require("./logger");
const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

const requestLogger = (req, res, next) => {
  logger.info("Method", req.method);
  logger.info("Path", req.path);
  logger.info("Body", req.body);
  next();
};

const errorHandler = (error, request, response, next) => {
  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  } else if (
    error.name === "MongoServerError" &&
    error.message.includes("E11000 duplicate key error")
  ) {
    return response
      .status(400)
      .json({ error: "expected `username` to be unique" });
  }

  next(error);
};

module.exports = { unknownEndpoint, requestLogger, errorHandler };

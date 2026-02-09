const morgan = require("morgan");

function logger(app) {
  if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
  }
}

module.exports = { logger };

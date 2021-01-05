require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const bookmarks = require("./bookmarks");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

// Write a route handler for the endpoint GET /bookmarks
// that returns a list of bookmarks

app.get("/bookmarks", (req, res) => {
  res.json(bookmarks);
});

// Write a route handler for the endpoint GET /bookmarks/:id
// that returns a single bookmark with the given ID, return
// 404 Not Found if the ID is not valid

app.get("/bookmarks/:id", (req, res) => {
  const { id } = req.params;
  const requestedBookmark = bookmarks.find((bookmark) => bookmark.id === id);
  if (requestedBookmark === undefined) {
    return res.status(400).send(`There were no matches containing "${id}" `);
  } else return res.json(requestedBookmark);
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;

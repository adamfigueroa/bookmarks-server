require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { PORT } = require('./config')
const { NODE_ENV } = require("./config");
const { v4: uuid } = require("uuid");
const bookmarks = require("./bookmarks");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(express.json());
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

// Write a route handler for POST /bookmarks that accepts
// a JSON object representing a bookmark and adds it to the
// list of bookmarks after validation.
app.post("/bookmarks", (req, res) => {
  const { title, url, description = false, rating } = req.body;

  // URL Validation REGEX
  function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }

  // Rating Validation
  function validRating(value) {      
    if (parseInt(value, 10) >= 1 && parseInt(value, 10) <= 5) {
        return true;
    } else {
        return false; //not in range
    }
}

  if (!title) {
    return res.status(400).json({ error: "Bookmark Title is required" });
  }

  if (title.length > 24 || title.length < 3) {
    return res.status(400).json({ error: "Bookmark Title needs to be between 3 to 24 characters" });
  }

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  if (url) {
    const resultUrl = validURL(url);
    if (resultUrl === false) {
      return res.status(400).json({ error: "URL is invalid, please format with (http:// or https://)" });
    }
  }

  if (!rating) {
    return res.status(400).json({ error: "Rating is required" });
  }

  if (rating) {
    const ratingResult = validRating(rating);
    if (ratingResult === false) {
      return res.status(400).json({ error: "Rating is invalid, please choose a number between 1 and 5" });
    }
  }

  const id = uuid();
  const newBookmark = {
    id,
    title,
    url,
    description,
    rating,
  };
  bookmarks.push(newBookmark);
  res
    .status(201)
    .location(`http://localhost:${PORT}/bookmarks/${id}`)
    .json({ id: id });
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

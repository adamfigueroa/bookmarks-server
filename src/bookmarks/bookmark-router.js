const express = require("express");
const { v4: uuid } = require("uuid");
const logger = require("../logger");
const { PORT } = require("../config");
const bookmarks = require("../bookmarks");

const bookmarkRouter = express.Router();
const bodyParser = express.json();

bookmarkRouter
  .route("/bookmarks")
  // Write a route handler for the endpoint GET /bookmarks
  // that returns a list of bookmarks
  .get((req, res) => {
    res.json(bookmarks);
  })
  // Write a route handler for POST /bookmarks that accepts
  // a JSON object representing a bookmark and adds it to the
  // list of bookmarks after validation.
  .post(bodyParser, (req, res) => {
    const { title, url, description = false, rating } = req.body;

    // URL Validation REGEX

    function validURL(str) {
      var pattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
          "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
          "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
          "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
          "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
          "(\\#[-a-z\\d_]*)?$",
        "i"
      ); // fragment locator
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
      return res
        .status(400)
        .json({
          error: "Bookmark Title needs to be between 3 to 24 characters",
        });
    }

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    if (url) {
      const resultUrl = validURL(url);
      if (resultUrl === false) {
        return res.status(400).json({
          error: "URL is invalid, please format with (http:// or https://)",
        });
      }
    }

    if (!rating) {
      return res.status(400).json({ error: "Rating is required" });
    }

    if (rating) {
      const ratingResult = validRating(rating);
      if (ratingResult === false) {
        return res.status(400).json({
          error: "Rating is invalid, please choose a number between 1 and 5",
        });
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
      logger.info(`Bookmark id: ${newBookmark.id} has been created`);
      res
        .status(201)
        .location(`http://localhost:${PORT}/bookmarks/${id}`)
        .json({ id: id });
    }
  });

bookmarkRouter
  .route("/bookmarks/:id")
  // Write a route handler for the endpoint GET /bookmarks/:id
  // that returns a single bookmark with the given ID, return
  // 404 Not Found if the ID is not valid
  .get((req, res) => {
    const { id } = req.params;
    const requestedBookmark = bookmarks.find((bookmark) => bookmark.id === id);
    if (!requestedBookmark) {
      return res.status(400).send(`There were no matches containing "${id}" `);
    } else return res.json(requestedBookmark);
  })
// Write a route handler for the endpoint DELETE 
// /bookmarks/:id that deletes the bookmark with the 
// given ID.
  .delete((req, res) => {
    const { id } = req.params;
    const indexOfBookmarks = bookmarks.findIndex(
      (bookmark) => bookmark.id == id
    );
    if (indexOfBookmarks === -1) {
      return res.status(404).send("Bookmark not found");
    }
    bookmarks.splice(indexOfBookmarks, 1);
    logger.info(`Bookmark id: ${id} has been deleted`);
    res.status(204).end();
  });

module.exports = bookmarkRouter;

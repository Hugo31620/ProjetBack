const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require("../middleware/multer-config")
const booksCtrl = require('../controllers/book');
const optimiseImage = require("../middleware/sharpConfig")

router.get('/bestrating', booksCtrl.bestrating);
router.get('/',booksCtrl.getAllBooks);
router.get("/:id", booksCtrl.getOneBook);

router.post('/',auth, multer, optimiseImage,  booksCtrl.createBook);
router.post("/:id/rating", auth, booksCtrl.createRating);

router.put('/:id', auth, multer, booksCtrl.updateBook);

router.delete('/:id', auth, booksCtrl.deleteBook);

module.exports = router;
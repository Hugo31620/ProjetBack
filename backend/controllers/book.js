const Book = require("../models/Book");
const fs = require("fs");

exports.getAllBooks = (req, res, next) => {
	Book.find()
		.then((books) => res.status(200).json(books))
		.catch((error) => res.status(404).json({ error }));
};

exports.getOneBook = (req, res, next) => {
	Book.findOne({ _id: req.params.id })
		.then((book) => res.status(200).json(book))
		.catch((error) => res.status(404).json({ error }));
};

exports.bestrating = (req, res, next) => {
	Book.find()
		.then((books) => {
			const booksFromHighRatingToLow = books.sort(function (a, b) {
				return b.averageRating - a.averageRating;
			});
			const bestRated = booksFromHighRatingToLow.slice(0, 3);
			res.status(200).json(bestRated);
		})
		.catch((error) => res.status(404).json({ error }));
};

exports.createBook = (req, res, next) => {
	const bookObject = JSON.parse(req.body.book);
	delete bookObject._id;
	delete bookObject._userId;
	const book = new Book({
		...bookObject,
		userId: req.auth.userId,
		imageUrl: `${req.protocol}://${req.get("host")}/images/${
			req.file.filename
		}`,
	});

	book
		.save()
		.then(() => res.status(201).json({ message: "Livre enregistré !" }))
		.catch((error) => res.status(404).json({ error }));
};

exports.createRating = (req, res, next) => {
	const userId = req.auth.userId;
	const grade = req.body.rating;
	const newRating = { userId, grade };
	Book.findOne({ _id: req.params.id })
		.then((book) => {
			if (
				book.ratings.find((rating) => req.auth.userId === rating.userId) !==
				undefined
			) {
				res.status(502).json({
					message: "Voux avez déjà noté ce livre.",
				});
			} else {
				book.ratings.push(newRating);
				const averageRating =
					book.ratings.reduce((acc, valeur) => acc + valeur.grade, 0) /
					book.ratings.length;
				book.averageRating = averageRating;
				book
					.save()
					.then(() => res.status(200).json(book))
					.catch((error) => res.status(500).json({ error }));
			}
		})
		.catch((error) => {
			res.status(499).json({ error });
		});
};

exports.updateBook = (req, res, next) => {
	const bookObject = req.file
		? {
				...JSON.parse(req.body.book),
				imageUrl: `${req.protocol}://${req.get("host")}/images/${
					req.file.filename
				}`,
		  }
		: { ...req.body };

	delete bookObject._userId;
	Book.findOne({ _id: req.params.id })
		.then((book) => {
			if (book.userId != req.auth.userId) {
				res.status(401).json({ message: "Not authorized" });
			} else {
				Book.updateOne(
					{ _id: req.params.id },
					{ ...bookObject, _id: req.params.id }
				)
					.then(() => res.status(200).json({ message: "Livre modifié!" }))
					.catch((error) => res.status(401).json({ error }));
			}
		})
		.catch((error) => {
			res.status(400).json({ error });
		});
};

exports.deleteBook = (req, res, next) => {
	Book.findOne({ _id: req.params.id })
		.then((book) => {
			if (book.userId != req.auth.userId) {
				res.status(401).json({ message: "Not authorized" });
			} else {
				const filename = book.imageUrl.split("/images/")[1];
				fs.unlink(`images/${filename}`, () => {
					Book.deleteOne({ _id: req.params.id })
						.then(() => res.status(200).json({ message: "Objet supprimé !" }))
						.catch((error) => res.status(401).json({ error }));
				});
			}
		})
		.catch((error) => res.status(500).json({ error }));
};
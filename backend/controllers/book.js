const Book = require("../models/Book");
const fs = require("fs");

exports.getAllBooks = (req, res, next) => { // récupère les livres via MongoDB
	Book.find()
		.then((books) => res.status(200).json(books))
		.catch((error) => res.status(404).json({ error }));
};

exports.getOneBook = (req, res, next) => { // récupère un livre via son ID 
	Book.findOne({ _id: req.params.id })
		.then((book) => res.status(200).json(book))
		.catch((error) => res.status(404).json({ error }));
};

exports.bestrating = (req, res, next) => {
	Book.find()
		.then((books) => {
			const booksFromHighRatingToLow = books.sort(function (a, b) { // trie par note moyenne de la plus élevée à la plus basse
				return b.averageRating - a.averageRating; 
			});
			const bestRated = booksFromHighRatingToLow.slice(0, 3); //sélectionne les trois premiers
			res.status(200).json(bestRated);
		})
		.catch((error) => res.status(404).json({ error }));
};

exports.createBook = (req, res, next) => {
	const bookObject = JSON.parse(req.body.book); // Json -> Javascript
	delete bookObject._id;  // supprime id et user pour éviter les modifications indésirées
	delete bookObject._userId;
	const book = new Book({ // crée url avec toutes les données du livre
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
	const userId = req.auth.userId; // récupère id utilisateur 
	const grade = req.body.rating;  // la note 
	const newRating = { userId, grade }; 
	Book.findOne({ _id: req.params.id })
		.then((book) => {
			if (
				book.ratings.find((rating) => req.auth.userId === rating.userId) !==
				undefined // Déja noté ou non 
			) {
				res.status(502).json({
					message: "Voux avez déjà noté ce livre.",
				});
			} else {
				book.ratings.push(newRating); //Ajoute la nouvelle note
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
	const bookObject = req.file // détermine les données du livre à mettre a jour 
		? {
				...JSON.parse(req.body.book),
				imageUrl: `${req.protocol}://${req.get("host")}/images/${
					req.file.filename
				}`, // crée l'url
		  }
		: { ...req.body };

	delete bookObject._userId;  // supprime l'ID
	Book.findOne({ _id: req.params.id })
		.then((book) => { // vérifie si l'utilisateur est autorisé 
			if (book.userId != req.auth.userId) {
				res.status(401).json({ message: "Not authorized" });
			} else {
				Book.updateOne( // Met à jour les données
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
	Book.findOne({ _id: req.params.id }) // Recherche le livre par son ID
		.then((book) => { // vérifie si l'utilisateur est autorisé à supprimer
			if (book.userId != req.auth.userId) {
				res.status(401).json({ message: "Not authorized" });
			} else {
				const filename = book.imageUrl.split("/images/")[1]; //récupère le nom du fichier avec l'url
				fs.unlink(`images/${filename}`, () => { // supprime l'image sur le server 
					Book.deleteOne({ _id: req.params.id }) // supprime le livre dans la base de donnée
						.then(() => res.status(200).json({ message: "Objet supprimé !" }))
						.catch((error) => res.status(401).json({ error }));
				});
			}
		})
		.catch((error) => res.status(500).json({ error }));
};
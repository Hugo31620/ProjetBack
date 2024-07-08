const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const bookRoutes = require("./routes/book");
const userRoutes = require("./routes/user");
const path = require("path"); // gère les chemins 

require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI, { //Connexion MongoDB
  })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use(cors({ // Sécurise l'appli web 
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true
}));

app.use(bodyParser.json());
app.use("/api/books", bookRoutes);
app.use("/api/auth", userRoutes);
app.use("/images", express.static(path.join(__dirname, "images"))); // Image statitque sinon erreur


module.exports = app;
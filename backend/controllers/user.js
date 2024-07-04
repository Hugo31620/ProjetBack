const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
    console.log('Signup route appelé');
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash,
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    const { email, password } = req.body;
    console.log('Login route appelé avec email:', email);
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                console.log('Utilisateur non trouvé');
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }

            bcrypt.compare(password, user.password)
                .then(valid => {
                    if (!valid) {
                        console.log('Mot de passe incorrect');
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }

                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => {
                    console.log('Erreur lors de la comparaison des mots de passe:', error);
                    res.status(500).json({ error });
                });
        })
        .catch(error => {
            console.log('Erreur lors de la recherche de l\'utilisateur:', error);
            res.status(500).json({ error });
        });
};
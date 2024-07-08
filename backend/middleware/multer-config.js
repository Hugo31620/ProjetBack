const multer = require('multer');

const MIME_TYPES = { // associe les types MIME des images aux extensions de fichier
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => { // Indique le dossier où les fichiers téléchargés seront enregistrés
    callback(null, 'images');
  },
  filename: (req, file, callback) => { // Définit comment le nom de fichier sera généré
    const name = file.originalname.split(' ').join('_'); // espace remplacé par _ 
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({storage: storage}).single('image');
const sharp = require('sharp');
const path = require('path');
const fs = require("fs");

sharp.cache(false);

const optimiseImage = (req, res, next) => {
    try {
        if (!req.file) {
            return next();
        } else {
            const originalName = path.parse(req.file.originalname).name;
            const safeName = Buffer.from(originalName, 'latin1').toString('utf8').split(' ').join('_');
            const newFilename = `${safeName}.webp`;
            
            sharp(req.file.path)
                .resize({
                    width: 360,
                    height: 570
                })
                .webp({ quality: 80 })
                .toFile(path.join('images', newFilename))
                .then(() => {
                    fs.unlink(req.file.path, (e) => {
                        if (e) console.log(e);
                        
                        req.file.filename = newFilename;
                        req.file.path = path.join('images', newFilename);
                        req.file.mimetype = 'image/webp';
                        
                        next();
                    });
                })
                .catch(error => {
                    console.log(error);
                    next(error);
                });
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
};

module.exports = optimiseImage;
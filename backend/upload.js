const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        let ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

const fileFilter = function (req, file, cb) {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
        cb(null, true);
    } else {
        console.log("Only jpg and png files are allowed.");
        cb(null, false);
    }
};

const limits = {
    fileSize: 1024 * 1024 * 2, // 2MB file size limit
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: limits,
});

module.exports = upload;
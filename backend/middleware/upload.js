const multer = require("multer"); // Import multer for handling file uploads
const path = require("path"); // Import path module for handling file paths

//configure storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => { //defines the destination folder for uploaded files
        cb(null, 'uploads/');// Tells multer ro sace files in the 'uploads/' directory
    },
    filename: (req, file, cb) => { //defines the naming convention for uploaded files
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Create a umiquw name to avoid conflicts

        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Set the file name to original name + unique suffix + original file extension
    }
});

//create multer instance    MIGHT ADD IN POWERPOINT AS FILE TYPE
const upload = multer({
    storage: storage, 
    // limit it to 5mb file size (for now)
    limits: {fileSize: 1024 * 1024 * 5},
    fileFilter: (req, file, cb) => {
        // here we check if it is an acceptable file type
        if(file.mimetype === 'application/pdf' || file.mimetype === 'text/plain'){
            cb(null,true); // accept the users file
        
        } else {
            cb(new Error('Only PDF and TXT files are allowed!'), false); // reject any other file types 
        }
    }
});

module.exports = upload.single('noteFile');
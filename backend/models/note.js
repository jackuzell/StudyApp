const mongoose = require('mongoose');
const { Schema } = mongoose;

const noteSchema = new Schema({ // skipped user reference for now come back to it later
    title : {
        type: String,
        required: true,
        trim: true
    },

    filePath: { //path to where multer saves the file
        type: String,
        required: true
    },

    originalFileName: { //original name of the file uploaded
        type: String,
        required: true
    },

    uploadDate: { //date the note was uploaded
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Note', noteSchema);
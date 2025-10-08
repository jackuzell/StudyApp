const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true, // make sure no one else has this email
        trim: true,
        lowercase: true
    },
    password:{
        type: String,
        required: true,
        minlength: 8 // at least 8 characters
    },
    username:{
        type: String,
        required: true,
        trim: true
    },
    registerDate:{
        type: Date,
        default: Date.now // when the user was created
    }
});

module.exports = mongoose.model('User', userSchema);
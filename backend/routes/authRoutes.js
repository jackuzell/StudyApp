const express = require('express');
const router = express.Router();
const bcrypt = required('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Register a new user
router.post('/signup', async (req , res) => {
    try{
        const {email, password, username} = req.body;
        // Check if user already exists 
        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({message: 'User already exists'});
        }
        //Create new user
        user = new User({username, email, password});

        //hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        //Create JWT
        const payload = {user: {id: user.id}};
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn: '1h'},
            (err, token) => {
                if(err)throw err;
                res.json({toke, user: {id: user.id, username: user.username}});
            }
        );
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login user ROUTE
router.post('/login', async(req , res) => {
    try{
        const {email, password} = req.body;
        //Check if user exists
        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: 'Invalid Credentials'});
        }
        //Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({message: 'Invalid Credentials'});
        }
        //Create JWT
        const payload = {user: {id: user.id}};
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn: '1h'},
            (err, token) => {
                if(err)throw err;
                res.json({token, user: {id: user.id, username: user.username}});
            }
        );
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
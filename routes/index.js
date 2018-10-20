const express = require('express');
const { check, validationResult } = require('express-validator/check');
const router = express.Router();
let User = require('../models/user');

// Home page
router.get('/', (req, res, next)=>{
    res.render('index');
});

// Login form
router.get('/login', (req, res, next)=>{
    res.render('login');
});

// Register form
router.get('/register', (req, res, next)=>{
    res.render('register');
});

// Process register
router.post('/register',[
    check('name', 'Name field is required.').not().isEmpty(),
    check('username', 'Username is required.').not().isEmpty(),
    check('email', 'Must be valid email.').not().isEmpty().isEmail(),
    check("password", "invalid password")
        .custom((value,{req, loc, path}) => {
            if (value !== req.body.password2) {
                throw new Error("Passwords don't match");
            } else {
                return value;
            }
        })
], (req, res, next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('register', {
           errors: errors.array()
        });
        // return res.status(422).json({ errors: errors.array() });
    }else {
        const name = req.body.name;
        const username = req.body.username;
        const email = req.body.email;
        const password = req.body.password;

        const newUser = new User({
            name: name,
            username: username,
            email: email,
            password: password
        });

        User.registerUser(newUser, (err, user)=>{
            if (err) {
                console.log(err);
            }
            res.redirect('/login');
        });
    }
});

module.exports = router;
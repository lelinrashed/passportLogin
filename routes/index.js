const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { check, validationResult } = require('express-validator/check');
const router = express.Router();
let User = require('../models/user');

// Home page - Dashboard
router.get('/', ensureAuthenticated, (req, res, next)=>{
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

// Logout
router.get('/logout', (req, res, next)=>{
    req.logout();
    req.flash('success_msg', 'You are logged out.');
    res.redirect('/login');
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
            req.flash('success_msg', 'You are registered and can login.');
            res.redirect('/login');
        });
    }
});

// Local strategy
passport.use(new LocalStrategy((username, password, done)=>{
    User.getUserByUsername(username, (err, user)=>{
        if (err) throw err;
        if (!user) {
            return done(null, false, {message: 'No user found'});
        }
        User.comparePassword(password, user.password, (err, isMatch)=>{
            if (err) throw err;
            if (isMatch) {
                return done(null, user);
            }else{
                return done(null, false, {message: 'Wrong password.'});
            }
        });
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.getUserById(id, (err, user) => {
        done(err, user);
    });
});

// Login process
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
       successRedirect:'/',
       failureRedirect:'/login',
       failureFlash: true,
    })(req, res, next);
});

// Access control
function ensureAuthenticated(req, res, next){
    if (req.isAuthenticated()){
        return next();
    } else {
        req.flash('error_msg', 'You are not authorized to view that page.');
        res.redirect('/login');
    }
}

module.exports = router;
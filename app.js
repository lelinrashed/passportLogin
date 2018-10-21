const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator/check');
const port = 3000;

// App route file
const index = require('./routes/index');
const users = require('./routes/users');

// App initialization
const app = express();

// App view engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// App body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// App session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// init passport
app.use(passport.initialize());
app.use(passport.session());

// App messages
app.use(flash());
app.use((req, res, next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Use route file
app.use('/', index);
app.use('/users', users);

// Server started
app.listen(port, ()=>{
    console.log('Server started on port '+port);
});
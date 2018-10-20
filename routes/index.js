const express = require('express');
const router = express.Router();

// Home page
router.get('/', (req, res, next)=>{
    res.render('index');
});

// Register form
router.get('/register', (req, res, next)=>{
    res.render('register');
});

module.exports = router;
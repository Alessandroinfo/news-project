var express = require('express');
var router = express.Router();

var apiArticles = require('./routes/api.articles');
var apiAdmin = require('./routes/api.admin');
var redirects = require('./routes/redirects');

//ROUTES
router.use('/', redirects);
router.use('/api/article', apiArticles);
router.use('/api/admin', apiAdmin);

module.exports = router;

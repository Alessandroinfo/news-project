var express = require('express');
var router = express.Router();

var api = require('./routes/api');
var redirects = require('./routes/redirects');

//ROUTES
router.use('/', redirects);
router.use('/api', api);

module.exports = router;

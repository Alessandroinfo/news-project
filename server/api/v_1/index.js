var express = require('express');
var router = express.Router();

var api = require('./routes/api');

//ROUTES
router.use('/api', api);

module.exports = router;

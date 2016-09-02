var express = require('express');
var router = express.Router();
var logger = require('../../../config/Logger');

router.get('/', function (req, res, next) {
    var route = req.baseUrl + req.path;
    res.send({success: true, route: route});
});

module.exports = router;

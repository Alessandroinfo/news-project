/**
 * Created by Ale on 02/09/2016.
 */
var express = require('express');
var router = express.Router();


var config = require('../../../config').config();

router.use('/home', function (req, res) {
    res.redirect(config.REDIRECT_ROUTES.home);
});

router.use('/admin', function (req, res) {
    res.redirect(config.REDIRECT_ROUTES.admin);
});

module.exports = router;

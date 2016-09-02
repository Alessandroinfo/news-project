/**
 * Created by vincenzo on 12/07/16.
 */
var express = require('express');
var router = express.Router();


var config = require('../../../config').config();

router.use('/speaker', function (req, res) {
    res.redirect(config.REDIRECT_ROUTES.speaker);
});
router.use('/user', function (req, res) {
    res.redirect(config.REDIRECT_ROUTES.user);
});
router.use('/admin', function (req, res) {
    res.redirect(config.REDIRECT_ROUTES.admin);
});
router.use('/loginspeaker', function (req, res) {
    res.redirect(config.REDIRECT_ROUTES.loginSpeaker);
});
router.use('/loginuser', function (req, res) {
    res.redirect(config.REDIRECT_ROUTES.loginUser);
});
router.use('/loginadmin', function (req, res) {
    res.redirect(config.REDIRECT_ROUTES.loginAdmin);
});
router.use('/training', function (req, res) {
    res.redirect(config.REDIRECT_ROUTES.trainingSpeaker);
});


module.exports = router;

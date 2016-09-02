var express = require('express');
var router = express.Router();


var api = require('./routes/api');
var io_files = require('./routes/import_export_files');
var users = require('./routes/users');

var speaker = require('./routes/speaker');
var doctor = require('./routes/doctor');
var event = require('./routes/event');
var convention = require('./routes/convention');
var socket_api = require('./routes/socket_api');


var redirects = require('./routes/redirects');
var authentication = require('./routes/authentication');
var registration = require('./routes/registration');


//ROUTES
router.use('/', redirects);
router.use('/', registration);
router.use('/', authentication);
router.use('/api', api);
router.use('/api/io', io_files);

router.use('/api/speaker', speaker);
router.use('/api/doctor', doctor);
router.use('/api/event', event);
router.use('/api/convention', convention);
router.use('/api/socket', socket_api);


router.use('/users', users);

/*
 var test = require('./routes/test');
 router.use('/test', test);
 */

module.exports = router;

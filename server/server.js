/**
 * Created by Ale on 02/09/2016.
 */
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var http = require('http');
var fs = require('fs');
var gutil = require('gulp-util');

var AdminModel = require('./db/adminModel');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

var config = require('./config').config();
var msg = require('./config').messages();
var logger = require('./config/Logger');

//************************************************************************************************


app.get("/ciao", function (req, res, next) {

}, function (req, res) {

    req.body;
});

app.post("/ciao", function (req, res) {

});

// CONNECTION TO DB
mongoose.connect('mongodb://' + config.MONGO_URI + ':' + config.MONGO_PORT + '/' + config.MONGO_DB);

var connection = mongoose.connection;

connection.on('error', function () {
    logger.error(msg.DB.CONNECTION_FAIL);
    logger.error.bind(logger, 'connection error:');
    //res.json({error: msg.DB.CONNECTION_FAIL});
});
connection.once('open', function () {
    logger.info(msg.DB.CONNECTION_OK);

    //ROUTER
    var router = require('./api/v_1');
    app.use(router);

    //STATICS
    app.use(express.static(path.join(__dirname, '../client')));

    // LISTEN
    app.listen(3030, function () {
        logger.info("Applicaton listen on port %s", this.address().port);
    });

});


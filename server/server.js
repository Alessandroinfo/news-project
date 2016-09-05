/**
 * Created by Ale on 02/09/2016.
 */
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

app.use(bodyParser.json());  //Parsa tutte le richieste
app.use(bodyParser.urlencoded({extended: false}));  //Setto body parser

var config = require('./config').config();  //Richiedo la funzione config del file config/index.js
var msg = require('./config').messages();   //Richiedo la funzione messages del file config/index.js
var logger = require('./config/Logger');    //Richiedo il modulo config/logger.js

//************************************************************************************************

/*app.use("/ciao", function (req, res) {
 res.send("ciao");
 });*/

// CONNECTION TO DB
mongoose.connect('mongodb://' + config.MONGO_URI + ':' + config.MONGO_PORT + '/' + config.MONGO_DB);   //Stabilisce i parametri di connessione a Mongo

var connection = mongoose.connection;

connection.on('error', function (arg) {   //All'evento on('error') di connection
    logger.error(msg.DB.CONNECTION_FAIL);
    logger.error.bind(logger, 'connection error:');
});

connection.once('open', function () {   //All'evento once('open') di connection
    logger.info(msg.DB.CONNECTION_OK);

    //ROUTER
    var router = require('./api/v_1');  //Richiedo tutte le rotte
    app.use(router);  //Imposto tutte le rotte

    //STATICS
    app.use(express.static(path.join(__dirname, '../client'))); //Richiede per root tutte le risorse statiche, punto di montaggio per le risorse statiche

    // LISTEN
    app.listen(3030, function () {  //Bootstrap del server
        logger.info("Applicaton listen on port %s", this.address().port);
    });

});


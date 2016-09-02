var express = require('express');
var router = express.Router();

var csv = require('csv');
var fs = require('fs');
var multer = require('multer');
var gutil = require('gulp-util');
var nimble = require('nimble');

var config = require('../../../config').config();
var logger = require('../../../config/Logger');
var eventModel = require('../../../db/eventModel');
var conventionModel = require('../../../db/conventionModel');
var speakerModel = require('../../../db/speakerModel');
var socketio = require('../../../socketio');


// AUTORIZZAZIONE
var jwt_Auth = require('../../../services/jwt_tokenAuth');
router.use(jwt_Auth.isAuthenticated);


//ROUTES
router.get('/list/', function (req, res) {

    var start = new Date();
    start.setHours(0, 0, 0, 0);

    eventModel
        .find({data: {$gte: start}})
        .where({happened: {$ne: true}})
        .sort({data: -1})
        .exec(function (err, data) {
            if (err) res.json({success: false, err: err});
            logger.debug('GET EVENTS LIST');
            res.json({success: true, count: data.length, payloads: data});
        });
});

router.get('/list/associated/', function (req, res) {

    //OTTENGO I DATI DAL CLIENT
    var skip = parseInt(req.query.skip);
    var limit = parseInt(req.query.limit);

    eventModel
        .find({$where: 'this.speaker_list.length > 0'})
        .count()
        .exec(function (err, totAssociatedEvents) {
            if (err) res.json({success: false, err: err});
            eventModel
                .find({$where: 'this.speaker_list.length > 0'})
                .sort({data: -1})
                .skip(skip)
                .limit(limit)
                .exec(function (err, data) {
                    if (err) return res.json({success: false, err: err});
                    logger.debug('GET ASSOCIATED EVENTS LIST');
                    res.json({success: true, count: totAssociatedEvents, countReturned: data.length, payloads: data});
                });
        });
});


//CREA ASSOCIAZIONE
router.post('/associateEvent', function (req, res) {
    //OTTENGO I DATI DAL CLIENT
    var data = req.body;

    //CERCA EVENTO
    eventModel.findOne({venue_id: data.venue_id})
        .exec(function (err, result) {
            if (err) return res.json({success: false, err: err.toString()});

            // CONTROLLA SE LO SPEAKER E' GIA' ASSOCIATO ALL'EVENTO
            var insert = true;
            result.speaker_list.forEach(function (item, index) {
                if (item.cod_relatore == data.speaker) {
                    insert = false;
                    return res.json({
                        success: false,
                        payloads: 'Speaker already associated to the event',
                        alreadyAssociated: true
                    });
                }
            });

            // ESEGUE ASSOCIAZIONE
            if (insert) {
                speakerModel.findOne({cod_relatore: data.speaker})
                    .exec(function (err, speaker) {
                        if (err) return res.json({success: false, err: err.toString()});

                        // CONTROLLA SE LA LISTA DELLE SLIDE E' GIA' ASSOCIATA ALL'EVENTO
                        if (!result.slide_list) {
                            result.slide_list = data.slide_list;
                        } else {
                            logger.info('slide_list già assegnata');
                        }

                        // AGGIUNGE LO SPEAKER
                        result.speaker_list.push(speaker);

                        result.save(function (err) {
                            if (err) return res.json({success: false, err: err.toString()});
                            //CREAZIONE NAMESPACE PER SOCKET SE NON ESISTE
                            logger.info('speaker associated successfully');
                            socketio.newNameSpace(result.venue_id);
                            res.json({success: true, payloads: speaker});
                        })
                    });
            }
        })

});


//SALVA DATI SU DB
router.post('/deleteAssociation', function (req, res) {

    //OTTENGO I DATI DAL CLIENT
    var data = req.body;

    eventModel.findOne({venue_id: data.evento.venue_id})
        .exec(function (err, result) {
            if (err) return res.json({success: false, err: err.toString()});

            var delete_index = -1;
            result.speaker_list.forEach(function (item, index) {
                if (item.cod_relatore == data.speaker.cod_relatore) {
                    delete_index = index;
                }
            });

            if (delete_index > -1) {
                result.speaker_list.splice(delete_index, 1);
            } else {
                return res.json({success: false, payloads: "items not found"});
            }

            //CANCELLAZIONE NAMESPACE PER EVENTO SENZA SPEAKERS E ELIMINAZIONE SLIDELIST
            if (result.speaker_list.length == 0) {
                socketio.deleteNameSpace(result.venue_id);
                result.slide_list = null;
            }

            result.save(function (err) {
                if (err) return res.json({success: false, err: err.toString()});
                logger.info('speaker disfellowshipped successfully');
                res.json({success: true, payloads: "Event disfellowshipped"});
            })

        })

});


module.exports = router;

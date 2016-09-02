var express = require('express');

var router = express.Router();

var nimble = require('nimble');
var config = require('../../../config').config();
var logger = require('../../../config/Logger');
var Speaker = require('../../../db/speakerModel');
var eventModel = require('../../../db/eventModel');


var jwt_Auth = require('../../../services/jwt_tokenAuth');
router.use(jwt_Auth.isAuthenticated);


//ROUTES
router.get('/list/', function (req, res) {
    Speaker
        .find()
        .sort({relatore: 1})
        //.sort({ name: 1 })
        //.limit(10)
        //     .select({
        //         _id: 1,
        //         code: 1,
        //         name: 1,
        //         surname: 1,
        //         email: 1,
        //         level: 1,
        //         membership_of: 1
        //     })
        .exec(function (err, data) {
            if (err) return res.json({success: false, err: err});
            logger.debug('GET LISTA SPEAKER');
            res.json({success: true, count: data.length, payloads: data});
        });
});

router.get('/associatedEventsToSpeaker/', function (req, res) {

    var data = req.query;

    var start = new Date();
    start.setHours(0, 0, 0, 0);

    var end = new Date();
    end.setHours(23, 59, 59, 999);

    eventModel
    // .find()
        .find({'speaker_list.cod_relatore': data.cod_relatore})
        .where({data: {$gte: start, $lte: end}})
        .where({happened: {$ne: true}})
        .exec(function (err, data) {
            if (err) return res.json({success: false, err: err});
            logger.debug('GET LISTA SPEAKER');
            res.json({success: true, count: data.length, payloads: data});
        });
});


// //SALVA DATI SPEAKER SU DB
// router.post('/list/save', function (req, res) {
//     //OTTENGO I DATI DAL CLIENT
//     var dataToSave = req.body;
//     // SALVATAGGIO DATI SU DB
//     nimble.each(
//         dataToSave,
//         function (item, index, callback) {
//             logger.verbose(item);
//             var d = new Speaker(item);
//             d.save(function (err) {
//                 // todo: roolback in caso di errore????
//                 if (err) callback(err);
//
//                 logger.debug('item saved', index + 1, item);
//                 callback();
//             });
//         },
//         function (err) {
//             if (err) return res.json({success: false, err: err});
//             logger.debug('FINE SCRITTURA DATI');
//             res.json({success: true, payloads: dataToSave});
//
//         }
//     );
// });


router.get('/list/:id', function (req, res) {
    var id = req.params.id;
    Speaker.findByCode(id, function (err, data) {
        if (err) return res.json({success: false, err: err});
        logger.info('data', data._doc);
        res.json({success: true, payloads: data});

    });
});

router.post('/sendMail', function (req, res) {

    var data = req.body;

    res.json({success: true, payloads: data});

});


module.exports = router;

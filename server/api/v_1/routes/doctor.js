var express = require('express');
var router = express.Router();

var nimble = require('nimble');
var config = require('../../../config').config();
var logger = require('../../../config/Logger');
var Doctor = require('../../../db/doctorModel');
var eventModel = require('../../../db/eventModel');

// var jwt_Auth = require('../../../services/jwt_tokenAuth');
// router.use( jwt_Auth.isAuthenticated );

//ROUTES
// router.get('/list/', function (req, res) {
//     Doctor.find()
//     //.sort({ name: 1 })
//     //.limit(10)
//         .select({
//             _id: 0,
//             code: 1,
//             name: 1,
//             surname: 1,
//             email: 1,
//             livel: 1,
//             membership_of: 1
//         })
//         .exec(function (err, data) {
//             if (err) res.json({success: false, err: err});
//             logger.debug('GET LISTA DOCTORS', req.params.type);
//             res.json({success: true, count: data.length, payloads: data});
//         });
// });


router.get('/list_doctor_events', function (req, res) {

    var start = new Date();
    start.setHours(0, 0, 0, 0);

    var end = new Date();
    end.setHours(23, 59, 59, 999);

    eventModel
    // .find({data: {$gte : new Date(), $lt : new Date(2016,7,3) }})
        .find({$where: 'this.speaker_list.length > 0'})
        .where({data: {$gte: start, $lte: end}})
        .where({happened: {$ne: true}})
        .exec(function (err, data) {
            if (err) res.json({success: false, err: err});
            logger.debug('GET LISTA DOCTORS from list_doctors');
            res.json({success: true, count: data.length, payloads: data});
        });
});


//SALVA DATI SPEAKER SU DB
// router.post('/list/save', function (req, res) {
//     //OTTENGO I DATI DAL CLIENT
//     var dataToSave = req.body;
//     // SALVATAGGIO DATI SU DB
//     nimble.each(
//         dataToSave,
//         function (item, index, callback) {
//             logger.info(item);
//             var d = new Doctor(item);
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


module.exports = router;

var express = require('express');
var router = express.Router();

var csv = require('csv');
var fs = require('fs');
var multer = require('multer');
var gutil = require('gulp-util');
var nimble = require('nimble');

var config = require('../../../config').config();
var logger = require('../../../config/Logger');
var Convention = require('../../../db/conventionModel');

// var jwt_Auth = require('../../../services/jwt_tokenAuth');


// router.use( jwt_Auth.isAuthenticated );


//ROUTES
router.get('/list/', function (req, res) {
    Convention.find()
        //.sort({ name: 1 })
        //.limit(10)
        .select({
            id: 1,
            code: 1,
            name: 1,
            date: 1,
            isf_organizer: 1
        })
        .exec(function (err, data) {
            if (err) res.json({success: false, err: err});
            logger.debug('GET LISTA EVENTS', req.params.type);
            res.json({success: true, count: data.length, payloads: data});
        });
});


//SALVA DATI SPEAKER SU DB
router.post('/list/save', function (req, res) {
    //OTTENGO I DATI DAL CLIENT
    var dataToSave = req.body;

    // dataToSave = [
    //     {code: 1 , name: 'evento mellin', date: new Date()  },
    //     {code: 2 , name: 'evento pinco', date: new Date()  },
    //     {code: 3 , name: 'evento pallino', date: new Date()  },
    //     {code: 4 , name: 'evento pippo', date: new Date()  },
    //     {code: 5 , name: 'evento pluto', date: new Date()  }
    // ];

    // SALVATAGGIO DATI SU DB
    nimble.each(
        dataToSave,
        function (item, index, callback) {
            logger.info(item);
            var d = new Convention(item);
            d.save(function (err) {
                // todo: roolback in caso di errore????
                if (err) callback(err);

                logger.debug('item saved', index + 1, item);
                callback();
            });
        },
        function (err) {
            if (err) return res.json({success: false, err: err});
            logger.debug('FINE SCRITTURA DATI');
            res.json({success: true, payloads: dataToSave});

        }
    );
});


module.exports = router;

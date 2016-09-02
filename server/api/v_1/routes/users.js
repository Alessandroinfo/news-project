var express = require('express');
var router = express.Router();
var doctorModel = require('../../../db/doctorModel');
var logger = require('../../../config/Logger');

// var jwt_Auth = require('../../../services/jwt_tokenAuth');

/* GET users listing. */

// router.use( jwt_Auth.isAuthenticated );


router.get('/', function (req, res) {
    User.find()
        //.sort({ name: 1 })
        //.limit(10)
        .select({
            _id: 0,
            name: 1,
            surname: 1,
            address: 1,
            email: 1,
            permission: 1,
            username: 1
        })
        .exec(function (err, data) {
            if (err) res.json({success: false, err: err});
            logger.verbose('RICHIESTA USERS');
            res.json({success: true, count: data.length, results: data});
        });
});


router.get('/:id', function (req, res) {

    var id = req.params.id;
    console.log(id);

    var name = '';
    var surname = '';

    try {
        name = id.split('_')[0].toUpperCase();
        surname = id.split('_')[1].toUpperCase();
    } catch (err) {
        // logger.error (err);
        logger.error(err);
        res.json({err: err.toString()});
        return;
    }

    logger.info(id, name, surname);

    var option = {name: name, surname: surname};


    User.find(option)
        //.sort({ name: 1 })
        //.limit(10)
        .select({_id: 0, name: 1, surname: 1, email: 1})
        .exec(function (err, data) {
            if (err) res.json({success: false, err: err});

            res.json(data);
            // res.sendFile(path.join(__dirname, '../client/index.html'));
        });
});


router.get('/autocomplite/email/:search', function (req, res) {

    var type = req.params.type;
    var search = req.params.search;

    logger.info('params', type, search);

    var option = {email: new RegExp(req.params.search, 'i')}; //{ $or : [ {name : regex.name }, {surnames : /nc/i }]  }

    doctorModel.find(option)
        // .select({_id: 0, name: 1, surname: 1, email: 1, description_user:1})
        .exec(function (err, doctors) {
            res.json(
                {
                    success: true,
                    count: doctors.length,
                    results: doctors
                }
            );
        });
});


module.exports = router;

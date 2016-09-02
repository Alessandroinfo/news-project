var express = require('express');
var router = express.Router();
var nimble = require('nimble');
var logger = require('../../../config/Logger');

var jwt_Auth = require('../../../services/jwt_tokenAuth');
var service_token = require('../../../services/jwt_service');
var slideLists = require('../../../config').slidesList();


router.get('/', function (req, res, next) {
    var route = req.baseUrl + req.path;
    res.send({success: true, route: route});
});

// router.get('/test', function(req, res, next) {
//     var route = req.baseUrl + req.path;
//     res.send({success:true, route: route });
// });


var doctorModel = require('../../../db/doctorModel');
var speakerModel = require('../../../db/speakerModel');
var adminModel = require('../../../db/adminModel');


router.get('/convention', function (req, res, next) {
    // var data = require('../../../conventionInfo/conventionMock.json');
    var data = require('../../../conventionInfo/APTAMIL ALLERGIA.json');
    var route = req.baseUrl + req.path;
    res.send({success: true, route: route, payloads: data});
});

router.get('/slideImage', function (req, res, next) {
    var route = req.baseUrl + req.path;
    res.send({success: true, route: route, payloads: data});
});

router.get('/autocomplete/:name/:surname/:email', function (req, res) {

    var name = req.params.name;
    var surname = req.params.surname;
    var email = req.params.email;

    logger.info('params', name, surname, email);

    // var regex = {name: new RegExp(req.params.email, 'i')};
    var option = {
        $and: [
            {nome: new RegExp('^' + name + '$', 'i')},
            {cognome: new RegExp('^' + surname + '$', 'i')},
            {email: new RegExp(email, 'i')}
        ]
    };

    doctorModel.find(option)
        // .select({_id: 0, name: 1, surname: 1, email: 1, description_user: 1})
        .exec(function (err, doctor) {
            if (err) return res.json({success: false, err: err.toString()});
            res.json(
                {
                    success: true,
                    results: doctor
                }
            );
        });
});

router.post('/verifyAuth', jwt_Auth.isAuthenticatedStart, function (req, res) {

    if (req.authorization) {
        var data = req.body;
        speakerModel.findOne({username: data.username, password: data.password})
            // speakerModel.findOne({cod_relatore: data.cod_relatore})
            .exec(function (err, speaker) {
                if (err) return res.json({success: false, authenticated: false, err: err.toString()});
                if (!speaker) return res.json({success: false, authenticated: false});
                logger.info('authenticated ok');
                res.json({success: true, payloads: speaker, authenticated: true});
            });
    } else {
        res.json({success: false, authenticated: false});
    }
});

router.post('/verifyAuthAdmin', jwt_Auth.isAuthenticatedStart, function (req, res) {

    if (req.authorization) {
        var data = req.body;
        adminModel.findOne({username: data.username, password: data.password})
            .exec(function (err, admin) {
                if (err) return res.json({success: false, authenticated: false, err: err.toString()});
                if (!admin) return res.json({success: false, authenticated: false});
                logger.info('authenticated ok');
                res.json({success: true, payloads: admin, authenticated: true});
            });
    } else {
        res.json({success: false, authenticated: false});
    }
});

router.post('/login_speaker', function (req, res) {
    var data = req.body;
    logger.debug('params for login speaker', data);
    // var regex = {username: new RegExp(req.params.email, 'i')};

    var option = {
        $and: [
            {username: new RegExp('^' + data.email + '$', 'i')},
            {password: new RegExp('^' + data.password + '$', 'i')}
            // {email: new RegExp(email, 'i')}
        ]
    };

    speakerModel.findOne(option)
        // speakerModel.findOne({username: data.email, password: data.password})
        // .select({_id: 0, name: 1, surname: 1, email: 1, description_user: 1})
        .exec(function (err, speaker) {
            if (err) return res.json({success: false, err: err.toString()});
            if (!speaker) {
                return res.json({success: false, message: "No speaker found", err: "No speaker found"});
            }

            res.json(
                {
                    success: true,
                    payloads: speaker,
                    token: service_token.issueToken(speaker._id + "")
                }
            );
        });
});

router.post('/login_admin', function (req, res) {

    var data = req.body;
    logger.debug('params for login admin', data);

    var option = {
        $and: [
            {username: new RegExp('^' + data.username + '$', 'i')},
            {password: new RegExp('^' + data.password + '$', 'i')}
            // {email: new RegExp(email, 'i')}
        ]
    };

    // adminModel.findOne({username: data.username, password: data.password})
    adminModel.findOne(option)
        .exec(function (err, admin) {
            if (err) return res.json({success: false, err: err.toString()});


            if (!admin) {
                return res.json({success: false, message: "No admin found", err: "No admin found"});
            }

            res.json(
                {
                    success: true,
                    payloads: admin,
                    token: service_token.issueToken(admin._id + "")
                }
            );
        });
});

router.post('/login_doctor', function (req, res) {

    var data = req.body;
    logger.debug('params for login doctor', data);

    //prima verificare solo la mail
    doctorModel.findOne({email: new RegExp('^' + data.email + '$', 'i')})
        .exec(function (err, doctor) {
            if (err) return res.json({success: false, foundUser: false, err: err.toString()});

            if (doctor) {
                return res.json({success: true, foundUser: true, payloads: doctor});
            } else {
                var option = {
                    $and: [
                        {nome: new RegExp('^' + data.name + '$', 'i')},
                        {cognome: new RegExp('^' + data.surname + '$', 'i')}
                    ]
                };
                // POI SE LA MAIL NON C'È VERIFICARE IL NOME E IL COGNOME NOME E COGNOME E VERIFICARE SE ESISTE UN ANONIMO CON UNA MAIL DIVERSA
                doctorModel.findOne(option)
                    .exec(function (err, doctor) {
                        if (err) return res.json({success: false, foundUser: false, err: err.toString()});
                        if (doctor) {
                            return res.json({success: true, foundUser: true, payloads: doctor, different_mail: true});
                        } else {
                            // rigistration needed
                            return res.json({success: false, foundUser: false, payloads: 'registration'});
                        }

                    })
            }
        });
});

router.post('/registration_new_doctor', function (req, res) {

    var data = req.body;
    logger.debug('params for doctor registration', data);

    var newDoctor = new doctorModel(data);
    newDoctor.save(function (err, item) {
        if (err) return res.json({success: false, message: 'Error on creation new doctor', err: err.toString()});

        res.json({success: true, message: 'Doctor created successfully', payloads: item});
    });
});

router.get('/slideList/list', function (req, res) {
    res.json({success: false, payloads: slideLists});
});


// NON PIU' USATA
router.post('/registration_new_doctor', function (req, res) {

    var data = req.body;
    logger.debug('params', data);


    var option = {
        $and: [
            {nome: new RegExp('^' + data.nome + '$', 'i')},
            {cognome: new RegExp('^' + data.cognome + '$', 'i')}
        ]
    };

    doctorModel.findOne(option)
        .exec(function (err, doctor) {
            if (err) return res.json({success: false, foundUser: false, err: err.toString()});

            if (doctor) {
                return res.json({success: false, foundUser: true, payloads: doctor, nome_cognome: true});
            }

            doctorModel.findOne({email: new RegExp('^' + data.email + '$', 'i')})
                .exec(function (err, doctor_em) {
                    if (err) return res.json({success: false, foundUser: false, err: err.toString()});

                    if (doctor_em) {
                        return res.json({success: false, foundUser: true, payloads: doctor_em, email: true});
                    }

                    var newDoctor = new doctorModel();
                    newDoctor.cognome = data.cognome;
                    newDoctor.nome = data.nome;
                    newDoctor.oneKey_id = null;
                    newDoctor.email = data.email;
                    newDoctor.rating_privacy = true;
                    newDoctor.save(function (err) {
                        if (err) return res.json({success: false, foundUser: false, err: err.toString()});
                        logger.info('creation new User successfully');
                        res.json({success: true, payloads: newDoctor});
                    });
                });
        });


});
// NON PIU' USATA
router.post('/registration_new_doctor_no_check', function (req, res) {

    var data = req.body;
    logger.debug('params', data);

    var newDoctor = new doctorModel();
    newDoctor.cognome = data.cognome;
    newDoctor.nome = data.nome;
    newDoctor.oneKey_id = null;
    newDoctor.email = data.email;
    newDoctor.rating_privacy = true;
    newDoctor.save(function (err) {
        if (err) return res.json({success: false, foundUser: false, err: err.toString()});
        logger.info('creation new User successfully');
        res.json({success: true, payloads: newDoctor});
    });

});


module.exports = router;

var express = require('express');
var router = express.Router();

var csv = require('csv');
var fs = require('fs');
var multer = require('multer');
var gutil = require('gulp-util');
var nimble = require('nimble');
var psw = require('password-hash-and-salt');

var config = require('../../../config').config();
var messages = require('../../../config').messages();
var logger = require('../../../config/Logger');
var DoctorModel = require('../../../db/doctorModel');
var SpeakerModel = require('../../../db/speakerModel');
var EventModel = require('../../../db/eventModel');
var zip = new require('node-zip')();
var validator = require('validator');

var socketio = require('../../../socketio');
var slideLists = require('../../../config').slidesList();


// CONFIGURATION UPLOAD FILE E PARSER CSV
var updatedFile = '';
var option_import = {delimiter: ';', comment: '#', skip_empty_lines: true, columns: []};

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'io/');
    },
    filename: function (req, file, callback) {
        var fwe = file.originalname.substr(0, file.originalname.lastIndexOf('.'));
        var ext = file.originalname.substr(file.originalname.lastIndexOf('.'));
        updatedFile = fwe + '-' + Date.now() + ext;
        callback(null, updatedFile);
    }
});
var upload = multer({storage: storage}).single('file');
var eraseFile = function (file, test) {

    var path_in = config.IMPORT_CONF.PATH_IN;
    file = path_in + file;
    fs.exists(file, function (exists) {
        if (exists) {
            console.log(gutil.colors.green('File ' + file + ' exists. Deleting now ...'));
            fs.unlink(file);
        } else {
            console.log(gutil.colors.red('File ' + file + ' not found, so not deleting.'));
        }
    });
};


// IF IS NOT A .CSV FILE
function checkForCsv(cb) {
    var ext = updatedFile.substr(updatedFile.lastIndexOf('.'));
    if (ext != '.csv') {
        eraseFile(updatedFile, 4);
        return cb(messages.API_MESS.ERROR_NO_CSV);
    }
    cb(null);
}

//AZZERAMENTO VALORI DI LOADING
function resetLoadingValues() {
    socketio.infoFromApi('/admin', 'loadingData', 0);
    socketio.infoFromApi('/admin', 'setItemsTotal', 0);
}

function checkCSVFormat(file, type, cb) {

    //check the first row of the file
    var columns = 0;
    for (var key in file[1]) {
        columns++;
    }

    var columnsSpeaker = 6;
    var columnsEvent = 5;
    var columnsDoctor = 5;


    switch (type) {
        case 'event':
            if (columns == columnsEvent) {
                if (file[1].data.split('/').length != 3) {
                    return cb(messages.API_MESS.ERROR_READ_CSV_EVENTS);
                }
                return cb(null)
            } else {
                cb(messages.API_MESS.ERROR_READ_CSV_EVENTS);
            }
            break;
        case 'speaker':
            if (columns == columnsSpeaker) {
                if (!file[1].cod_relatore) {
                    return cb(messages.API_MESS.ERROR_READ_CSV_SPEAKERS);
                }
                return cb(null);
            } else {
                cb(messages.API_MESS.ERROR_READ_CSV_SPEAKERS);
            }
            break;
        case 'doctor':
            if (columns == columnsDoctor) {
                if (!validator.isEmail(file[1].email)) {
                    return cb(messages.API_MESS.ERROR_READ_CSV_EVENTS);
                }
                return cb(null)
            } else {
                cb(messages.API_MESS.ERROR_READ_CSV_EVENTS);
            }
            break;
    }
}


//ROUTES


//var express_csv = require('express-csv');
router.get('/exportCSV', function (req, res) {


    //CHECK FRO AUTHENTICATION
    if (!req.headers) {
        req.headers = {};
    }
    req.headers.authorization = req.query.authorization;
    jwt_Auth.isAuthenticated(req, res);


    // IF AUTHENTICATION IS OK...
    var inputForQuestions = [];
    var inputForCompetitors = [];
    EventModel.find({"happened": 'tue'})
        .exec(function (err, events) {
            if (err) return res.json({
                success: false,
                err: err.toString(),
                message: messages.API_MESS.ERROR_COMPOSITION_CSV
            });


            events.forEach(function (item, index) {
                // FILE QUESTIONS
                var informationJson = item.details;
                var convention_data = require('../../../conventionInfo/' + item._doc.slide_list + '.json');
                var quizSlide = [];
                convention_data.slides.forEach(function (slide, index_sl) {
                    // ESCLUISONE QUIZ DI TEST
                    if (slide.sub_type != quizSubType.TEST) {
                        if (slide.type == slideType.QUIZ) quizSlide.push(index_sl);
                    }
                });

                var day = item._doc.data.getDate();
                if (day < 10) day = '0' + day;
                var mounth = item._doc.data.getMonth() + 1;
                if (mounth < 10) mounth = '0' + mounth;
                var year = item._doc.data.getFullYear();
                var data = day + '/' + mounth + '/' + year;

                var users = informationJson.sockets;
                for (var key in users) {
                    var user = users[key];
                    if (user.type == socketType.USER) {
                        var record = [];
                        record.push(user.name);
                        record.push(user.surname);
                        record.push(user.oneKey_id);
                        record.push(item._doc.denominazione);
                        record.push(data);
                        record.push(item._doc.luogo_evento);
                        record.push(informationJson.speaker.name);
                        record.push(item._doc.slide_list);
                        // VOTAZIONI (1 = risposta esatta, 0 = risposta errata, -1 = risposta non data, null = quiz vuoto)
                        for (var i = 0; i < 20; i++) {
                            var slide_id = quizSlide[i];
                            if (slide_id) {

                                // SE !user.votes :                         NON HA MAI VOTATO PER QUESTO EVENTO
                                // SE user.votes[slide_id] == undefined :   NON HA VOTATO PER QUESTA SLIDE
                                if (!user.votes || user.votes[slide_id] == undefined) {
                                    record.push(-1);
                                } else if (user.votes[slide_id] == convention_data.slides[slide_id].quiz['right-answer']) {
                                    record.push(1);
                                } else if (user.votes[slide_id] != convention_data.slides[slide_id].quiz['right-answer']) {
                                    record.push(0);
                                }

                            } else {
                                record.push(null);
                            }
                        }
                        inputForQuestions.push(record);
                    }
                }

                // FILE COMPETITORS
                for (var key in users) {
                    var user = users[key];
                    var record = [];
                    record.push(user.name);
                    record.push(user.surname);
                    record.push(user.email);
                    record.push(user.oneKey_id);  // todo todomellin vincenzo arriverà quando sistemo il login
                    record.push(item._doc.denominazione);
                    record.push(data);
                    record.push(item._doc.luogo_evento);
                    record.push(informationJson.speaker.name);
                    record.push(item._doc.slide_list);

                    inputForCompetitors.push(record);
                }


            });


            var id = new Date().getTime();
            var fileNameQuestions = 'questions.csv';
            var fileNameCompetitors = 'competitors.csv';
            var fileNameZip = 'io/exportData_' + id + '.zip';

            // var dataQuestions = "";
            // var dataCompetitors = "";   //#Nome;Cognome;Mail;WITI;evento ;data;location;ISF scelto durante login;Presentazione utilizzata


            nimble.parallel([
                    // FIRST FILE
                    function (cb) {
                        var option_export = {delimiter: ';', comment: '#', skip_empty_lines: true, header: true};
                        option_export.columns = ["#Nome", "Cognome", "WITI", "evento", "data", "location", "Speaker scelto durante login", "Presentazione utilizzata", "Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8", "Q9", "Q10", "Q11", "Q12", "Q13", "Q14", "Q15", "Q16", "Q17", "Q18", "Q19", "Q20"];
                        csv.stringify(inputForQuestions, option_export, function (err, data) {
                            if (err) return res.json({
                                success: false,
                                err: err.toString(),
                                message: messages.API_MESS.ERROR_COMPOSITION_CSV
                            });
                            //SCRIVO I DATI SU FILE (dentro ZIP)
                            zip.file(fileNameQuestions, data);
                            cb();
                        });
                    },
                    // SECOND FILE
                    function (cb) {
                        var option_export = {delimiter: ';', comment: '#', skip_empty_lines: true, header: true};
                        option_export.columns = ["#Nome", "Cognome", "Mail", "WITI", "evento", "data", "location", "Speaker scelto durante login", "Presentazione utilizzata"];
                        csv.stringify(inputForCompetitors, option_export, function (err, data) {
                            if (err) return res.json({
                                success: false,
                                err: err.toString(),
                                message: messages.API_MESS.ERROR_COMPOSITION_CSV
                            });
                            //SCRIVO I DATI SU FILE (dentro ZIP)
                            zip.file(fileNameCompetitors, data);
                            cb();
                        });
                    }
                ],
                function (cb) {
                    // CREAZIONE FILE ZIP E DOWNLOAD
                    var dataZipFile = zip.generate({base64: false, compression: 'DEFLATE'});
                    fs.writeFileSync(fileNameZip, dataZipFile, 'binary');
                    logger.info('Written zip');

                    res.download(fileNameZip, fileNameZip, function (err) {
                        if (err) return res.json({
                            success: false,
                            err: err.toString(),
                            message: messages.API_MESS.ERROR_DOWNLOAD_CSV
                        });
                        console.log('export zip OK');
                    });
                }
            );

        });

    // return res.send();


    // data = {"1": 1, "2": 2};

    // inputForQuestions = [
    //     ['1', '2', '3', '4'],
    //     ['anello', 'birbante', 'c', 'd'],
    //     ['anello', 'birbante', 'c', 'd'],
    //     ['anello', 'birbante', 'c', 'd'],
    //     ['anello', 'birbante', 'c', 'd'],
    //     ['anello', 'birbante', 'c', 'd'],
    //     ['anello', 'birbante', 'c', 'd'],
    //     ['anello', 'birbante', 'c', '12345555'],
    //     ['anello', 'birbante', 'c', 'd'],
    //     ['anello', 'birbante', 'c', 'eeeee', 1234]
    // ];

    // var inputForCompetitors = [
    //     ['albero', 'bello', 'ciao', 'd'],
    //     ['albero', 'bello', 'ciao', 'd'],
    //     ['albero', 'bello', 'ciao', '12345555'],
    //     ['albero', 'bello', 'ciao', 'd'],
    //     ['albero', 'bello', 'ciao', 'eeeee', 1234]
    // ];


});


var jwt_Auth = require('../../../services/jwt_tokenAuth');
router.use(jwt_Auth.isAuthenticated);

// IMPORTAZIONE EVENTI
router.post('/importCSV/event', function (req, res) {
    resetLoadingValues();
    upload(req, res, function (err) {
        if (err) return res.json({success: false, err: err});

        //READ FILE
        var path_in = config.IMPORT_CONF.PATH_IN;
        fs.readFile(path_in + updatedFile, 'utf8', function (err, data) {
            if (err) {
                eraseFile(updatedFile);
                return res.json({success: false, err: err, message: messages.API_MESS.ERROR_READ_FILE});
            }

            checkForCsv(function (err) {
                if (err) return res.json({success: false, err: err, message: err});

                // PARSING CSV
                option_import.columns = ['venue_id', 'denominazione', 'linea', 'luogo_evento', 'data'];
                csv.parse(data, option_import, function (err, file_record) {
                    if (err) {
                        eraseFile(updatedFile);
                        return res.json({
                            success: false,
                            err: err.toString(),
                            message: messages.API_MESS.ERROR_READ_CSV_EVENTS
                        });
                    }

                    eraseFile(updatedFile);

                    var file_record_ok = [];
                    var file_record_skipped = [];

                    logger.debug('lunghezza iniziale', file_record.length);

                    nimble.series([
                        // CHECK IF IS A VALID .csv
                        function (cb) {
                            checkCSVFormat(file_record, 'event', function (err) {
                                if (err) return res.json({success: false, err: err, message: err});
                                cb();
                            });
                        },

                        function (cb) {
                            file_record.forEach(function (item, index) {
                                if (index > 0) {    //skip first line
                                    //ELIMINA RECORD NON VALIDI
                                    if (item.venue_id) {
                                        //date
                                        var parts = item.data.split("/");
                                        var d = new Date();
                                        d.setFullYear(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                                        item.data = d;

                                        file_record_ok.push(item);
                                    } else {
                                        item.index = index;
                                        file_record_skipped.push(item);
                                        logger.debug('Item skipped', index);
                                    }
                                }
                            });
                            cb();
                        },

                        function (cb) {
                            // CONTROLLO PER ESCLUDERE RECORD GIÀ PRESENTI OPPURE NON VALIDI
                            EventModel.find({}).exec(function (err, items) {
                                if (err) return res.json({
                                    success: false,
                                    err: err,
                                    message: messages.API_MESS.ERROR_READ_DB_ITEMS
                                });

                                var temp_record = [];
                                for (var id_fr in file_record_ok) {
                                    for (var id_it in items) {
                                        if (file_record_ok[id_fr].venue_id == items[id_it].venue_id) {
                                            logger.debug('found in db', file_record_ok[id_fr].venue_id);
                                            file_record_ok[id_fr].found = true;
                                            break;
                                        }
                                    }
                                }

                                for (var id_fr in file_record_ok) {
                                    if (!file_record_ok[id_fr].found) {
                                        temp_record.push(file_record_ok[id_fr])
                                    }
                                }

                                file_record_ok = temp_record;
                                cb()

                            });
                        },

                        // SALVATAGGIO DB
                        function (cb) {

                            if (file_record_ok.length == 0) cb();
                            socketio.infoFromApi('/admin', 'setItemsTotal', file_record_ok.length);
                            file_record_ok.forEach(function (item, index) {

                                item.data.setHours(23, 59, 59, 999);
                                console.log('item', item.data);

                                var event = new EventModel(item);
                                event.save(function (err) {
                                    if (err) {
                                        logger.debug('errore di scrittura evento', index, item);
                                        return res.json({success: false, err: err});
                                    }
                                    logger.debug('Event created successfully', index);
                                    socketio.infoFromApi('/admin', 'loadingData', index + 1);
                                    if (file_record_ok.length == index + 1) {
                                        cb();
                                    }
                                })
                            });
                        },
                        function (cb) {
                            logger.info(messages.API_MESS.PROCESSED_FILES);
                            res.json({
                                success: true,
                                count: file_record_ok.length,
                                payloads: file_record_ok,
                                skipped: file_record_skipped
                            });
                        }
                    ]);
                });
            });
        });

    });
});

// IMPORTAZIONE RELATORI
router.post('/importCSV/speaker', function (req, res) {
    resetLoadingValues();

    upload(req, res, function (err) {
        if (err) return res.json({success: false, err: err});

        //READ FILE
        var path_in = config.IMPORT_CONF.PATH_IN;
        fs.readFile(path_in + updatedFile, 'utf8', function (err, data) {
            if (err) {
                eraseFile(updatedFile, 1);
                return res.json({success: false, err: err});
            }

            checkForCsv(function (err) {
                if (err) return res.json({success: false, err: err, message: err});


                // PARSING CSV
                option_import.columns = ['cod_relatore', 'relatore', 'ruolo_relatore', 'team', 'username', 'password'];
                csv.parse(data, option_import, function (err, file_record) {

                    if (err) {
                        // logger.verbose(err);
                        eraseFile(updatedFile, 2);
                        return res.json({
                            success: false,
                            err: err.toString(),
                            message: messages.API_MESS.ERROR_READ_CSV_SPEAKERS
                        });
                    }
                    eraseFile(updatedFile, 3);


                    //test
                    var file_record_ok = [];
                    var file_record_skipped = [];

                    logger.debug('lunghezza iniziale', file_record.length);

                    nimble.series([
                        // CHECK IF IS A VALID .csv
                        function (cb) {
                            checkCSVFormat(file_record, 'speaker', function (err) {
                                if (err) return res.json({success: false, err: err, message: err});
                                cb();
                            });
                        },

                        function (cb) {
                            file_record.forEach(function (item, index) {
                                //SKIP FIRST LINE
                                if (index > 0) {
                                    //ELIMINA RECORD NON VALIDI
                                    if (item.cod_relatore) {
                                        file_record_ok.push(item);
                                    } else {
                                        item.index = index;
                                        file_record_skipped.push(item);
                                        logger.debug('Item skipped', index);
                                    }
                                }
                            });
                            cb();
                        },

                        function (cb) {
                            // CONTROLLO PER ESCLUDERE RECORD GIÀ PRESENTI OPPURE NON VALIDI
                            SpeakerModel.find({}).exec(function (err, items) {
                                if (err) res.json({
                                    success: false,
                                    err: err,
                                    message: messages.API_MESS.ERROR_READ_DB_ITEMS
                                });

                                var temp_record = [];
                                for (var id_fr in file_record_ok) {
                                    for (var id_it in items) {

                                        if (file_record_ok[id_fr].cod_relatore == items[id_it].cod_relatore) {
                                            logger.debug('found in db', file_record_ok[id_fr].cod_relatore);
                                            file_record_ok[id_fr].found = true;
                                            break;
                                        }
                                    }
                                }

                                for (var id_fr in file_record_ok) {
                                    if (!file_record_ok[id_fr].found) {
                                        temp_record.push(file_record_ok[id_fr])
                                    }
                                }

                                file_record_ok = temp_record;
                                cb()

                            });
                        },

                        // // CRITTOGRAFIA PASSWORD
                        // function (cb) {
                        //     file_record_ok.forEach(function (item, index) {
                        //         psw(item.password).hash(function (err, hash) {
                        //             if (err) return res.json({success: false, err: err});
                        //             item.password = hash;
                        //             logger.info('test', index, file_record_ok.length);
                        //             if (file_record_ok.length - 1 == index) {
                        //                 logger.debug('lunghezza effettiva:', file_record_ok.length);
                        //                 cb();
                        //             } else {
                        //                 logger.info('non ci siamo ancora', file_record_ok.length);
                        //             }
                        //         })
                        //
                        //     })
                        // },

                        // SALVATAGGIO DB
                        function (cb) {

                            if (file_record_ok.length == 0) cb();
                            //socketio.infoFromApi('/admin', 'loadingData', 0);
                            socketio.infoFromApi('/admin', 'setItemsTotal', file_record_ok.length);
                            file_record_ok.forEach(function (item, index) {
                                //ERASE SPACES BEFORE AND AFTER USERNAME AND PASSWORD
                                item.username = item.username.trim();
                                item.password = item.password.trim();

                                var speaker = new SpeakerModel(item);
                                speaker.save(function (err) {
                                    if (err) res.json({success: false, err: err});
                                    logger.debug('Speaker created successfully', index);
                                    socketio.infoFromApi('/admin', 'loadingData', index + 1);
                                    if (file_record_ok.length == index + 1) {
                                        cb();
                                    }
                                })
                            });
                        },
                        function (cb) {
                            logger.info(messages.API_MESS.PROCESSED_FILES);
                            res.json({
                                success: true,
                                count: file_record_ok.length,
                                payloads: file_record_ok,
                                skipped: file_record_skipped
                            });
                        }
                    ]);
                });
            })


        });

    });
});

// IMPORTAZIONE MEDICI
router.post('/importCSV/doctor', function (req, res) {
    resetLoadingValues();

    upload(req, res, function (err) {
        if (err) return res.json({success: false, err: err});

        //READ FILE
        var path_in = config.IMPORT_CONF.PATH_IN;
        fs.readFile(path_in + updatedFile, 'utf8', function (err, data) {
            if (err) {
                eraseFile(updatedFile);
                return res.json({success: false, err: err});
            }

            checkForCsv(function (err) {
                if (err) return res.json({success: false, err: err, message: err});

                // PARSING CSV
                option_import.columns = ['oneKey_id', 'nome', 'cognome', 'email', 'rating_privacy'];
                csv.parse(data, option_import, function (err, file_record) {
                    if (err) {
                        eraseFile(updatedFile);
                        return res.json({
                            success: false,
                            err: err.toString(),
                            message: messages.API_MESS.ERROR_READ_CSV_DOCTORS
                        });
                    }
                    eraseFile(updatedFile);

                    //test
                    var file_record_ok = [];
                    var file_record_skipped = [];

                    logger.debug('lunghezza iniziale', file_record.length);

                    nimble.series([
                        // CHECK IF IS A VALID .csv
                        function (cb) {
                            checkCSVFormat(file_record, 'doctor', function (err) {
                                if (err) return res.json({success: false, err: err, message: err});
                                cb();
                            });
                        },

                        function (cb) {
                            //ELIMINA RECORD NON VALIDI
                            file_record.forEach(function (item, index) {
                                if (index > 0) {    //skip first line
                                    if (item.oneKey_id) {
                                        file_record_ok.push(item)
                                    } else {
                                        item.index = index;
                                        file_record_skipped.push(item);
                                        logger.debug('Item skipped', index)
                                    }
                                }
                            });
                            logger.debug('lunghezza effettiva:', file_record_ok.length);
                            cb();
                        },


                        function (cb) {
                            // CONTROLLO PER ESCLUDERE RECORD GIÀ PRESENTI OPPURE NON VALIDI
                            DoctorModel.find({}).exec(function (err, items) {
                                if (err) res.json({
                                    success: false,
                                    err: err,
                                    message: messages.API_MESS.ERROR_READ_DB_ITEMS
                                });

                                var temp_record = [];
                                for (var id_fr in file_record_ok) {
                                    for (var id_it in items) {

                                        if (file_record_ok[id_fr].email == items[id_it].email) {
                                            logger.debug('found in db', file_record_ok[id_fr].email);
                                            file_record_ok[id_fr].found = true;
                                            break;
                                        }
                                    }
                                }

                                for (var id_fr in file_record_ok) {
                                    if (!file_record_ok[id_fr].found) {
                                        temp_record.push(file_record_ok[id_fr])
                                    }
                                }

                                file_record_ok = temp_record;
                                cb()
                            });
                        },

                        // SALVATAGGIO DB
                        function (cb) {
                            if (file_record_ok.length == 0) cb();
                            socketio.infoFromApi('/admin', 'setItemsTotal', file_record_ok.length);
                            file_record_ok.forEach(function (item, index) {
                                var doctor = new DoctorModel(item);
                                doctor.save(function (err) {
                                    if (err) res.json({success: false, err: err});
                                    logger.debug('Doctor created successfully', index);
                                    socketio.infoFromApi('/admin', 'loadingData', index + 1);
                                    if (file_record_ok.length == index + 1) {
                                        cb();
                                    }
                                })
                            });
                        },
                        function (cb) {
                            logger.info(messages.API_MESS.PROCESSED_FILES);
                            res.json({
                                success: true,
                                count: file_record_ok.length,
                                payloads: file_record_ok,
                                skipped: file_record_skipped
                            });
                        }
                    ]);

                });
            })
        });
    });
});


module.exports = router;


// error: uncaughtException: next is not a function date=Mon Aug 08 2016 18:49:03 GMT+0200 (CEST),
//     pid=13687,
//     uid=501,
//     gid=20,
//     cwd=/Users/vincenzo/WSProjects/telemeeting/server,
//     execPath=/usr/local/bin/node,
//     version=v4.4.4,
//     argv=[/usr/local/bin/node,
//         /Users/vincenzo/WSProjects/telemeeting/server/app.js],
//     rss=110735360,
//     heapTotal=69174112,
//     heapUsed=63530360,
//     loadavg=[2.015625,
//         2.0400390625,
//         2.06494140625],
//     uptime=1036326,
//     trace=[column=9,
//         file=/Users/vincenzo/WSProjects/telemeeting/server/services/jwt_tokenAuth.js,
//         function=null,
//         line=28,
//         method=null,
//         native=false,
//         column=18,
//         file=/Users/vincenzo/WSProjects/telemeeting/server/node_modules/jsonwebtoken/index.js,
//         function=null,
//         line=54,
//         method=null,
//         native=false,
//         column=9,
//         file=node.js,
//         function=nextTickCallbackWith0Args,
//         line=420,
//         method=null,
//         native=false,
//         column=13,
//         file=node.js,
//         function=process._tickCallback,
//         line=349,
//         method=_tickCallback,
//         native=false],
//     stack=[TypeError: next is not a function,
// at /Users/vincenzo/WSProjects/telemeeting/server/services/jwt_tokenAuth.js:28:9,
// at /Users/vincenzo/WSProjects/telemeeting/server/node_modules/jsonwebtoken/index.js:54:18,
//     at nextTickCallbackWith0Args (node.js:420:9),
// at process._tickCallback (node.js:349:13)]

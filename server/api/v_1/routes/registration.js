var express = require('express');
var router = express.Router();

var util = require('util');
var fs = require('fs');
var path = require('path');
var psw = require('password-hash-and-salt');
var validator = require('../../../services/validators');
var User = require('../../../db/userModel');
var mSender = require('../../../services/MailSender');
var nimble = require('nimble');
var EmailTemplate = require('email-templates').EmailTemplate;

router.post('/register', function (req, res, next) {

    var email = req.body.email;
    var name = req.body.name;
    var surname = req.body.surname;
    var password = req.body.matching_password.password;
    var password_confirm = req.body.matching_password.password_confirm;

    var route = req.baseUrl + req.path;


    //CONTROLLO EMAIL
    if (!validator.email(email)) {
        res.json({err: "EMAIL NON VALIDA"});
        return;
    }
    //CONTROLLO PASSWORD
    if (!validator.password(password)) {
        res.json({err: "PASSWORD NON VALIDA"});
        return;
    }
    //CONTROLLO PASSWORD
    if (!validator.password(password_confirm)) {
        res.json({err: "PASSWORD_C NON VALIDA"});
        return;
    }
    //MATCHING PASSWORDS
    if (password != password_confirm) {
        res.json({err: "MATCHING NON VALIDO"});
        return;
    }
    //CONTROLLO NOME
    if (!name) {
        res.json({err: "NOME NON VALIDO"});
        return;
    }
    //CONTROLLO COGNOME
    if (!surname) {
        res.json({err: "COGNOME NON VALIDO"});
        return;
    }

    //var hash = "";
    var user = "";

    nimble.series([
        function (callback) {
            //todo verificare la mail
            callback()
        },

        function (callback) {
            //CREAZIONE HASH + SALT
            psw(password).hash(function (error, hash) {
                if (error) throw new Error('Something went wrong!');

                //todo CONTROLLARE USER-MODEL FINCHE' NON è DEFINITIVO
                user = {
                    email: email,
                    name: name,
                    surname: surname,
                    //indirizzo : String,
                    //permessi : Number
                    confirm: false,
                    hash: hash,
                    //username : String,
                };
                callback();
            })
        },

        function (callback) {
            //REGISTRAZIONE UTENTE
            User.createNewUser(user, function (err, user) {
                if (err) res.json({success: false, message: "Registrazione non avvenuta!!"});
                //console.log('creato: %s', user);
                callback();
            })
        },

        function (callback) {

            //Creazione link
            var code = user.hash.slice(30, 70);
            var link = util.format('http://%s/%s/%s/%s', req.headers.host, 'registerConfirm', user.email, code);
            var site = req.headers.host;
            //console.log (link);

            //todo sostituire la mail con la mail inviata dal client
            var mailTo = ['vincenzopatti85@gmail.com'];

            mSender.sendMailToConfirm(mailTo, link, site, function (err, success) {

                if (err) {
                    console.log(err);
                    res.json({success: false, route: route, mail: email, error: err});
                } else if (!success) {
                    res.json({success: false, route: route, mail: email, error: "EMAIL NON INVIATA"});
                } else {
                    console.log(success);
                    res.json({success: true, route: route, mail: email, success: success});
                }
            });
        }
    ]);

});


router.get('/registerConfirm/:email/:code', function (req, res, next) {


    //var data = req.params;
    //console.log(data);

    //cambia il valore confirm dalla property 'confirm'

    /*toDo
     var email = ...
     controlla se c'è la mail in db
     verifica il code secondo un algritmo

     verifica confirm
     se confermato
     restiuire messaggio di info sulla conferma
     se non confermato
     CONFRMA

     restituire una pagina di conferma
     */

    var email = req.params.email;
    var code = req.params.code;

    var user = "";


    nimble.series([
        function (callback) {
            //RICERCA UTENTE
            User.findByEmail(email, function (err, user) {
                if (err) res.status(401).json({err: err});
                if (!user) res.status(401).json({err: "email non valida"});

                //VERIFICA CODE
                if (code != user.hash.slice(30, 70)) {
                    res.send('ERRORE SU VERIFICA');
                } else {
                    user = user;
                    callback();
                }
            })
        },

        function () {
            //INVIO PAGINA DI CONFERMA

            //toDo cambiare il template
            //var route = req.baseUrl + req.path;
            var templateDir = path.join('./services', 'templates', 'confirmation');
            var template = new EmailTemplate(templateDir);
            var confirmPage = {site: 'inserire qui il sito'};

            template.render(confirmPage, function (err, results) {
                if (err) res.status(401).json({err: err});

                //toDo verificare se già confermato
                //CONFERMA EMAIL

                //toDo confermare
                //user.confirm = true;
                //user.save();

                console.log(req.params);
                res.send(results.html)
            })
        }
    ]);

    return; //res.send(req.params);


    //toDo cosa restituire se c'è un errore o se già confemato?


    /*User.findByEmail(email, function (err, user) {
     if (err) res.status(401).json({err: err});

     //VERIFICA CODE
     if (code != user.hash.slice(30, 70)) {
     res.send('ERRORE SU VERIFICA')
     } else {

     var emailBody = './support/confirmation.html';
     var site = req.headers.host;

     fs.readFile(emailBody, 'utf8', function (err, data) {
     if (err) {
     res.send(err);
     }

     //CONFERMA EMAIL
     //toDo verificare se già confermato
     user.confirm = true;
     user.save();

     data = data.replace('%SITE_ADDRESS%', site);
     data = data.replace('%SITE_ADDRESS%', site);

     res.send(data);
     });


     }
     });*/
});

module.exports = router;

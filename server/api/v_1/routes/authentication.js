var express = require('express');
var router = express.Router();

var util = require('util');
var fs = require('fs');
var validator = require('../../../services/validators');
var service_token = require('../../../services/jwt_service');
var msg = require('../../../config/messages.json');
var User = require('../../../db/userModel');

router.post('/login', function (req, res, next) {
    var route = req.baseUrl + req.path;
    console.log(route);
    var email = req.body.email;
    var password = req.body.password;

    //VALIDAZIONE FORMATO EMAIL E PASSWORD
    if (!validator.email(email) || !validator.password(password)) {
        console.log('(validator non superato) email:%s | password:%s', validator.email(email), validator.password(password));
        return res.status(401).json({err: msg.AUTH_FAIL});
    }

    User.findByEmail(email, function (err, user) {
        if (err) return res.status(401).json({err: msg.AUTH_FAIL});

        if (!user) {
            console.log('(User.findByEmail) err: %s', 'MAIL NON TROVATA');
            return res.status(401).json({err: msg.AUTH_FAIL});
        } else {
            if (!user.confirm) return res.status(401).json({err: msg.AUTH_NOT_CONFIRMED});

            // VERIFICA PASSWORD
            user.VerifyPassword(password, function (err, verified) {
                if (err) {
                    console.log('(User.findByEmail) err: %s', err);
                    return res.status(401).json({err: msg.AUTH_FAIL});
                } else if (!verified) {
                    console.error("(User.findByEmail) PASSWORD NOT VERIFIED FOR: %s (username)", user.username);
                    return res.status(401).json({err: msg.AUTH_FAIL});
                } else if (verified) {
                    console.info('(User.findByEmail) PASSWORD VERIFIED FOR %s', user.username);
                    res.json({user: user, token: service_token.issueToken(user._id + "")}); //OK
                }
            });
        }
    })

});


module.exports = router;

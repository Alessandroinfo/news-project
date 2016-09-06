/**
 * Created by Ale on 05/09/2016.
 */
var express = require('express');
var router = express.Router();
var AdminModel = require("../../../db/AdminModel");  //Importo il modello della collection

//  -------------------------        ADMIN       -------------------------
//API per il login
router.post('/tryLogin', function (req, res) {
    AdminModel.find(   //Effettuo una ricerca sul db, ritorna una collezione di Models
        req.body
    ).exec(function (err, arrayModel) {  //E' possibile mettere ulteriori funzioni in cascata, in questo caso si esegue exec per eseguire la query
        if (err) {
            res.send(err)
        }

        res.json({success: true, payloads: arrayModel});
    });

});

module.exports = router;
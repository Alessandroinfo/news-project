var express = require('express');
var router = express.Router();
var ArticlesModel = require("../../../db/ArticlesModel");  //Importo il modello della collection

/*//TEST API
 router.get('/', function (req, res, next) {
 var route = req.baseUrl + req.path;
 res.send({success: true, route: route});
 });*/

// API ---------------------------------------------------------------------


//  -------------------------        ARTICOLI       -------------------------
//API per la creazione di un articolo
router.post('/createArticle', function (req, res) {


    var articolo = new ArticlesModel(  //Creo il modello popolandolo con i dati
        req.body
    );

    articolo.save(function (err, article) {  //Salvo il modello nel db
        if (err) {
            console.log("Errore");
            return err;
        }

        console.log("Scrittura articolo " + article + " avvenuta con successo");

        ArticlesModel.find(   //Effettuo una ricerca sul db, ritorna una collezione di Models
            //{title: "Titolo"}
        ).exec(function (err, arrayModel) {  //E' possibile mettere ulteriori funzioni in cascata, in questo caso si esegue exec per eseguire la query
            //console.log(arrayModel);
            res.json({success: true, payloads: arrayModel, article: article});
        });
    });


});

//API per la visualizzazione degli aticoli
router.get('/showArticles', function (req, res) {

    ArticlesModel.find(   //Effettuo una ricerca sul db, ritorna una collezione di Models
        //{title: "Titolo"}
    ).exec(function (err, arrayModel) {  //E' possibile mettere ulteriori funzioni in cascata, in questo caso si esegue exec per eseguire la query
        //console.log(arrayModel);
        res.json({success: true, payloads: arrayModel, count: arrayModel.length});
    });


});


//API per la cancellazione degli aticoli
router.post('/deleteArticles', function (req, res) {


    ArticlesModel.remove({
        _id: {$in: req.body.ids}
    }, function (err, resDelete) {
        if (err) {
            res.send(err)
        }
        ;

        res.json({success: true, payloads: resDelete.result});
    });

});


//API per la modifica dell'articolo
router.post('/editArticle', function (req, res) {

    ArticlesModel.findById(req.body._id, function (error, articleUpdated) {
        // Gestisco l'errore col middleware di Express
        if (error) return next(error);

        // Errore in caso non viene trovato
        if (!articleUpdated) {
            return res.status(404).json({
                message: 'Articolo con id ' + req.body._id + ' non è stato trovato.'
            });
        }

        // Elimino l'id per non far generare errore di update
        delete req.body._id;
        delete req.body.selected;
        // Update del modello
        articleUpdated.update(req.body, function (error, articleUpdated) {
            if (error) return next(error);

            res.json(articleUpdated);
        });
    });

});


//  -------------------------        ARTICOLI       -------------------------

module.exports = router;

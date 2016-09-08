var express = require('express');
var multer = require('multer');
var router = express.Router();
var ArticlesModel = require("../../../db/ArticlesModel");  //Importo il modello della collection

/*//TEST API
 router.get('/', function (req, res, next) {
 var route = req.baseUrl + req.path;
 res.send({success: true, route: route});
 });*/

// API ---------------------------------------------------------------------


//  -------------------------        ARTICOLI       -------------------------

// Configurazione del multer per il caricamento su server delle immagini
var updatedFile;

// Storage memorizza il dato che arriva come file con il nome del file originale e nel percorso indicato
var storage = multer.diskStorage({
    // Proprieta di multer che dato il file è possibile modificare il percorso dal file che verrà salvato
    destination: function (req, file, callback) {
        callback(null, '../client/app/imagesUploaded/');
    },
    // Proprieta di multer che dato il file è possibile modificare il nome dal file che verrà salvato
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
var upload = multer({storage: storage}).single('file');

//API per la creazione di un articolo
router.post('/createArticle', upload, function (req, res) {

    // Elimino l'id per non far generare errore di update
    delete req.body._id;
    var article = req.body;
    if (req.file) {
        article.imageUrl = req.file.originalname;
    } else {
        article.imageUrl = "";
    }

    // Nel caso in cui è errato il valore
    if (req.body.relevant == "undefined") {
        article.relevant = false;
    }

    // Aggiungo la data all'articolo
    article.date = new Date();

    var articolo = new ArticlesModel(  //Creo il modello popolandolo con i dati
        article
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
router.post('/editArticle', upload, function (req, res) {

    ArticlesModel.findById(req.body._id, function (error, articleToUpdate) {
        // Gestisco l'errore
        if (error) {
            return res.json({success: false, payloads: error});
        }

        // Errore in caso non viene trovato
        if (!articleToUpdate) {
            return res.json({
                message: 'Articolo con id ' + req.body._id + ' non è stato trovato.'
            });
        }

        // Controlli per le modifiche
        var article = {};
        if (articleToUpdate.title != req.body.title) {
            article.title = req.body.title;
        }
        if (articleToUpdate.body != req.body.body) {
            article.body = req.body.body;
        }
        if (articleToUpdate.category != req.body.category) {
            article.category = req.body.category;
        }
        if (articleToUpdate.relevant != req.body.relevant) {
            article.relevant = req.body.relevant;
        }
        // Aggiorno con la nuova immagine
        if (req.file) {
            article.imageUrl = req.file.originalname;
        }

        // Update del modello
        articleToUpdate.update(article, function (error, articleUpdated) {
            if (error) return next(error);

            ArticlesModel.findById(req.body._id, function (error, editedArticle) {
                res.json({success: 1, payloads: editedArticle});
            });

        });
    });

});


//  -------------------------        ARTICOLI       -------------------------

module.exports = router;

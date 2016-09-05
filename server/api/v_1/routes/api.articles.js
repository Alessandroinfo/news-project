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
        {
            title: "Titolo",
            category: "Categoria",
            body: "Corpo",
            imageUrl: "Url immagine"
        }
    );

    /*    var articolo = new ArticlesModel(  //Creo il modello popolandolo con i dati
     req.body
     );*/

    articolo.save(function (err, article) {  //Salvo il modello nel db
        if (err) {
            console.log("Errore");
            return err;
        }

        console.log("Scrittura avvenuta con successo");

        ArticlesModel.find(   //Effettuo una ricerca sul db, ritorna una collezione di Models
            //{title: "Titolo"}
        ).exec(function (err, arrayModel) {  //E' possibile mettere ulteriori funzioni in cascata, in questo caso si esegue exec per eseguire la query
            //console.log(arrayModel);
            res.json({success: true, payloads: arrayModel});
        });
    });


});


// get all todos
router.get('/todos', function (req, res) {

    // use mongoose to get all todos in the database
    Todo.find(function (err, todos) {

        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
        if (err)
            res.send(err)

        res.json(todos); // return all todos in JSON format
    });
});

// create todo and send back all todos after creation
router.post('/todos', function (req, res) {

    // create a todo, information comes from AJAX request from Angular
    Todo.create({
        text: req.body.text,
        done: false
    }, function (err, todo) {
        if (err)
            res.send(err);

        // get and return all the todos after you create another
        Todo.find(function (err, todos) {
            if (err)
                res.send(err)
            res.json(todos);
        });
    });

});

// delete a todo
router.delete('/todos/:todo_id', function (req, res) {
    Todo.remove({
        _id: req.params.todo_id
    }, function (err, todo) {
        if (err)
            res.send(err);

        // get and return all the todos after you create another
        Todo.find(function (err, todos) {
            if (err)
                res.send(err)
            res.json(todos);
        });
    });
});
//  -------------------------        ARTICOLI       -------------------------

module.exports = router;

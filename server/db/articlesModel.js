/**
 * Created by Ale on 05/09/2016.
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;  //Crea uno schema

var articleSchema = new Schema({
    id: Schema.Types.ObjectId,
    title: String,
    category: String,
    body: String,
    imageUrl: String
}, {collection: 'articles'});

articleSchema.index({title: 1}); // Indicizzazione campo per veloce ricerca ma più lenti gli insert

var Articles = mongoose.model('articles', articleSchema);  //Esporto il modello impostato dallo schema
module.exports = Articles;

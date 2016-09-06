/**
 * Created by Ale on 06/09/2016.
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;  //Crea uno schema

var adminSchema = new Schema({
    id: Schema.Types.ObjectId,
    username: String,
    password: String
}, {collection: 'admin'});

var Admin = mongoose.model('admin', adminSchema);  //Esporto il modello impostato dallo schema
module.exports = Admin;

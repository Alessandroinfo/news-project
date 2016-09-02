/**
 * Created by Ale on 02/09/2016.
 */

var env = require('./env.json');
var msg = require('./messages.json');

exports.config = function () {
    var node_env = process.env.NODE_ENV || 'prod';
    return env[node_env];
};

exports.messages = function () {
    return msg;
};
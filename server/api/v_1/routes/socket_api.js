var express = require('express');
var router = express.Router();
var nimble = require('nimble');
var logger = require('../../../config/Logger');


var socketio = require('../../../socketio');


router.post('/ns/new/:id', function (req, res) {
    var id = req.params.id;
    var ns = socketio.newNameSpace(id);
    if (ns == true) return res.json({success: false, err: 'Namespace /' + id + ' già presente'});
    res.json({success: true, payloads: 'Namespace creato: /' + id});

});

router.post('/ns/delete/:id', function (req, res) {
    var id = req.params.id;
    var ns = socketio.deleteNameSpace(id);
    if (ns == false) return res.json({success: false, err: 'Il Namespace /' + id + ' non esiste'});
    res.json({success: true, payloads: 'Namespace eliminato: /' + id});

});

router.get('/ns/list', function (req, res) {
    res.json({success: true, payloads: socketio.getNamespacesList()});
});


module.exports = router;

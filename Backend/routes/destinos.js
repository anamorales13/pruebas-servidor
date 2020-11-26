'use strict'

var express= require('express');
var DestinoController= require('../controllers/destinos');


var router = express.Router(); //disponible el router

var multipart = require('connect-multiparty'); 
var md_upload = multipart({ uploadDir: './upload/documents'});


router.post('/save', DestinoController.save);
router.get('/buscar',DestinoController.buscar );

router.delete('/delete/:id', DestinoController.borrar);
router.get('/destinos/:page?' , DestinoController.getDestinos);
router.get('/destino/:id' , DestinoController.getdestino);
router.get('/destinoByProfesor/:id', DestinoController.getDestinoByProfesor);
router.put('/update_coordinador/:id', DestinoController.putcoordinador);
router.put('/updateProfesor/:id', DestinoController.updateprofesor);

router.get('/comprobarprofesor/:id', DestinoController.comprobarProfesor);

module.exports= router;
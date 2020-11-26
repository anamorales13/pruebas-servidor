'use strict'

var express= require('express');
var UsuarioController= require('../controllers/usuarios');


var router = express.Router(); //disponible el router

//rutas de pruebas:
router.get('/user/:name', UsuarioController.getuserbyname);
router.post('/save', UsuarioController.save);



module.exports= router;
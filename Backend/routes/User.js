'use strict'
var express= require('express');
var UserController= require('../controllers/usuarios');


var router = express.Router(); //disponible el router


router.get('/user/:name', UserController.getuserbyname);
router.post('/save', UserController.save);

module.exports = router 


var Usuario = require('../models/Usuarios');
var fss = require('fs');
var path = require('path');

var express = require("express");

var app = express();


var controllers = {

getuserbyname: (req, res) => {
    var name = req.params.name;
  console.log("hola");
    Usuario.findOne({ name: { $eq: name } }).exec ((err, users) =>{
        
            if (err) return res.status(500).send({
                status: 'fail',
                message: 'error en al peticion'
            });
            if (users) {
                return res.status(200).send({
                    users,
                   
                });
            }
        });
},

save:(req, res)=>{
    var usuario= req.body;

    var user= new Usuario();

    user.nombre=usuario.nombre;
    user.contraseña=usuario.contraseña;
    user.correo=usuario.correo;

    user.save((err, userStored) => {
        if (err || !userStored) {
            return res.status(404).send({
                status: 'err',
                message: 'El articulo no se ha guardado'
            });
        }

        return res.status(200).send({
            status: 'sucess',
            user: userStored
        });
    });
}
};

module.exports = controllers;

var validator = require('validator');
var Destino = require('../models/destinos');
var fss = require('fs');
var path = require('path');

var express = require("express");

var session = require("express-session");

var app = express();

app.use(session({
    secret: "1352ljdainekg875d",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}))

var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');

var controllers = {


    save: (req, res) => {

        var params = req.body;
        var destino = new Destino();


        destino.pais = params.pais;
        destino.ciudad = params.ciudad;
        destino.carrera = params.carrera;
        destino.profesor = params.profesor;
        destino.coordinador = params.coordinador;



        destino.save((errn, destinoStored) => {

            if (errn || !destinoStored) {
                return res.status(500).send({
                    status: 'error',
                    message: 'El destino no se ha guardado'
                });
            }

            return res.status(200).send({
                status: 'sucess',
                destino: destinoStored
            });

        });

    },

    borrar: (req, res) => {
        var id = req.params.id;

        Destino.findOneAndDelete({ _id: { $eq: id } })
            .exec((err, destino) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la peticion'
                    });
                }

                if (!destino) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No se encuentra el destino a eliminar'
                    })
                }

                return res.status(200).send({
                    status: 'sucess',
                    message: 'Destino eliminado correctamente'
                })
            })
    },

    putcoordinador: (req, res) => {
        var id = req.params.id;


        Destino.updateMany({ coordinador: id })
            .exec((err, users) => {
                if (err) return res.status(500).send({
                    status: 'fail',
                    message: 'error en al peticion'
                });
                if (users) {
                    return res.status(200).send({
                        status: 'sucess'
                    });
                }
            });


    },

    updateprofesor: (req, res) => {
        var id = req.params.id;
        var update = req.body;

        Destino.findByIdAndUpdate(req.params.id, { $set: { profesor: update.profesor } }, { new: true }, function (err, destino) {
            if (err || !destino) {
                return res.status(500).send({
                    status: 'error',
                    message: 'El destino no se ha guardado'
                });
            }

            return res.status(200).send({
                status: 'sucess',
                destino: destino
            });
        });

    },

    buscar: (req, res) => {
        var params = req.body;

        Destino.find({ ciudad: { $eq: params.ciudad }, carrera: { $eq: params.carrera }, })
            .exec((err, destino) => {

                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la petición'
                    });
                }

                if (!destino) {
                    return res.status(404).send({
                        status: 'error',
                        message: ' no hay documentos '
                    });
                }



                return res.status(200).send({
                    destino
                });
            });


    },

    getDestinos: (req, res) => {

        var page= 1;
        if(req.params.page){
            page=req.params.page;
        }

        var itemsPerPage=10;

        Destino.find().populate('profesor coordinador', '_id nombre apellido1 apellido2 telefono despacho edificio').sort({pais:1}).paginate(page, itemsPerPage, (err, destino, total) =>{
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la petición'
                    });
                }

                if (!destino || destino.length <= 0) {
                    return res.status(404).send({
                        status: 'error',
                        message: ' no hay documentos'
                    });
                }
                console.log('hola');
                return res.status(200).send({

                    status: 'sucess',
                    destino,
                    total: total,
                    pages: Math.ceil(total/itemsPerPage),
                });
            });

    },

    getdestino: (req, res) => {
        var destinoId = req.params.id;
        console.log(destinoId);

        Destino.findById(destinoId).populate('profesor coordinador', ' _id nombre apellido1 apellido2 edificio despacho telefono')
            .exec((err, destinoget) => {
                if (err) {
                    return res.status(500).send({
                        message: 'Error en la petición'
                    });
                }
                if (!destinoget) {
                    return res.status(404).send({
                        message: 'El usuario no existe'
                    });
                }

                return res.status(200).send({
                    status: 'sucess',
                    destinoget
                });
            })
    },
    getDestinoByProfesor:(req, res) =>{

        var idprofesor=req.params.id;
        Destino.find({ profesor: { $eq: idprofesor } })
        .exec((err, destino) => {

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if (!destino) {
                return res.status(404).send({
                    status: 'error',
                    message: ' no hay documentos '
                });
            }



            return res.status(200).send({
                destino
            });
        });

    },

    comprobarProfesor: (req, res) => {

        var id= req.params.id;

        console.log("id del "+ id);

        Destino.findOne({
            $or: [
                { profesor: { $eq: id } },
                { coordinador: { $eq: id } }]
        })
            .exec((err, destinos) => {
                if (err) return res.status(500).send({
                    status: 'fail',
                    message: 'error en al peticion'
                });

                if(!destinos){
                    console.log("no esta");
                    return res.status(200).send({
                        message:'no existe'
                    })
                }
                if (destinos) {
                    console.log("sucess");
                    return res.status(200).send({
                        status: 'sucess',
                        destinos
                    });
                }
            });

    }


}

module.exports = controllers;
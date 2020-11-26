'use strict'


var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/alumno');
var Mensaje = require('../models/mensaje');
const { estimatedDocumentCount } = require('../models/alumno');

var controllers = {

    probando: (req, res) => {
        res.status(200).send({ message: 'Hola que tal' });
    },

    save: (req, res) => {
        var params = req.body;


        if (!params.texto || !params.receptor || !params.asunto || !params.emisor) {
            res.status(200).send({ message: 'Envia los datos necesarios' });

        }
        console.log("texto" + params.texto);
        console.log("emisor " + params.emisor);
        console.log("receptor " + params.receptor);

        var mensaje = new Mensaje();
        mensaje.emisor = params.emisor;
        mensaje.receptor = params.receptor;
        mensaje.asunto = params.asunto;
        mensaje.texto = params.texto;
        mensaje.visto = 'false';

        mensaje.save((err, mensajeStored) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "Error en la petición"
                });
            }
            if (!mensajeStored) {
                return res.status(500).send({
                    status: 'error',
                    message: "Error al enviar la petición"
                });
            }
            console.log("hola");

            return res.status(200).send({
                status: 'sucess',
                mensaje: mensajeStored
            })
        })
    },

    getReceivedMessage: (req, res) => {
        var userId = req.params.id;
        var page = 1;
        if (req.params.pages) {
            page = req.params.pages;
        }

        var itemsPerPage = 5;
        console.log("pagina" + page);

        Mensaje.find({
            $or:
                [
                    { "receptor.profesor": userId },
                    { "receptor.alumno": userId }
                ]
        }).populate('emisor.profesor emisor.alumno', 'nombre usuario apellido1 apellido2 telefono image').sort('-fecha').paginate(page, itemsPerPage, (err, mensajes, total) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "Error en la petición"
                });
            }
            if (!mensajes) {
                return res.status(404).send({
                    status: 'error',
                    message: "No hay mensajes"
                });
            }
            return res.status(200).send({
                status: 'sucess',
                total: total,
                pages: Math.ceil(total / itemsPerPage),
                mensajes
            });

        })

    },
    getEmittedMessage: (req, res) => {
        var userId = req.params.id;

        console.log("id: " + userId);
        var page = 1;
        if (req.params.page) {
            page = req.params.page;
        }

        var itemsPerPage = 4;

        Mensaje.find({
            $or:
                [
                    { "emisor.profesor": userId },
                    { "emisor.alumno": userId }
                ]
        }).populate('emisor.profesor emisor.alumno receptor.alumno receptor.profesor', 'nombre usuario apellido1 apellido2 telefono image').sort('-fecha').paginate(page, itemsPerPage, (err, mensajes, total) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "Error en la petición"
                });
            }
            if (!mensajes) {
                return res.status(404).send({
                    status: 'error',
                    message: "No hay mensajes"
                });
            }
            return res.status(200).send({
                status: 'sucess',
                total: total,
                pages: Math.ceil(total / itemsPerPage),
                mensajes
            });

        })

    },

    getMensajesNoVisto: (req, res) => {
        var userId = req.params.id;

        Mensaje.count({
            $or:
                [
                    { "receptor.profesor": userId },
                    { "receptor.alumno": userId }
                ]
            , visto: 'false'
        }).exec((err, count) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "Error en la petición"
                });
            }

            return res.status(200).send({
                status: 'sucess',
                noleidos: count
            });
        })
    },

    setMensajesVisto: (req, res) => {
        var userId = req.params.id;

        Mensaje.update({
            $or:
                [
                    { "receptor.profesor": userId },
                    { "receptor.alumno": userId }
                ], visto: 'false'
        }, { visto: 'true' }, { "multi": true }, (err, mensajeUpdate) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "Error en la petición"
                });
            }
            return res.status(200).send({
                status: 'sucess',
                mensajeUpdate
            });
        })
    },

    getMensaje: (req, res) => {


        var mensajeId = req.params.id;
        var page = 1;
        if (req.params.page) {
            page = req.params.page;
        }

        var itemsPerPage = 4;

        Mensaje.find({ _id: mensajeId }).populate('emisor.alumno emisor.profesor', 'nombre tipo usuario apellido1 apellido2 telefono image email').sort('-fecha').paginate(page, itemsPerPage, (err, mensajes, total) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "Error en la petición"
                });
            }
            if (!mensajes) {
                return res.status(404).send({
                    status: 'error',
                    message: "No hay mensajes"
                });
            }
            return res.status(200).send({
                status: 'sucess',
                mensajes
            });

        })




    },

    getmensajeresponder:(req, res) =>{
        var mensajeId = req.params.id;
       

        Mensaje.find({ _id: mensajeId }).populate('receptor.alumno receptor.profesor', 'nombre tipo  apellido1 apellido2  email').exec((err, mensajes) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: "Error en la petición"
                });
            }
            if (!mensajes) {
                return res.status(404).send({
                    status: 'error',
                    message: "No hay mensajes"
                });
            }

            console.log(mensajes);
            return res.status(200).send({
                status: 'sucess',
                mensajes
            });

        })

    },

    marcarLeido: (req, res) => {
        var mensajeId = req.params.id;

        Mensaje.findByIdAndUpdate(mensajeId, { $set: { visto: true } }, { new: true }, function (err, mensaje) {
            if (err || !mensaje) {
                return res.status(500).send({
                    status: 'error',
                    message: 'El mensaje no se ha actualizado correctamente'
                });
            }

            return res.status(200).send({
                status: 'sucess',
                mensaje: mensaje
            });
        });

    },

    deletebyId: (req, res) => {
        var mensajeId = req.params.id;

        Mensaje.findByIdAndDelete(mensajeId, function (err, mensaje) {
            if (err || !mensaje) {
                return res.status(500).send({
                    status: 'error',
                    message: 'El mensaje no se ha eliminado correctamente'
                });
            }

            return res.status(200).send({
                status: 'sucess',
                mensaje: mensaje
            });
            
        })
    
}

};

module.exports = controllers;
'use strict'

var validator = require('validator');
var Documento = require('../models/documento');
var fs = require('fs');
var path = require('path');
const { TableBody } = require('@material-ui/core');

var controllers = {

    save: (req, res) => {

        var params = req.body;
        //var userN=req.params.user;

        console.log(params);
        try {
            var validate_title = !validator.isEmpty(params.title);
            // var validate_url=!validator.isEmpty(params.url);

        } catch (err) {
            return res.status(200).send({
                status: 'error',
                message: 'faltan datos por enviar'
            });
        }



        if (validate_title /*&& validate_url*/) {
            var documento = new Documento();

            //asignar valores
            documento.title = params.title;

            if (params.url) {
                var file = params.url;
                var file_split = file.split('\.');
                var file_ext = file_split[1];
                console.log("file_ext:" + file_ext);


                if (file_ext == "txt" || file_ext == "doc" || file_ext == "docx") {
                    //documento.url='../assets/images/word.png';
                    documento.tipoDocumento = "word.png";
                } else if (file_ext == "xls" || file_ext == "xlm" || file_ext == "xlt") {
                    //documento.url='../assets/images/default.png';
                    documento.tipoDocumento = "default.png";
                } else if (file_ext == "pdf") {
                    //documento.url='../assets/images/pdf.png';
                    documento.tipoDocumento = "pdf.png";
                } else if (file == "png" || file_ext == "jpg" || file_ext == "jpeg" || file_ext != "gif") {
                    documento.tipoDocumento = "imagen";
                }


                documento.url = params.url;
            } else {
                //documento.url = '../assets/images/default.png';
                documento.tipoDocumento = "default.png";
                documento.url = "default.png";

            }



            if (params.tipousuario === 'Alumno') {
                documento.alumno = params.nombre;
                documento.profesor = params.nombre2;
                documento.propietario = 'Alumno';
            }
            else {
                documento.profesor = params.nombre;
                documento.alumno = params.nombre2;
                documento.propietario = "Profesor";
            }

            if (params.tipo_nube == 'particular') {
                documento.tipo_nube = 'particular';
            } else {
                documento.tipo_nube = "compartida";
            }

            console.log(params.descripcion);
            if (params.descripcion != null) {
                documento.descripcion = params.descripcion;
            }

            /*  if (params.comentario) {
                  documento.comentario = params.comentario;
              } else {
                  documento.comentario = null;
              }*/


            //Guardar el objeto

            Documento.findOne({ title: { $eq: params.title } })
                .exec((err, doc) => {
                    if (err) return res.status(500).send({
                        status: 'err',
                        message: "error en la peticion"
                    })

                    if (doc) { //existe el titulo del documento - modificamos el title.
                        documento.title = documento.title + Math.floor(Math.random() * (1 - 100)) + 1;;
                        documento.save((err, documentoStored) => {
                            if (err || !documentoStored) {
                                return res.status(404).send({
                                    status: 'error',
                                    message: 'El documento no se ha guardado'
                                });
                            }

                            return res.status(200).send({
                                status: 'sucess',
                                documento: documentoStored
                            });
                        });
                    }
                    else { //no existe el documento

                        documento.save((err, documentoStored) => {
                            if (err || !documentoStored) {
                                return res.status(404).send({
                                    status: 'error',
                                    message: 'El documento no se ha guardado'
                                });
                            }

                            return res.status(200).send({
                                status: 'sucess',
                                documento: documentoStored
                            });
                        });
                    }
                })
        } else {
            return res.status(200).send({
                status: 'error',
                message: 'Datos no validos'
            });
        }
    },
    delete: (req, res) => {
        var docString = req.params.title;

        Documento.findOneAndDelete({ title: { $eq: docString } })
            .exec((err, documento) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la peticion'
                    });
                }

                if (!documento) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No se encuentra el documento registrado'
                    })
                }

                return res.status(200).send({
                    status: 'sucess',
                    message: 'Documento eliminado correctamente',
                    documento: documento
                })
            })
    },

    getDocumentosAlumnos: (req, res) => {

        var userId = req.params.id;
        var profesorId = req.params.idprofesor;
        var tipo = "compartida";



        var page = 1;
        if (req.params.pages) {
            page = req.params.pages;
        }

        var itemsPerPage = 1;

        Documento.find({
            $and: [
                { alumno: { $eq: userId } },
                { profesor: { $eq: profesorId } },
                { tipo_nube: { $eq: tipo } }]
        }).populate('alumno', 'nombre apellido1 apellido2').paginate(page, itemsPerPage, (err, documento, total) => {


            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if (!documento || documento.length <= 0) {
                return res.status(404).send({
                    status: 'error',
                    message: ' no hay documentos que coincidan con tu usuario'
                });
            }
            console.log('hola');
            return res.status(200).send({

                status: 'sucess',
                documento,
                total: total,
                pages: Math.ceil(total / itemsPerPage),
            });
        });




    },

    getDocumentosProfesor: (req, res) => {
        var userId = req.params.id;
        var alumnoId = req.params.idalumno;
        var tipo = "compartida"


        var page = 1;
        if (req.params.pages) {
            page = req.params.pages;
        }

        var itemsPerPage = 10;



        Documento.find({
            $and: [
                { profesor: { $eq: userId } },
                { alumno: { $eq: alumnoId } },
                { tipo_nube: { $eq: tipo } }]
        }).populate('profesor alumno', 'nombre apellido1 apellido2').paginate(page, itemsPerPage, (err, documento, total) => {


            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if (!documento || documento.length <= 0) {
                return res.status(404).send({
                    status: 'error',
                    message: ' no hay documentos que coincidan con tu usuario'
                });
            }
            console.log('hola');
            return res.status(200).send({

                status: 'sucess',
                documento,
                total: total,
                pages: Math.ceil(total / itemsPerPage),
            });
        });
    },

    getmydropbox: (req, res) => {
        var userId = req.params.id;
        var tipo = "particular";

        var page = 1;
        if (req.params.pages) {
            page = req.params.pages;
        }

        var itemsPerPage = 10;

        Documento.find({
            $and: [
                { profesor: { $eq: userId } },
                { tipo_nube: { $eq: tipo } }]
        }).populate('profesor', 'nombre apellido1 apellido2').paginate(page, itemsPerPage, (err, documento, total) => {


            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if (!documento || documento.length <= 0) {
                return res.status(404).send({
                    status: 'error',
                    message: ' no hay documentos que coincidan con tu usuario'
                });
            }
            console.log('hola');
            return res.status(200).send({

                status: 'sucess',
                documento,
                total: total,
                pages: Math.ceil(total / itemsPerPage),
            });
        });
    },
    getmydropboxAlumno: (req, res) => {
        var userId = req.params.id;
        var tipo = "particular";

        var page = 1;
        if (req.params.pages) {
            page = req.params.pages;
        }

        var itemsPerPage = 10;

        Documento.find({
            $and: [
                { alumno: { $eq: userId } },
                { tipo_nube: { $eq: tipo } }]
        }).populate('alumno', 'nombre apellido1 apellido2').paginate(page, itemsPerPage, (err, documento, total) => {


            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if (!documento || documento.length <= 0) {
                return res.status(404).send({
                    status: 'error',
                    message: ' no hay documentos que coincidan con tu usuario'
                });
            }
            console.log('hola');
            return res.status(200).send({

                status: 'sucess',
                documento,
                total: total,
                pages: Math.ceil(total / itemsPerPage),
            });
        });
    },

    upload: (req, res) => {

        var filename = 'Imagen no subida';
        var docId = req.params.id;
        var documento = new Documento();
        console.log(docId);

        if (!req.files) {
            return res.status(400).send({
                status: 'error',
                message: filename
            });
        }

        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');

        //  var file_name = file_split[file_split.length-1];
        var file_name = file_split[2];
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];

        /* if (file_ext != 'png' && file_ext != "jpg" && file_ext != "jpeg" && file_ext != "gif") {
              fs.unlink(file_path, (err) => {  //eliminar un fichero
                  return res.status(200).send({
                      status: 'error',
                      message: 'La extensión de la imagen no es válida'
                  });
              });
          } else {*/

        Documento.findOne({ _id: docId }, (err, documentoUpdated) => {
            if (err) {
                return res.status(500).send({
                    message: ' Error en la peticion'
                });
            }
            if (!documentoUpdated) {
                return res.status(404).send({
                    message: 'No se ha podido  actualizar el documento'
                });
            }
            documento = documentoUpdated;
            documento.url = file_name;

            documento.save((errn, docStored) => {
                if (errn || !docStored) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'El documento se ha guardado'
                    });
                }
                return res.status(200).send({
                    status: 'sucess',
                    documento: documentoUpdated
                });
            })
        })







    },

    getImage: (req, res) => {
        var file = req.params.image;
        var path_file = './upload/documents/' + file;

        fs.exists(path_file, (exists) => {

            if (exists) {
                return res.sendFile(path.resolve(path_file));
            } else {
                return res.status(404).send({
                    status: 'error',
                    message: 'la imagen no existe'
                });

            }
        });



    },

};

module.exports = controllers;
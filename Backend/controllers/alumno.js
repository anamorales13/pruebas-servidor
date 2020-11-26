var validator = require('validator');
var Alumno = require('../models/alumno');
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


    pruebas: (req, res) => {
        return res.status(201).send({
            status: 'sucess',
            message: 'TODO OK'
        });
    },



    /*--------------------------------*/
    /*** CREAR UN NUEVO ALUMNO **** */
    /*--------------------------------*/

    save: (req, res) => {
        var params = req.body;

        console.log("nombre" + params.nombre);
        console.log("email" + params.email);
        console.log("apellido" + params.apellido1);
        console.log("apellido" + params.apellido2);

        //1.- validar los datos
        try {
            var validate_nombre = !validator.isEmpty(params.nombre);
            /* var validate_usuario = !validator.isEmpty(params.usuario);*/
            /*var validate_password = !validator.isEmpty(params.password);*/
            var validate_email = !validator.isEmpty(params.email);
            var validate_apellido1 = !validator.isEmpty(params.apellido1);
            var validate_apellido2 = !validator.isEmpty(params.apellido2);


        } catch (err) {
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar'
            });
        }
        console.log(validate_nombre);
        console.log(validate_apellido1);
        console.log(validate_apellido2);
        console.log(validate_email);



        if (validate_nombre && validate_apellido1 && validate_apellido2 && validate_email) {

            // 2- Crear el objeto a guardar
            var usuario = new Alumno();

            // 3- Asignar valores
            usuario.nombre = params.nombre;
            // alumno.usuario = params.usuario;
            //  alumno.password = params.password;
            usuario.email = params.email + '@alu.uhu.es';
            usuario.apellido1 = params.apellido1;
            usuario.apellido2 = params.apellido2;
            usuario.telefono = params.telefono;
            usuario.tipo = params.tipo;

            usuario.image = 'user-default.jpg';

            usuario.documentos.push({ nombre: 'CPRA', estado: 'No Presentado' }, { nombre: 'Learning_Agreement', estado: 'No Presentado' },
                { nombre: 'Modificacion_CPRA', estado: 'No Presentado' }, { nombre: 'Modificacion_LA', estado: 'No Presentado' });

            if (params.destino) {
                usuario.destino = params.uniDestino;
            } else {
                usuario.destino = null;
            }



            if (params.usuario) {
                usuario.usuario = params.usuario;
            } else {
                usuario.usuario = null
            }
            if (params.password) {
                usuario.password = params.password;
            } else {
                usuario.password = null
            }



            // CONTROLAR DUPLICADOS 

            Alumno.find({
                $and: [
                    { email: { $eq: params.email.toLowerCase() } },
                    { usuario: { $eq: params.usuario.toLowerCase() } }]
            })
                .exec((err, users) => {
                    if (err) return res.status(500).send({
                        status: 'err',
                        message: "error en la peticion"
                    })
                    if (users && users.length >= 1) {
                        return res.status(200).send({
                            message: "el usuario que intenta registrar ya existe"
                        })
                    } else {


                        //cifrar contraseña:
                        bcrypt.hash(params.password, null, null, (err, hash) => {
                            usuario.password = hash;

                            // 4 - Guardar el objeto

                            usuario.save((errn, alumnoStored) => {

                                if (errn || !alumnoStored) {
                                    return res.status(500).send({
                                        status: 'error',
                                        message: 'El alumno no se ha guardado'
                                    });
                                }

                                return res.status(200).send({
                                    status: 'sucess',
                                    alumno: alumnoStored
                                });
                            });
                        });
                    }
                })
        } else { //no superan la validación
            return res.status(200).send({
                status: 'error',
                message: 'Datos no validos'
            });
        }
    },
    guardarDestino: (req, res) => {

        var update = req.body;
        var userId = req.params.id;

        Alumno.findByIdAndUpdate(userId, { $set: { destino: update.destino } }, { new: true }, function (err, user) {
            if (err || !user) {
                return res.status(500).send({
                    status: 'error',
                    message: 'El alumno no se ha guardado'
                });
            }

            return res.status(200).send({
                status: 'sucess',
                alumno: user
            });
        });
    },

    guardarProfesorCoordinador: (req, res) => {

        var update = req.body;
        var userId = req.params.id;


        Alumno.findByIdAndUpdate(userId, { $set: { profesor: update.profesor, coordinador: update.coordinador } }, { new: true }, function (err, user) {
            if (err || !user) {
                return res.status(500).send({
                    status: 'error',
                    message: 'El alumno no se ha guardado'
                });
            }

            return res.status(200).send({
                status: 'sucess',
                alumno: user
            });
        })
    },

    /*--------------------------------*/
    /*****     LOGIN UN  USER      **** */
    /*--------------------------------*/

    loginUser: (req, res) => {

        var params = req.body;

        userString = params.usuario;
        passwString = params.password;

        console.log("usuario" + userString);
        console.log("password" + passwString);

        Alumno.findOne({ usuario: { $eq: userString } })
            .exec((err, users) => {

                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: "Error en la petición"
                    });
                }
                if (users) {


                    bcrypt.compare(passwString, users.password, (err, check) => {
                        if (check) {
                            // if(params.gettoken){
                            //generar y devolver el token
                            users.password = undefined;
                            return res.status(200).send({
                                status: 'sucess',
                                users,
                                token: jwt.createToken(users)

                            })
                            // req.session.user=JSON.stringify(users);
                            /*
                            return res.status(200).send({
                                token: jwt.createToken(users)
                            });*/

                            //  }else{

                            //     }

                            /*para no enviar la password */


                        } else {
                            console.log("no passwrd");
                            return res.status(404).send({
                                status: 'error',
                                message: 'El usuario no ha introducido los datos correstamente'
                            });
                        }
                    })
                } else {
                    console.log("no user")
                    return res.status(404).send({
                        status: 'error',
                        message: 'El usuario no ha introducido los datos correstamente'
                    });
                }
            })
    },

    comparePassword: (req, res) => {

        var userId = req.params.id;
        var params = req.body;


        passwString = params.password;

        console.log("hola");
        Alumno.findById(userId, (err, userget) => {
            if (err) {
                return res.status(500).send({
                    message: 'Error en la petición'
                });
            }
            if (!userget) {
                return res.status(404).send({
                    message: 'El usuario no existe'
                });
            }
            if (userget) {
                console.log("comparamos");
                console.log(passwString);
                console.log(userget.password);
                bcrypt.compare(passwString, userget.password, (err, check) => {
                    if (check) {
                        console.log("sucess");
                        return res.status(200).send({
                            status: 'sucess'
                        })
                    } else {
                        return res.status(200).send({
                            status: 'failed'
                        })
                    }

                });
            }

        });
    },

    /*--------------------------------*/
    /*****   DATOS DE UN ALUMNO  *****/
    /*--------------------------------*/

    getUser: (req, res) => {

        var userId = req.params.id;

        console.log("entro");

        Alumno.findById(userId, (err, userget) => {
            if (err) {
                return res.status(500).send({
                    message: 'Error en la petición'
                });
            }
            if (!userget) {
                return res.status(404).send({
                    message: 'El usuario no existe'
                });
            }

            return res.status(200).send({
                status: 'sucess',
                user: userget
            });
        })
    },

    


    /*--------------------------------*/
    /***** ACTUALIZAR DATOS ALUMNO  *****/
    /*--------------------------------*/

    updateUser: (req, res) => {
        var userId = req.params.id;
        var update = req.body;

        //borrar propiedad password
        delete update.password;

        /*  if(userId != req.users.sub){
              return res.status(500).send({
                  message: 'No tienes permiso para actualizar datos'
              })
          }*/

        Alumno.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdate) => {
            if (err) {
                return res.status(500).send({
                    message: 'Error en la peticion'
                });
            }
            if (!userUpdate) {
                return res.status(404).send({
                    message: 'No se ha podido actualizar el usuario'
                });
            }

            userUpdate.password = undefined;
            console.log("userupdate: " + userUpdate);
            return res.status(200).send({
                status: 'sucess',
                user: userUpdate

            })
        });


    },

    updatePassword: (req, res) => {
        var userId = req.params.id;
        var update = req.body;

        try {

            Alumno.findOne({ '_id': req.params.id }, function (err, updateuser) {


                // Si hay errores, se retornan
                if (err) {
                    return done(err);
                } else {


                    var alumno = new Alumno();

                    alumno.nombre = updateuser.nombre;
                    alumno.usuario = updateuser.usuario;
                    alumno.email = updateuser.email;
                    alumno.telefono = updateuser.telefono;
                    alumno.uniDestino = updateuser.uniDestino;
                    alumno.image = updateuser.image;
                    /* alumno.apellido= update.apellido;*/

                    bcrypt.hash(update.password, null, null, (err, hash) => {
                        alumno.password = hash;

                        Alumno.findByIdAndUpdate(req.params.id, { $set: { password: alumno.password } }, { new: true }, function (err, user) {
                            if (err || !user) {
                                return res.status(500).send({
                                    status: 'error',
                                    message: 'El alumno no se ha guardado'
                                });
                            }

                            return res.status(200).send({
                                status: 'sucess',
                                alumno: user
                            });
                        });

                    });
                }

            });



        } catch (e) {
            res.send('error');
        }




    },


    /*--------------------------------*/
    /***** SUBIR AVATAR USUARIO  *****/
    /*--------------------------------*/

    uploadImage: (req, res) => {

        var userId = req.params.id;
        var filename = 'Imagen no subida';
        var alumno = new Alumno();

        console.log(userId);

        if (!req.files) {
            return res.status(404).send({
                status: 'error',
                message: file_name
            });

        }

        /*  if (req.files) {*/
        var file_path = req.files.file0.path;
        console.log(file_path);
        var file_split = file_path.split('\\');
        var file_name = file_split[2];
        console.log(file_name);

        //sacar extensión del archivo para comprobar

        var ext_split = file_name.split('\.');
        var file_ext = ext_split[1];
        console.log(file_ext);

        /* if (userId != req.users.sub) {
             fss.unlink(file_path, (err) => {
                 if (err) {
                     return res.status(200).send({
                         message: 'Usuario no valido para actualizar datos'
                     });
                 }

             });
         }*/

        //comprobar que las extensiones son correctas:
        if (file_ext == 'png' || file_ext == 'jpg' || file_ext == 'jpeg' || file_ext == 'gif') {
            //actualizar imagen de usuario
            Alumno.findOne({ _id: userId }, (err, userUpdate) => {
                if (err) {
                    return res.status(500).send({
                        message: 'Error en la peticion'
                    });
                }
                if (!userUpdate) {
                    return res.status(404).send({
                        message: 'No se ha podido actualizar el usuario'
                    });
                }
                alumno = userUpdate;
                alumno.image = file_name;

                alumno.save((errn, alumnoStored) => {

                    if (errn || !alumnoStored) {
                        return res.status(500).send({
                            status: 'error',
                            message: 'El alumno no se ha guardado'
                        });
                    }

                    alumnoStored.password = undefined;

                    return res.status(200).send({
                        status: 'sucess',
                        alumno: alumnoStored
                    });
                });
                /*userUpdate.password = undefined;
                return res.status(200).send({
                    status: 'sucess',
                    alumno: userUpdate
                })*/

            })
        } else {
            //borrar la imagen
            fss.unlink(file_path, (err) => {
                if (err) {
                    return res.status(200).send({
                        message: 'Extension no valida'
                    });
                }
            });

        }

        /*} else {
            return res.status(200).send({
                message: 'No se han subido imagenes'
            });
        }*/

    },

    deleteImageFile: (req, res) => {
        var userId = req.params.id;
        console.log("Estoy en delete");

        Alumno.findOne({ _id: userId }, (err, user) => {
            if (err) {
                return res.status(500).send({
                    message: 'Error en la petición'
                });
            }
            if (!user) {
                return res.status(404).send({
                    message: 'El usuario no existe'
                });
            }
            console.log(user.image);
            if (user.image != 'user-default.jpg') {
                console.log("entra en eliminar");

                fss.unlink('upload/users/' + user.image, (err) => {
                    if (err) {
                        return res.status(200).send({
                            message: 'Error al borrar la imagen'
                        });
                    }
                });
            }

        })
    },
    /*--------------------------------*/
    /***** DEVOLVER AVATAR USUARIO *****/
    /*--------------------------------*/

    getImageFile: (req, res) => {

        var image_file = req.params.imageFile;
        var path_file = './upload/users/' + image_file;


        fss.exists(path_file, (exists) => {
            if (exists) {

                res.sendFile(path.resolve(path_file));
            } else {
                res.status(200).send({
                    message: 'No existe la imagen'
                });
            }
        });



    },

    /*************  */
    /* SUBIR DOCUMENTO */
    /*************** */

    addDocumentos: (req, res) => {
        var userId = req.params.id;
        var update = req.body;
        var fechanueva = new Date();

        Alumno.findOne({ _id: userId }, (err, user) => {
            if (err) {
                return res.status(500).send({
                    message: 'Error en la petición'
                });
            }
            if (!user) {
                return res.status(404).send({
                    message: 'El usuario no existe'
                });
            }

            console.log(update.nombre);
            user.documentos.push({ nombre: req.body.nombre, estado: req.body.estado });

            user.save(function (err) {
                if (err) {
                    console.log("error");
                } else {
                    console.log('Success!');
                }

            });

        });


    },

    cambiarEstado: (req, res) => {
        var docname = req.params.name;
        var userId = req.params.id;

        console.log("nombre" + docname);
        console.log("estado" + req.body.estado);
        Alumno.updateOne({ _id: userId, "documentos.nombre": docname },
            { $set: { "documentos.$.estado": req.body.estado } }, (err, userUpdate) => {
                if (err) {
                    return res.status(500).send({
                        message: 'Error en la peticion'
                    });
                }
                if (!userUpdate) {
                    return res.status(404).send({
                        message: 'No se ha podido actualizar el usuario'
                    });
                }

                return res.status(200).send({
                    message: 'Sucess',
                    alumno: userUpdate
                });


            })
    },

    getAlumnos: (req, res) => {

        Alumno.find()
            .exec((err, alumno) => {

                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la petición'
                    });
                }

                if (!alumno || alumno.length <= 0) {
                    return res.status(404).send({
                        status: 'error',
                        message: ' no hay documentos que coincidan con tu usuario'
                    });
                }
                console.log('hola');
                return res.status(200).send({

                    status: 'sucess',
                    alumno
                });
            });

    },

    upload: (req, res) => {
        var filename = 'Imagen no subida';
        var docname = req.params.name;
        var userId = req.params.id;


        console.log(docname);
        console.log(userId);
        if (!req.files) {
            return res.status(400).send({
                status: 'error',
                message: filename
            });
        }

        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');

        //  var file_name = file_split[file_split.length-1];
        var file_name = file_split[3];
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];
        console.log("file name: " + file_name);
        if (file_ext == "txt" || file_ext == "doc") {

            tipoDocumento = "word.png";
        } else if (file_ext == "xls" || file_ext == "xlm" || file_ext == "xlt") {

            tipoDocumento = "default.png";
        } else if (file_ext == "pdf") {

            tipoDocumento = "pdf.png";
        } else if (file_ext == "png" || file_ext == "jpg" || file_ext == "jpeg" || file_ext != "gif") {
            tipoDocumento = "imagen";
        }

        console.log("nombre: " + docname);
        Alumno.updateOne({ _id: userId, "documentos.nombre": docname },
            { $set: { "documentos.$.estado": 'En tramite', "documentos.$.tipo": tipoDocumento, "documentos.$.url": file_name, "documentos.$.fecha": new Date() } }, (err, userUpdate) => {
                if (err) {
                    return res.status(500).send({
                        message: 'Error en la peticion'
                    });
                }
                if (!userUpdate) {
                    return res.status(404).send({
                        message: 'No se ha podido actualizar el usuario'
                    });
                }

                return res.status(200).send({
                    message: 'Sucess',
                    userUpdate
                });


            });
    },

    getDocumentos: (req, res) => {

        var userId = req.params.id;
        var documentos;

        Alumno.find({ _id: { $eq: userId }, })
            .exec((err, alumno) => {

                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la petición'
                    });
                }

                if (!alumno || alumno.length <= 0) {
                    return res.status(404).send({
                        status: 'error',
                        message: ' no hay documentos '
                    });
                }

                console.log('hola');
                return res.status(200).send({

                    alumno

                });
            });


    },

    getImage: (req, res) => {
        var file = req.params.image;
        var path_file = './upload/users/documentos/' + file;

        console.log(file)
        fss.exists(path_file, (exists) => {

            if (exists) {
                console.log("existe");
                return res.sendFile(path.resolve(path_file));
            } else {
                return res.status(404).send({
                    status: 'error',
                    message: 'la imagen no existe'
                });

            }
        });



    },

    getProfesores: (req, res) => {

        var userId = req.params.id;

        Alumno.find({ _id: { $eq: userId } })
            .exec((err, users) => {

                if (err) return res.status(500).send({
                    status: 'err',
                    message: "error en la peticion"
                });
                if (users) {
                    return res.status(200).send({

                        users
                    });

                }

            });

    },
    getalumnosdeprofesor: (req, res) => {
        var userId = req.params.id;

        var page= 1;
        if(req.params.pages){
            page=req.params.pages;
        }

        var itemsPerPage= 6;
        console.log("pagina" + page);
        
        Alumno.find({ profesor: { $eq: userId } }).populate('destino', 'pais ciudad carrera').paginate(page, itemsPerPage, (err, users, total) =>{
           
                if (err) return res.status(500).send({
                    status: 'fail',
                    message: 'error en al peticion'
                });
                if (users) {
                    return res.status(200).send({
                        users,
                        total: total,
                        pages: Math.ceil(total/itemsPerPage),
                    });
                }
            });
    },

    getalumnosdecoordinador: (req, res) => {
        var userId = req.params.id;
        console.log("hola busqueda de coordinador");
        console.log(userId);

        var page= 1;
        if(req.params.pages){
            page=req.params.pages;
        }

        var itemsPerPage= 6;

        Alumno.find({ coordinador: { $eq: userId } }).populate('destino', 'pais ciudad carrera').paginate(page, itemsPerPage, (err, users, total) =>{
            
                if (err) return res.status(500).send({
                    status: 'fail',
                    message: 'error en al peticion'
                });
                if (users) {
                    return res.status(200).send({
                        users,
                        total: total,
                        pages: Math.ceil(total/itemsPerPage),
                    });
                }
            });
    },

    /****** SET DESTINOS POR QUE SE HA MODIFICADO */
    setdestinos: (req, res) => {
        var iddestinos = req.params.iddestino;
        var update = req.body;

        Alumno.updateMany({ destino: iddestinos }, { profesor: update.profesor })
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
    setcoordinador:(req, res) =>{
        var id = req.params.id;
       

        Alumno.updateMany({ coordinador: id })
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

    /**** DAR DE BAJA */
    dardebaja:(req,res) =>{
        var userId=req.params.id;

        console.log("userId" + userId);
        Alumno.findByIdAndDelete(userId)
            .exec((err) =>{
                if(err){
                    return res.status(500).send({
                        message:'Error en la peticion'
                    });
                }
                

                return res.status(200).send({
                    status: 'sucess',
                    navigate:true
                  
                });
            })

    }


};

module.exports = controllers;
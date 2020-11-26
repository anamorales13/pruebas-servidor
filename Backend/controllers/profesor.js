
var validator = require('validator');
var Profesor = require('../models/profesor');
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


        //1.- validar los datos
        try {

            var validate_nombre = !validator.isEmpty(params.nombre);
            var validate_usuario = !validator.isEmpty(params.usuario);
            var validate_password = !validator.isEmpty(params.password);
            var validate_email = !validator.isEmpty(params.email);
            var validate_telefono = !validator.isEmpty(params.telefono);
            var validate_despacho = !validator.isEmpty(params.despacho);
            var validate_apellido1 = !validator.isEmpty(params.apellido1);
            var validate_apellido2 = !validator.isEmpty(params.apellido2);
            var validate_edificio = !validator.isEmpty(params.edificio);
            var validate_tutoria=!validator.isEmpty(params.tutoria);


        } catch (err) {
            return res.status(200).send({
                status: 'error',
                message: 'Faltan datos por enviar'
            });
        }


        if (validate_nombre && validate_apellido1 && validate_apellido2 && validate_usuario && validate_password && validate_email && validate_edificio && validate_telefono && validate_despacho && validate_tutoria) {

            // 2- Crear el objeto a guardar
            var profesor = new Profesor();

            // 3- Asignar valores
            profesor.nombre = params.nombre;
            profesor.usuario = params.usuario;
            profesor.password = params.password;
            profesor.email = params.email;

            profesor.apellido1 = params.apellido1;
            profesor.apellido2 = params.apellido2;
            profesor.telefono = params.telefono;
            profesor.despacho = params.despacho;
            profesor.image = 'user-default.jpg';
            profesor.edificio = params.edificio;
            profesor.tipo = 'profesor';
            profesor.rol = 'coordinador_de_destino';
            profesor.tutoria=params.tutoria;

            if (params.datos) {
                profesor.datos = params.datos;
            }


            // CONTROLAR DUPLICADOS 

            Profesor.find({
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
                            profesor.password = hash;

                            // 4 - Guardar el objeto

                            profesor.save((errn, profesorStored) => {

                                if (errn || !profesorStored) {
                                    return res.status(500).send({
                                        status: 'error',
                                        message: 'El alumno no se ha guardado'
                                    });
                                }

                                return res.status(200).send({
                                    status: 'sucess',
                                    profesor: profesorStored
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
    comparePassword: (req, res) => {

        var userId = req.params.id;
        var params = req.body;


        passwString = params.password;

        console.log("hola");
        Profesor.findById(userId, (err, userget) => {
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
    updatePassword: (req, res) => {
        var userId = req.params.id;
        var update = req.body;

        try {

            Profesor.findOne({ '_id': req.params.id }, function (err, updateuser) {


                // Si hay errores, se retornan
                if (err) {
                    return done(err);
                } else {


                    var profesor = new Profesor();

                    profesor.nombre = updateuser.nombre;
                    profesor.usuario = updateuser.usuario;
                    profesor.email = updateuser.email;
                    profesor.telefono = updateuser.telefono;
                    profesor.uniDestino = updateuser.uniDestino;
                    profesor.image = updateuser.image;
                    /* alumno.apellido= update.apellido;*/

                    bcrypt.hash(update.password, null, null, (err, hash) => {
                        profesor.password = hash;

                        Profesor.findByIdAndUpdate(req.params.id, { $set: { password: profesor.password } }, { new: true }, function (err, user) {
                            if (err || !user) {
                                return res.status(500).send({
                                    status: 'error',
                                    message: 'El alumno no se ha guardado'
                                });
                            }

                            return res.status(200).send({
                                status: 'sucess',
                                profesor: user
                            });
                        });

                    });
                }

            });



        } catch (e) {
            res.send('error');
        }




    },


    setprofesor: (req, res) => {
        var userId = req.params.id;
        var update = req.body;

        //borrar propiedad password
        delete update.password;

        /*  if(userId != req.users.sub){
              return res.status(500).send({
                  message: 'No tienes permiso para actualizar datos'
              })
          }*/

        console.log("hola");
        console.log(userId);
        console.log(update);

        Profesor.findByIdAndUpdate(userId, update, { new: true }, (err, userUpdate) => {
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
    deleteImageFile: (req, res) => {
        var userId = req.params.id;
        console.log("Estoy en delete");

        Profesor.findOne({ _id: userId }, (err, user) => {
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
    /***** SUBIR AVATAR USUARIO  *****/
    /*--------------------------------*/

    uploadImage: (req, res) => {

        var userId = req.params.id;
        var filename = 'Imagen no subida';
        var profesor = new Profesor();

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
            Profesor.findOne({ _id: userId }, (err, userUpdate) => {
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
                profesor = userUpdate;
                profesor.image = file_name;

                profesor.save((errn, alumnoStored) => {

                    if (errn || !alumnoStored) {
                        return res.status(500).send({
                            status: 'error',
                            message: 'El alumno no se ha guardado'
                        });
                    }

                    alumnoStored.password = undefined;

                    return res.status(200).send({
                        status: 'sucess',
                        profesor: alumnoStored
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

    /*--------------------------------*/
    /*****     LOGIN UN  USER      **** */
    /*--------------------------------*/

    loginUser: (req, res) => {

        var params = req.body;

        userString = params.usuario;
        passwString = params.password;
        console.log(userString);
        console.log(passwString);

        Profesor.findOne({ usuario: { $eq: userString } })
            .exec((err, users) => {

                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: "Error en la petición"
                    });
                }
                if (users) {
                    console.log("hay usuario");

                    bcrypt.compare(passwString, users.password, (err, check) => {
                        if (check) {
                            // if(params.gettoken){
                            //generar y devolver el token
                            users.password = undefined;
                            users.alumnos = undefined;
                            console.log("hay password");
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
                            return res.status(404).send({
                                status: 'error',
                                message: 'El usuario no ha introducido los datos correstamente'
                            });
                        }
                    })
                } else {
                    return res.status(404).send({
                        status: 'error',
                        message: 'El usuario no ha introducido los datos correstamente'
                    });
                }
            })
    },
    loginUserAdmin: (req, res) => {
        var params = req.body;
        var administrador = "administrador";

        userString = params.usuario;
        passwString = params.password;


        Profesor.findOne({ usuario: { $eq: userString }, tipo: { $eq: administrador } })
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
                            users.alumnos = undefined;
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
                            return res.status(404).send({
                                status: 'error',
                                message: 'El usuario no ha introducido los datos correstamente'
                            });
                        }
                    })
                } else {
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
        Profesor.findById(userId, (err, userget) => {
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

    getProfesores: (req, res) => {

        var profesor = "profesor";
        Profesor.find({ tipo: { $eq: profesor } })
            .exec((err, profesor) => {

                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error en la petición'
                    });
                }

                if (!profesor || profesor.length <= 0) {
                    return res.status(404).send({
                        status: 'error',
                        message: ' no hay documentos que coincidan con tu usuario'
                    });
                }
                console.log('hola');
                return res.status(200).send({

                    status: 'sucess',
                    profesor
                });
            });
    },
    getcoordinador_de_centro: (req, res) => {

        var profesor = "coordinador_de_centro";

        Profesor.findOne({ rol: profesor }, (err, profesor) => {
            if (err) {
                return res.status(500).send({
                    message: 'Error en la petición'
                });
            }
            if (!profesor) {
                return res.status(404).send({
                    message: 'El usuario no existe'
                });
            }
            profesor.password = undefined;
            return res.status(200).send({
                status: 'sucess',
                profesor: profesor
            })

        });



    },
    updatecoordinador: (req, res) => {
        var update = req.body;
        var cord = "coordinador_de_centro";
        var nocord = "coordinador_de_destino";

        console.log(update.profesor);
        console.log(update.coordinador);
        //cambiar de coordinador de destino a coordinador de centro
        Profesor.findByIdAndUpdate(update.profesor, { $set: { rol: cord } }, { new: true }, function (err, user) {
            if (err) {
                return res.status(500).send({
                    message: 'Error en la peticion'
                });
            }
            if (!user) {
                return res.status(404).send({
                    message: 'No se ha podido actualizar el usuario'
                });
            }
            Profesor.findByIdAndUpdate(update.coordinador, { $set: { rol: nocord } }, { new: true }, function (err, user) {
                if (err) {
                    return res.status(500).send({
                        message: 'Error en la peticion'
                    });
                }
                if (!user) {
                    return res.status(404).send({
                        message: 'No se ha podido actualizar el usuario'
                    });
                }
                return res.status(200).send({
                    status: 'sucess',


                })
            });
        });

        //cambiar de coordinador de centro a coordinador de destino

    },


    /* setAlumno: (req, res) => {
         var update = req.body;
         var userId = req.params.id;
         console.log("update" + update.alumno);
         console.log("userId" + userId);
 
         Profesor.findOne({ _id: userId }, (err, user) => {
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
 
 
             user.alumnos.push({ _id: update.alumno });
             user.save(function (err) {
                 if (err) {
                     console.log("error");
                 } else {
                     console.log('Success!');
                 }
 
             });
 
         });
     },
 */
    getprofesor: (req, res) => {

        var userId = req.params.id;


        Profesor.findById(userId)
            .exec((err, userget) => {
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
                    userget
                });
            })

    },

    getAlumnos: (req, res) => {
        var userId = req.params.id;

        Profesor.findById(userId).populate('alumnos', 'nombre apellido1 apellido2 image email')
            .exec((err, userget) => {
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

    /******** DAR DE BAJA */
    dardebaja: (req, res) => {
        var userId = req.params.id;

        console.log("eliminar profesor" + userId);
        Profesor.findByIdAndDelete(userId)
            .exec((err) => {
                if (err) {
                    return res.status(500).send({
                        message: 'Error en la peticion'
                    });
                }
                console.log("sucess eliminar");

                return res.status(200).send({
                    status: 'sucess',

                });
            })

    }
}

module.exports = controllers;
'use strict'

var express= require('express');
var AlumnoController= require('../controllers/alumno');


var router = express.Router(); //disponible el router
var md_auth= require('../Middleware/authenticated');

var multipart= require('connect-multiparty');
var md_uploadd= multipart({uploadDir: './upload/users'});
var md_uploaddoc= multipart({uploadDir: './upload/users/documentos'});


//RUTAS VALIDAS
router.get('/pruebas', md_auth.ensureAuth, AlumnoController.pruebas);
router.post('/save', AlumnoController.save);
router.post('/login' , AlumnoController.loginUser);
router.get('/user/:id', /*md_auth.ensureAuth,*/ AlumnoController.getUser);



router.put('/update-user/:id' , /*md_auth.ensureAuth,*/ AlumnoController.updateUser);
router.put('/update-password/:id', AlumnoController.updatePassword);
router.post('/upload-image-user/:id',/* [md_auth.ensureAuth,*/ md_uploadd, AlumnoController.uploadImage );
router.get('/get-image-user/:imageFile', AlumnoController.getImageFile );
router.delete('/delete-image/:id',md_uploadd, AlumnoController.deleteImageFile);
router.post('/compararPassword/:id', AlumnoController.comparePassword);
router.post('/documentos/:id', AlumnoController.addDocumentos);
router.put('/cambioEstado/:id/:name', AlumnoController.cambiarEstado);
router.put('/upload-image/:id/:name', md_uploaddoc, AlumnoController.upload);
router.get('/profesores/:id', AlumnoController.getProfesores);
router.put('/savedestino/:id', AlumnoController.guardarDestino);
router.put('/saveprofesor/:id', AlumnoController.guardarProfesorCoordinador);

router.get('/get-alumnos-profesor/:id/:pages?', AlumnoController.getalumnosdeprofesor);
router.get('/coordinador/:id/:pages?', AlumnoController.getalumnosdecoordinador);
router.get('/alumnos', AlumnoController.getAlumnos);
router.put('/setdestino/:iddestino', AlumnoController.setdestinos);
router.put('/setcoordinador/:id', AlumnoController.setcoordinador);
/* dar de baja*/
router.delete('/dardebaja/:id', AlumnoController.dardebaja);

router.get('/get-image/:image', AlumnoController.getImage);

router.get('/getdocumentos/:id', AlumnoController.getDocumentos);







module.exports= router;
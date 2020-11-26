
/*conexion a la base de datos
y crearemos el servidor*/

'use strict' 

var mongoose = require('mongoose');
//cargar archivo app
var app= require('./app');
var port= process.env.PORT || 3900;//variable puerto. El que queremos utilizar


mongoose.set('useFindAndModify', false); 
mongoose.Promise= global.Promise;

mongoose.connect('mongodb+srv://anamorales13:vBac1UreWvszfgNe@plataforma.2cxua.mongodb.net/test?retryWrites=true&w=majority',{ useUnifiedTopology: true, useNewUrlParser: true})
    .then(() => {
        console.log("La conexión a la BD se ha realizado con exito!");


        //Creación del servidor y ponerme a escuchar peticiones http
      /*  app.listen(port, ()=> {
                ejecuta lo que quieres hacer
        });*/

        app.listen(port, ()=> {
            console.log('servidor corriendo en' +port);

        });
});


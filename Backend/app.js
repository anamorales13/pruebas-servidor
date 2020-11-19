'use strict'


// 1-  Cargar modulos de node para crear servidor
var express= require('express'); //el que crea el servidor.
var bodyParser= require('body-parser')  //recibir las peticiones



// 2- Ejecutar express (para poder trabajar con http)
var app= express(); //esto va a ser la app en si, es lo que 
                    // luego exportaremos.

// 3- Cargar ficheros rutas


var alumno_routes= require('./routes/usuarios');


//var documento_routes=require('./routes/documento');

// 4- cargar middlewares: siempre se ejecuta antes de 
//                     cargar una ruta de la web.

app.use(bodyParser.urlencoded({extended:false}))//cargar el bodyparser
app.use(bodyParser.json()); //convertir cualquier peticion que me llege a json.


// 5 -CORS : permitir peticiones desde front-end

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});



// 6 -añadir prefijos a rutas / Cargar rutas

 app.use('/api', alumno_routes);
 
 
 
 //app.use('/apiErasmusDoc', documento_routes);


 //ruta de prueba

 app.get('/probando', (req,res)=>{
     return res.status(200).send(`
    <ul>
        <li>Node</li>
    </ul>
 `)

 });

// 7 -Exportar modulo (que es el fichero actual): para poder usarlo fuera.
module.exports = app;

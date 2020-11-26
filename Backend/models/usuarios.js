'use strict'

var mongoose= require('mongoose');
var Schema = mongoose.Schema;

var UsuarioSchema=Schema ({   /*definimos la estructura del modelo*/
/*que va a tener un articulo?*/

    nombre: String, 
    contraseña: String, 
    correo:String, //se guarda por defecto: la fecha actual
    image: String

});

//module.exports= mongoose.model(<nombre_del_modelo>, <esquema del modelo>);
module.exports= mongoose.model('Usuario', UsuarioSchema);


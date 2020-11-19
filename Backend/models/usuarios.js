'use strict'

var mongoose= require('mongoose');
var Schema = mongoose.Schema;





var UsuarioSchema=Schema ({   

    nombre: String,
    contraseña:String,
    correo: String,

   
  
   

});



module.exports= mongoose.model('Usuario', UsuarioSchema);

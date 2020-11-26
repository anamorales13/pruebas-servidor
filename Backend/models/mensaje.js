
'use strict'

var mongoose = require('mongoose');
var Schema= mongoose.Schema;

var MensajeSchema= Schema({
    texto: String,
    visto: String,
    asunto: String,
    emisor: {
        alumno:{
            type: Schema.ObjectId, ref: 'Alumno',
        },
        profesor:{
            type: Schema.ObjectId, ref: 'Profesor'
        }
    },
    receptor: {
        alumno:{
            type: Schema.ObjectId, ref: 'Alumno',
        },
        profesor:{
            type: Schema.ObjectId, ref: 'Profesor'
        }
    },  
    fecha: {type:Date, default: Date.now},
}) ;

module.exports= mongoose.model('Mensaje', MensajeSchema);



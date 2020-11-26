
'use strict'

var mongoose= require('mongoose');
var Schema = mongoose.Schema;



const DocumentosSchema = Schema({
    //_alumno: {type:Number, ref: 'Alumno'},
    title:String,
    url: String,
    tipoDocumento:String,
    date: {type:Date, default: Date.now},
    descripcion:String,
    /*link:String,*/
    /*alumno: {
       type: Schema.Types.ObjectId,
       ref: "Alumno"
    }*/
    propietario:String,
    alumno: {type: Schema.ObjectId, ref: 'Alumno'},
    profesor: {type: Schema.ObjectId, ref: 'Profesor'},
    tipo_nube:String
 });


 module.exports= mongoose.model('Documentos', DocumentosSchema);
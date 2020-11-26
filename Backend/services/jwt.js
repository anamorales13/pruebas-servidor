'use strict'

var jwt=require('jwt-simple');
var moment=require('moment');
var secret ='156450joluddmksiad88715';

exports.createToken =function(user){
    var payload= {
        sub: user._id,
        name: user.nombre,
        usuario: user.usuario,
        email: user.email,
        telefono:user.telefono,
        iat: moment().unix(), //fecha de creación del token
        exp: moment().add(30, 'days').unix //fecha de expiración.


    };

    return jwt.encode(payload, secret);  
}
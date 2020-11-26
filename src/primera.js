import React, { Component } from 'react';

import axios from 'axios';


class primera extends Component {

    state = {
        nombre: "",
        usuario: {}
    }

   
    componentWillMount(){
        this.getuser();
    }

   
    getuser =()=>{
        axios.get('http://localhost:3900/apiProfesor/profesor/5f91925147ec0529ec70dbb9')
            .then(res=>{
                this.setState({
                    usuario: res.data.userget
                })
            })
    }



    render() {
        return (
            <div>
               
               
                    <div>
                        <label>Name: {this.state.usuario.nombre}</label>
                        <label>correo: {this.state.usuario.email}</label>
                    </div>

                   
                

            </div>

        );
    }
}

export default primera;
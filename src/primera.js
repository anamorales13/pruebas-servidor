import React, { Component } from 'react';

import axios from 'axios';


class primera extends Component {

    state = {
        nombre: "",
        usuario: {}
    }

    handleChange = input => e => {
        console.log("cambio")
        this.setState({ [input]: e.target.value });


    }

    componentWillMount(){
        this.getuser();
    }

    getuser() {
        console.log(this.state.nombre);
        axios.get('http://localhost:3900/api/user/Ana')
            .then(res => {
                this.setState({
                    usuario: res.data.users

                });

            })

    }



    render() {
        return (
            <div>
               

                
                    <div>
                        <label>Name: {this.state.usuario.nombre}</label>
                        <label>correo: {this.state.usuario.correo}</label>
                    </div>
                

            </div>

        );
    }
}

export default primera;
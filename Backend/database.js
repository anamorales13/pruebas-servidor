const mongoose = require('mongoose');
const connection = "mongodb+srv://anamorales13:vBac1UreWvszfgNe@plataforma/test?retryWrites=true&w=majority";
mongoose.connect(connection,{ useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
    .then(() => console.log("Database Connected Successfully"))
    .catch(err => console.log(err));
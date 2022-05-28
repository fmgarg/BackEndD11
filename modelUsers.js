const mongoose = require ('mongoose');
const bcrypt = require("bcrypt-nodejs");

const userSchema = new mongoose.Schema({
    username: {type: String, require: true, max: 100, unique: true}, 
    password: {type: String, require: true, max:8}, 
    nombre: {type: String, require: true, max: 100},
    apellido: {type: String, require: true, max: 100},
    dni: {type: String, require: true, max: 100},
    calle: {type: String, require: true, max: 100},
    altura: {type: String, require: true, max: 100},
    pisoDpto: {type: String, require: true, max: 100},
    localidad: {type: String, require: true, max: 100},
    cp: {type: String, require: true, max: 100},
    provincia: {type: String, require: true, max: 100},
    telefono: {type: String, require: true, max: 100}
})

userSchema.methods.encryptPassword = (password) => {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10),null);
}

userSchema.methods.comparePassword = function (password) {
    return bcrypt.compareSync(password, this.password)
}

module.exports = mongoose.model('user', userSchema) 
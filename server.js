const express = require('express')
const PORT = 8080
const { Server: IOServer } = require('socket.io')
const { Server: HttpServer } = require('http')

const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)

const cookieParser = require('cookie-parser')
const session = require('express-session')
const connectMongo = require ('connect-mongo')
const advanceOptions = {useNewUrlParser: true, useUnifiedTopology: true}
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require("bcrypt-nodejs");
const flash = require('connect-flash')

app.use(express.static('./public'))

httpServer.listen(8080, () =>{ getAll(); console.log('servidor levantado puerto: 8080')})

//-------BDD-ECOMMERCE--MONGO--ATLAS------------------

const mongoose = require ('mongoose')

const User = require ('./modelUsers')

CRUD()

async function CRUD() {
 try{ 
      const DB = 'ecommerce'
      const URL = `mongodb+srv://ex888gof:2013facu@cluster0.mnmsh.mongodb.net/${DB}?retryWrites=true&w=majority`
      
      let respueta = await mongoose.connect (
              URL
              ,{
                useNewUrlParser: true
               ,useUnifiedTopology: true
              })
              console.log('Base de datos conectada')
              /*,await User.create({
                                username: 'FMG@gmail.com',
                                password: '123456',
                                nombre: 'Francisco',
                                apellido: 'Gonzalez',
                                dni: '28888888',
                                calle: 'Las rosas',
                                altura: '3333',
                                pisoDpto:'-',
                                localidad: 'Las flores',
                                cp:'1000',
                                provincia: 'Aca',
                                telefono: '1140003000'
              })*/
              //,console.log( await User.find())
              //,console.log( modelUsers.estimatedDocumentCount())
  } catch (e) {
    console.log(e)
  }
 }

//-----------FIN BDD MONGOOSE-----------------

/*
//metodo para enviar y recibir peticiones json
const router = express.Router()
*/

//usar app delante de use hace que sea general y que toda la app pueda procesar JSON y siempre debe ir antes del router con la peticion**
app.use(express.urlencoded({ extended: true}))
app.use(express.json())

//-------importando el modulo Router---------------
const productosRouter = require ('./routes/productosRouter')

//----------importacion del arreglo de productos-------------
const productos = require ('./routes/productosRouter') ['productos']
//console.log(eventos)


//------------------------------HANDLEBARS-----------------------//
const handlebars = require('express-handlebars')
const { INSPECT_MAX_BYTES } = require('buffer')
const { timeStamp } = require('console')

app.engine(
    '.hbs',
    handlebars.engine({
              extname: '.hbs',
              defaultLayout: 'main.hbs',
              layoutsDir: './views/layouts'
    })
  )
  
app.set('view engine', '.hbs')
app.set('views', './views')

//---------------------------------SOCKETS-----------------------//
const fs = require('fs');
const { response } = require('express')

const userAdmin = []
let messages = []

io.on('connection', (socket) => {
      console.log('socket connection')
      socket.emit('socketUser', userAdmin)
      socket.emit('messages', messages)
      socket.emit('socketProductos', productos)
      socket.on('notificacion', (data) => {
                console.log(data)
      
                })

      socket.on('new-message', async (mensaje) => { 
        //---aca recibo el mensaje nuevo de addMessage/socket.emit y lo inserto en la BDD
                  const {optionsMSG} = require ('./optionsMSG/sqLite3') 
                  const knexMSG = require ('knex') (optionsMSG);
                  let insertNewMSGonBDD = await knexMSG('MSG')
                                                .insert(mensaje)
                                                .then(() => {
                                                  console.log('newMessage insert')
                                                })
                                                .catch((err) => {
                                                  console.log(err)
                                                  throw err
                                                })
                                                .finally(() => {
                                                  knexMSG.destroy()
                                                })
                
                await messages.push(mensaje)
                io.sockets.emit('messages', messages)
      })

      socket.on('nuevo-producto', (newProduct) => {
        //---aca recibo el product nuevo de addProduct/socket.emit y lo inserto en la BDD
                productos.push(newProduct)
                io.sockets.emit('socketProductos', productos)
                }
      )

})

//---------------------------------SQLite3----------------------------------------//

const {optionsMSG} = require ('./optionsMSG/sqLite3') 
const { MemoryStore } = require('express-session')
const { isNullOrUndefined } = require('util')
const { CONNREFUSED } = require('dns')
//const { createHash } = require('crypto')
const knexMSG = require ('knex') (optionsMSG);

//----------------esta funcion crea la tabla de mensajes sqLite3------------------

const crearTabla = () =>{ 
  const { createTableMSG } = require('./optionsMSG/createTableMSG')
}

//crearTabla ()


//--------esta funcion devuelve todos los mensajes de la tabla mensajes-----------

async function getAll (){ 
  
  await knexMSG
    .from('MSG')
    .select('*')
    .then((rows) => {                
            messages = rows.map(mensaje => {return mensaje})            
            return messages
            })
    .catch((err) => {
      console.log(err)
    })
    .finally(() => {
      knexMSG.destroy()
    })

}

//--------------------------LOGIN--CON---SESSION y PASSPORT---------------------------//
app.use(cookieParser())

//----METODO DE SAVE SESSION a nivel de la aplicacion y TIEMPO (ttl)/ cookie maxAge
app.use(
  session({
    /*store: connectMongo.create ({
          mongoUrl: 'mongodb+srv://ex888gof:2013facu@cluster0.mnmsh.mongodb.net/ecommerce?retryWrites=true&w=majority'
          ,ttl: 600
          ,autoRemove: 'disabled'
          ,mongoOptions: advanceOptions
    })*/
    secret: 'secreto'
    ,resave: true
    ,saveUninitialized: true
    ,cookie: { maxAge: 600000 }
  })
)

//----PASSPORT---------------------------------

/*const usuarios = [
  { nombre: 'Hector', password: 'asd' },
  { nombre: 'mario', password: 'asd1' },
  { nombre: 'Marta', password: 'asd2' },
]*/

app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

passport.use('login'
             ,new LocalStrategy({
              usernameField: 'username',
              passwordField: 'password',
              passReqToCallback: true
              },
                    async  (req, username, password, done) => {
                            console.log('entro a signin/ login')

                            const userExist = await User.findOne({username: username})

                            if(!userExist){
                              return done(null, false, req.flash('signinMessage', 'No se ubica el Usuario'))
                            }
                            if(!userExist.comparePassword(password)){
                              return done(null, false, req.flash('signinMessage', 'Password incorrecta'))
                            }
                            done(null, userExist)
                    }
             )

)

passport.use('register',  new LocalStrategy({ //---FALTA EL MANEJO DE ERRORES Y DUPLICADOS!!!----//
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
   },
          async  (req, username, password, done) => {
                  console.log('entro a signup/ register')

                  const userExist = await User.findOne({username: username})

                  if(userExist){
                    return done(null, false, req.flash('signupMessage', 'El usuario ya existe')) //01:31 agregar ruta que captura msgs con var global y luego if al login.hbs
                  }else{

                  const newUser = new User ()
                  newUser.username= username,
                  newUser.password= encryptPassword(password),
                  newUser.nombre= req.body.nombre,
                  newUser.apellido= req.body.apellido,
                  newUser.dni= req.body.dni,
                  newUser.calle= req.body.calle,
                  newUser.altura= req.body.altura,
                  newUser.pisoDpto= req.body.pisoDpto,
                  newUser.localidad= req.body.localidad,
                  newUser.cp= req.body.cp,
                  newUser.provincia= req.body.provincia,
                  newUser.telefono= req.body.telefono

                  await newUser.save()
                  done(null, newUser)
                  }
          }
)
)

/*function encryptPassword (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10),null);
}*/

/*function createHash(password) {
  return bcrypt.hashSync(
                password,
                bcrypt.genSaltSync(10),
                null
  );
}*/

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  const user = await User.findById (id)
  done(null, user)
})

//---------------RUTAS -------------------------
app.get('/login', (req, res, next) => {
  req.logOut(function(err){
    if (err) {return next (err);}
    res.render('login')
  })
  //res.render('login')
})

app.post('/login'
                ,passport.authenticate('login', {
                  
                  successRedirect: '/home',
                  failureRedirect: '/login-error',
                  
                })
                /*,async (req, res) => {
                  const {user} = req.body
                  if (!user) {
                      return res.redirect('/')
                  }
                      req.session.user = user
                      const userLogin = {user:{}}
                      userLogin['user']= user
                      userAdmin.push(userLogin)
                      res.redirect('/home')
                }*/
)

app.get('/register', (req, res) => {
  res.render('register')
})

app.get('/login-error', (req, res)=>{
  res.render('login-error')
}
)
app.post(
  '/register',
  passport.authenticate('register', {
    successRedirect: '/login',
    failureRedirect: '/login-error',
    passReqToCallback: true
  })
)

app.use('/home'
              ,async function (req, res, next) {
                
                if (req.session.passport==undefined)
                {
                  
                  res.redirect('/login')
                
                } else {
                  

                  const id = req.session.passport['user']
                  //console.log(id)
                  const user = await User.findById (id)
                  
                  console.log(user)
                    
                  const userLogin = {user:{}}
                  userLogin['user']= user.nombre
                  userAdmin.push(userLogin)
                  next ()
                
                }
              }
              ,productosRouter
)

//----METODO LOGOUT que destruye la sesion--------
app.get('/logout', (req, res, next) => {

    req.logOut(function(err){
      if (err) {return next (err);}
      res.redirect('/login')
    })

    /*req.session.destroy((err) => {
    if (!err) {
              res.redirect('logout.html')
    }else{ 
              res.send({ status: 'logout Error', error: err })
    }
    })*/
})

//-----METODO para ver las cookies-----------------
app.get('/cookies', (req, res) =>{
  res.send(req.cookies)
})


//----------------FIN SESSION---------------------------------------------

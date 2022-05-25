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
const bcrypt = require("bcrypt");

app.use(express.static('./public'))

httpServer.listen(8080, () =>{ getAll(); console.log('servidor levantado puerto: 8080')})

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
          mongoUrl: 'mongodb+srv://ex888gof:2013facu@cluster0.mnmsh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
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

const usuarios = [
  { nombre: 'Hector', password: 'asd' },
  { nombre: 'mario', password: 'asd1' },
  { nombre: 'Marta', password: 'asd2' },
]

app.use(passport.initialize())
app.use(passport.session())

passport.use(
            'register',
            new LocalStrategy(
                      { passReqToCallback: true },
                      (req, username, password, done) => {
                            console.log('entro signup')
                            const existe = usuarios.find((usuario) => {
                              return usuario.nombre == username
                            })
                            if (existe) {
                              return done(null, false)
                            } else {
                              usuarios.push({ nombre: username, password: password })
                              console.log(usuarios)
                              done(null, { nombre: username })
                            }
                      }
            )
)
passport.use(
            'login'
            ,new LocalStrategy((username, password, done) => {
              console.log('entro')
              const existe = usuarios.find((usuario) => {
                return usuario.nombre == username && usuario.password == password
              })
              console.log(existe)
              if (!existe) {
                return done(null, false)
              } else {
                //console.log(existe)
                return done(null, existe)
              }
              //if (username == 'hector') return done(null, { id: 1, name: 'Hector' })
            })
)

passport.serializeUser((usuario, done) => {
  console.log(usuario.nombre + 'serializado')
  done(null, usuario.nombre)
})

passport.deserializeUser((nombre, done) => {
  const usuarioDz = usuarios.find((usuario) => usuario.nombre == nombre)
  console.log(JSON.stringify(usuarioDz) + 'desserializado')
  done(null, usuarioDz)
})

//---------------RUTAS -------------------------
app.get('/login', (req, res, next) => {
  req.logOut(function(err){
    if (err) {return next (err);}
    res.render('login')
  })
  res.render('login')
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

app.post(
  '/register',
  passport.authenticate('register', {
    successRedirect: '/login',
    failureRedirect: '/login-error',
  })
)

app.use('/home'
              ,function (req, res, next) {
                console.log(req.session.passport['user'])
                user = req.session.passport['user']
                console.log(user)
                
                const userLogin = {user:{}}
                userLogin['user']= user
                userAdmin.push(userLogin)
                if (!req.session.passport['user']){
                  //console.log('aca paso algo')  
                  res.redirect('/login')
                } else {
                    next ()
                  }
              }
              ,productosRouter
)

//----METODO LOGOUT que destruye la sesion--------
app.get('/logout', (req, res, next) => {

    console.log(req.sesssion)
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

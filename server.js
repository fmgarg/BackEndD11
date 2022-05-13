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
    'hbs',
    handlebars({
              extname: '.hbs',
              defaultLayout: 'index.hbs'
    })
  )
  
app.set('view engine', 'hbs')
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

//--------------------------LOGIN--CON---SESSION ---------------------------//

//----METODO DE SAVE SESSION a nivel de la aplicacion y TIEMPO (ttl)/ cookie maxAge
app.use(
  session({
    store: connectMongo.create ({
          mongoUrl: 'mongodb+srv://ex888gof:2013facu@cluster0.mnmsh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
          ,ttl: 600
          ,autoRemove: 'disabled'
          ,mongoOptions: advanceOptions
    })
    ,secret: 'secreto'
    ,resave: true
    ,saveUninitialized: true
    ,cookie: { maxAge: 600000 }
  })
)

//----METODO DE LOGIN -------------------------

app.use(cookieParser())

app.post('/login'
                ,async (req, res) => {
                  const {user} = req.body
                  if (!user) {
                      return res.redirect('/')
                  }
                      req.session.user = user
                      const userLogin = {user:{}}
                      userLogin['user']= user
                      userAdmin.push(userLogin)
                      res.redirect('/home')
                }
)

app.use('/home'
              ,function (req, res, next) {
                if (!req.session.user){
                    res.redirect('/')
                } else {
                    next ()
                  }
              }
              ,productosRouter
)

//----METODO LOGOUT que destruye la sesion--------
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (!err) {
              res.redirect('logout.html')
    }else{ 
              res.send({ status: 'logout Error', error: err })
    }
  })
})

//-----METODO para ver las cookies-----------------
app.get('/cookies', (req, res) =>{
  res.send(req.cookies)
})


//----------------FIN SESSION---------------------------------------------

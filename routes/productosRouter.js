const express = require ('express')

const req = require('express/lib/request')
const { redirect } = require('express/lib/response')

const productosRouter = express.Router ()

//let Contenedor = require('../components/contenedor')

let productos = [{"title":"tijera","price":"100","src":"https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg","id":1}
            //    ,{"title":"cartuchera","price":"200","src":"https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg","id":2}
              //  ,{"title":"mochila","price":"10000","src":"https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg","id":3}
            ]


const newObjeto = {
    "title":"Pez Globo",                                                                                                                          
    "price": 345.67,                                                                                                                                     
    "thumbnail":"https://cdn3.iconfinder.com/data/icons/education-209/64/globe-earth-geograhy-planet-school-256.png"                                   
}

class Contenedor {
       
    constructor ( productos, newObjeto){
        this.listaProductos = productos
        this.objeto = newObjeto
        };

    async getAll() {
            try {

                if (this.listaProductos !== []) {
                    //console.log(productosParse)
                    return productos;
                } else {
                    throw 'no hay productos para mostrar'
                }

            } catch (error) {
                console.log(`Error: ${error}`);
            }
        }

    async save(producto) {
        try {
            producto ["id"] = productos.length + 1
            //console.log(producto)
            productos.push(producto)
            //console.log(`el nuevo objeto fue guardado con el id ${producto.id}`)
        }
        catch (err) {
            console.log('no se pudo agregar');
        }
    }

    async getByID(ID) {
        try {
            let products = await items.getAll()
            //console.log(products)
            let buscarProductoXId = products.find(elem => elem.id == ID);
            //console.log(buscarProductoXId)
            if (buscarProductoXId == null){                
                console.log('el producto no existe');
            }else{
                //console.log(buscarProductoXId);
                return (buscarProductoXId)
            }
        } catch (error) {
            console.error(`Error: ${error}`);
        }
    }

    async deleteByID(ID) {
        try {
            let products = await items.getAll()
            //console.log(products)
            const eliminado = products.filter ((item) => item.id == ID);
            //console.log(eliminado)
            if (eliminado.length === 0) { 
                console.log('el producto no existe')
            }else{
                const resultado = productos.filter ((item) => item.id !== ID)
                       // console.log('producto eliminado')
                        const producto = await items.getByID (ID)
                        const index = products.indexOf(producto)
                        productos.splice (index, 1)
                 return resultado
            }
        } catch (error) {
            console.error(`Error: ${error}`);
        }
    }

    async putByID(ID, newPrice) {
        try {
            let products = await items.getAll()
            //console.log(products)
            const encontrado = products.filter ((item) => item.id == ID);
            //console.log(encontrado)
            if (encontrado.length === 0) { 
                console.log('el producto no existe')
            }else{
                const respuesta = {}
                //console.log(respuesta)
                respuesta.anterior = encontrado
                //console.log(respuesta.anterior)
                
                //const indexElem = encontrado.findIndex(elem => elem === "price")
                //console.log (indexElem)
                let newProp = newPrice['price']
                //console.log(newProp)

                respuesta.actualizada = newPrice
                //console.log(respuesta.actualizada)

                const producto = await items.getByID (ID)
                const indexObjeto = products.indexOf(producto)
                productos.splice(indexObjeto, 1, newPrice)
                return respuesta




                /*const resultado = productos.filter ((item) => item.id !== ID)
                       // console.log('producto eliminado')
                        const producto = await items.getByID (ID)
                        const index = products.indexOf(producto)
                        productos.splice (index, 1)
                 return resultado
                 */
            }
        } catch (error) {
            console.error(`Error: ${error}`);
        }
    }

    async deleteAll() { 
        this.listaProductos = [];
        await fs.writeFile('./productos.txt', JSON.stringify(this.listaProductos, null, 4), error =>{
            if(error){
            } else {
            console.log("Se eliminaron todos los productos del contenedor.")
            }
        });
    }

}

const items = new Contenedor ('productos.json');

//module.exports = new Contenedor;




//---------------------------------------------------------creacion de las rutas--------------------------------------------------------------------------


productosRouter.get ('/'
    , async (req, res)=>{
            let products = await items.getAll()
            fakeApi = ()=> products
            //console.log(req.session.cookie.maxAge)
            if(req.session.cookie.maxAge>=1){
                res.render('datos', {suggestedChamps: fakeApi(), listExists: true})
            }else{
                res.redirect('/login')
            }
    }
)

/*productosRouter.get ('/:ID', async (req, res)=>{
    number = JSON.parse(req.params.ID)
    //console.log(number)
    let product = await items.getByID(number)
    res.json(product)
})*/

productosRouter.post('/', async (req, res)=>{
  console.log(req.body)
  let newProduct = await items.save (req.body)
  //productos.push(req.body)
  //res.json({mensaje: 'se agrego correctamente '})
  console.log(productos)
})

productosRouter.put ('/:ID', async (req, res)=>{
    //console.log(req.body)
    let newPrice = req.body
    //number = JSON.parse(req.params.ID)
    //console.log(number)
    let putProduct = await items.putByID(req.params.ID, newPrice)
    res.json(putProduct)
})

productosRouter.delete ("/:ID", async (req, res)=>{
    number = JSON.parse(req.params.ID)
    //console.log(number)
    let products = await items.deleteByID(number)
    //console.log(product)
    res.json(products)
})

//exportando el modulo
module.exports = productosRouter;
module.exports ['productos'] = productos

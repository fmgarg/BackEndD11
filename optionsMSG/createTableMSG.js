const {optionsMSG} = require ('./sqLite3') 


const knexMSG = require ('knex') (optionsMSG);

module.exports['createTableMSG'] = knexMSG.schema.createTable('MSG', (table) => {
  table.increments('id')
  table.string('author', 40).notNullable()
  table.string('timeStamp', 100).notNullable()
  table.string('text', 255).notNullable()
})
.then(() => console.log('table MSG created'))
.catch((err) => console.log(`No se pudo crear la tabla`))
.finally(() => {
  knexMSG.destroy()
})



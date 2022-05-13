const {optionsMSG} = require ('./sqLite3') 


const knexMSG = require ('knex') (optionsMSG);

module.exports['selectAllMSG'] = knexMSG
    .from('messages')
    .select('*')
    .then((rows) => {
            //rows.forEach(mensaje => {return mensaje})
            mensajes = rows.forEach(mensaje => console.log(mensaje))
            for (row of rows) {
              result = []
              result.push(row)
              //console.log(`${row['id']} ${row['author']} ${row['text']} `)
             // console.log(result)
              //console.log(result)
            }
            
    })
    .catch((err) => {
      console.log(err)
    })
    .finally(() => {
      knexMSG.destroy()
    })
const {optionsMSG} = require ('./sqLite3') 


const knexMSG = require ('knex') (optionsMSG);

module.exports['insertNewMSG'] = knexMSG('MSG')
      .insert(newMessages)
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
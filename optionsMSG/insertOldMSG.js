const {optionsMSG} = require ('./sqLite3') 


const knexMSG = require ('knex') (optionsMSG);

const oldMessages = [
    { author: '33333@gmail.com', text: '111111111111111111' },
    { author: '44444@gmail.com', text: '222222222222222222' }
    ]

module.exports['insertOldMSG'] = knexMSG('MSG')
      .insert(oldMessages)
      .then(() => {
        console.log('oldMessages ok')
      })
      .catch((err) => {
        console.log(err)
        throw err
      })
      .finally(() => {
        knexMSG.destroy()
      })
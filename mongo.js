const mongoose = require('mongoose')
//const { mongoPath } = require('./config.json')

module.exports = async () => {
    await mongoose.connect(process.env.MONGO_PATH, {
        useNewUrlParser : true,
        useUnifiedTopology : true,
        useFindAndModify: false
    })
    return mongoose
}
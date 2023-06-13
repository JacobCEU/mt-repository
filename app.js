const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require('body-parser')

// place db connection
const db = require("./API/models/connection_db")
db.connectDatabase()


//router placement
const userRouter = require('./API/routers/user_router')
const transactionRouter = require('./API/routers/transaction_router')
const storeRouter = require('./API/routers/store_router')


//body-parser define
app.use(morgan(`dev`))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

//header settings
app.use((req, res, next)=>{
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Controll-Allow-Headers", "*")

    if(req.method === 'OPTION'){
        res.header("Access-Controll-Allow-Methods", "*")
        return res.status(200).json({})

}
    next()
})
// define module endpoint plus router
app.use('/trans',transactionRouter )
app.use('/users',userRouter )
app.use('/store',storeRouter )


//error middleware
app.use((req,res,next)=>{
    const error = new Error('Not Found')
    error.status = 404
    next(error)
})

app.use((error,req,res,next)=>{
    res.status(error.status || 500)
    res.json({
        error:{
            message: error.message
        }
    })
})

module.exports = app
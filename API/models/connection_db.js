const mysql = require('mysql')

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "mtbackend_db"

})

const connectDatabase = ()=>{
db.connect((error)=>{
    if(error){
        console.log("Error connecting to database.")
    }
    else{
        console.log("Successfully connected to the database")
    }
 })

}

module.exports = {
    db,
    connectDatabase
}
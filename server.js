//create app.js
const express = require('express')
const app = express()
const port = 5000

//create route
app.get('/',(req,res)=> {
 res.json({message:"Hello from the server side"}) 
})

//start server
app.listen(port,()=> {
console.log(`App running on port ${port}...`)
})

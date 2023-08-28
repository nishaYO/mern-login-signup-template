//create app.js
const express = require('express')
const app = express()

const port = 5000
const connectToMongo = require('./db');

connectToMongo(); // Connect to the MongoDB database

// Define a route to handle the root URL
app.get('/',(req,res)=> {
 res.json({message:"Hello from the server side"}) 
})

app.use(express.json()); // Parse incoming JSON requests

// Mount the user routes under the '/api/user' path
app.use('/api/user', require('./routes/user'));

//start server
app.listen(port,()=> {
console.log(`App running on port ${port}...`)
})

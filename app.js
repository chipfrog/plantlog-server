const ejs = require('ejs')
const express = require('express')
const { initDatabase, getDatabase, insertPlant, getPlants, getPlant, eraseAllData } = require('./db')
const { default: Plant } = require('./plant')
const path = require("path")
const app = express()
const port = 3000

// Database initialization
initDatabase()
const db = getDatabase()
eraseAllData(db)

const p1 = new Plant("PEI-2025-01", "Peikonlehti", "Monstera deliciosa", "01-06-2025")
const p2 = new Plant("JUO-2025-01", "Juovatraakkipuu", "Dracaena deremensis", "01-07-2025")
const p3 = new Plant("KAH-2025-01", "Kahvipuu", "Coffea arabica")

insertPlant(db, p1)
insertPlant(db, p2)
insertPlant(db, p3)
getPlants(db)

app.use(express.static(path.join(__dirname, "public")))

// Routing

app.get('/', (req, res) => {
    console.log('homepage')
    res.sendFile(path.join(__dirname, "views", 'home.html'))
})

app.get('/plant/:code', (req, res) => {
    console.log(`req.params.code: ${req.params.code}`)
    const plant = getPlant(db, req.params.code)
    res.sendFile(path.join(__dirname, "views", "plant.html"))
})

app.get('/plant', (req, res) => {
    console.log('IN_PLANT')
})

app.post('/', (req, res) => {
    console.log(req.params)
    res.send('Got a POST request')
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

app.put('/user', (req, res) => {
  res.send('Got a PUT request at /user')
})

app.delete('/user', (req, res) => {
  res.send('Got a DELETE request at /user')
})


app.use((req, res) => {
    res.status(404).send('Not found :_(')
})



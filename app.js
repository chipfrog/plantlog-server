const ejs = require('ejs')
const express = require('express')
const app = express()
const port = 3000


let plants = [
    {
        id: 1,
        name: "Peikonlehti",
        waterings: 0
    },
    {
        id: 2,
        name: "Traakkipuu",
        waterings: 4
    }
]

const getPlant = (id) => {
    let plant

    for (let p of plants) {
        console.log(p)
        if (p.id == id) {
            return p
        }
    }
    return "No plant found :("
}


app.get('/', (req, res) => {
    console.log('homepage')
    res.sendFile('views/plant.html', { root: __dirname })
})

app.get('/plant', (req, res) => {
    console.log('IN_PLANT')
})

app.get('/plant/:id', (req, res) => {
    const plant = getPlant(req.params.id)
    console.log(plant)
    res.send(plant)
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



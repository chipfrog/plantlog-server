import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import {
    initDatabase,
    getDatabase,
    insertPlant,
    getPlants,
    getPlant,
    getPlantId,
    getWaterings,
    eraseAllData,
    insertWatering,
    deleteWatering,
    getMistings,
    getAllCareActions,    
} from './db.js'

import Plant from './plant.js'
import { formatDate, getDaysSince } from './utils.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const port = 3002

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, "public")))
app.use(express.json());

// Database initialization
let databaseType = 'test'

initDatabase(databaseType)
const db = getDatabase()

if (databaseType === 'test') {
    eraseAllData(db)

    const p1 = new Plant("PEI-2025-01", "Peikonlehti", "Monstera deliciosa", "/images/monstera.jpg", "01-06-2025")
    const p2 = new Plant("TRA-2025-01", "Juovatraakkipuu", "Dracaena deremensis", null, "01-07-2025")
    const p3 = new Plant("KAH-2025-01", "Kahvipuu", "Coffea arabica", null, null)
    const p4 = new Plant("PEI-2025-02", "Peikonlehti", "Monstera deliciosa", null, "01-06-2025")
    const p5 = new Plant("PAL-2025-01", "Palmuvehka", "Zamioculcas zamiifolia", null, "01-06-2025")

    insertPlant(db, p1)
    insertPlant(db, p2)
    insertPlant(db, p3)
    insertPlant(db, p4)
    insertPlant(db, p5)

    getPlants(db)

    const watering_1 = { plantCode: 'PEI-2025-01', method: 'top', amount: 1000, wateredAt:  1759610091000 }
    insertWatering(db, watering_1)

    const misting_1 = { plantCode: 'PEI-2025-01', method: 'mist', amount: 'Sprinkle', wateredAt:  1759314489000 }
    insertWatering(db, misting_1)

}

function daysSinceText(waterings) {
    console.log(waterings)
    console.log('typeof: ' + typeof waterings)

    let lastWatered
    const daysSince = getDaysSince(waterings[0].watered_at)

    if (daysSince === 0) {
        lastWatered = 'Today'
    } else if (daysSince === 1) {
        lastWatered = "1 day ago"
    } else {
        lastWatered = `${daysSince} days ago`
    }

    return lastWatered
}

// Routing
app.get('/', (req, res) => {
    console.log('homepage')
    res.sendFile(path.join(__dirname, "views", 'home.html'))
})

app.get('/plant/:code', (req, res) => {
    const plantCode = req.params.code
    const plant = getPlant(db, plantCode)
    const waterings = getWaterings(db, plantCode)
    const mistings = getMistings(db, plantCode)
    const careActions = getAllCareActions(db, plantCode)

    let lastWatered = "No records"
    let lastMisted = "No records"
    let waterAmount = 0
    let mistAmount = 0

    if (waterings) {
        waterAmount = waterings[0].amount
        lastWatered = daysSinceText(waterings)
    }

    if (mistings) {
        mistAmount = mistings[0].amount
        lastMisted = daysSinceText(mistings)
    }

    if (careActions) {
        for (const c of careActions) {
            const dateTime = formatDate(c.watered_at)
            const date = dateTime.date
            const time = dateTime.time
            c.date = date
            c.time = time     
        }
    }
    res.render('plant' , { plant, lastWatered, lastMisted, waterAmount, mistAmount, careActions })
})

app.post('/plant/:code/waterings', (req, res) => {
    const timeStamp = Date.now()
    const watering = req.body

    console.log('watering on server')
    console.log(watering)
    watering.wateredAt = timeStamp
    
    const insertedWatering = insertWatering(db, watering)
    

    if (insertedWatering) {
        const dateTime = formatDate(insertedWatering.watered_at)
        const daysSince = daysSinceText([insertedWatering])

        insertedWatering.date = dateTime.date
        insertedWatering.time = dateTime.time
        
        if (insertedWatering.method === 'mist') {
            res.json({ watering: insertedWatering, type: 'mist', daysSince: daysSince })
        } else {
            res.json({ watering: insertedWatering, type: 'water', daysSince: daysSince })
        }
    }
})

app.delete('/plant/:code/waterings/:id', (req, res) => {
    console.log('TRYING TO DELETE')
    const wateringId = req.params.id
    console.log(req.params)
    console.log(`wateringId: ${wateringId}`)
    const info = deleteWatering(wateringId)
    if (info.changes > 0) {
        res.status(200).json({ success: true })
    } else {
        res.status(404).json({ error: 'Item not found' })
    }
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



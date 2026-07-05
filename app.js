import express from 'express'
import path from 'path'
import dotenv from 'dotenv'
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
    getAllWaterings,
    inserFertilizer,
    getFertilizers,
    insertFertilization,
    getFertilizations,    
} from './db.js'

import Plant from './plant.js'
import Fertilizer from './fertilizer.js'
import { formatDate, getDaysSince } from './utils.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const port = process.env.PORT
const env = process.env.NODE_ENV

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

initDatabase(env)
const db = getDatabase()

//  "test" or "production"
if (env === 'test') {
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

    const fert1 = new Fertilizer({
        brand: "Substral",
        productName: "Ready to Use Yleislannoite",
        form: "liquid"
    })
    inserFertilizer(db, fert1)

    const fertEvent1 = { plantCode: 'PEI-2025-01', fertId: 1, fertilizedAt: 1759314489500, amount: 3 }
    insertFertilization(db, fertEvent1)
}

function daysSinceText(watering) {
    let lastWatered
    const daysSince = getDaysSince(watering[0].watered_at)

    if (daysSince === 0) {
        lastWatered = 'Today'
    } else if (daysSince === 1) {
        lastWatered = "1 day ago"
    } else {
        lastWatered = `${daysSince} days ago`
    }

    return lastWatered
}

function daysSinceFertText(fert) {
    let lastFertilized
    const daysSince = getDaysSince(fert[0].fertilized_at)

    if (daysSince === 0) {
        lastFertilized = 'Today'
    } else if (daysSince === 1) {
        lastFertilized = "1 day ago"
    } else {
        lastFertilized = `${daysSince} days ago`
    }

    return lastFertilized
}

// Routing
app.get('/', (req, res) => {
    console.log('homepage')
    res.sendFile(path.join(__dirname, "views", 'home.html'))
})

app.get('/plant/:code', (req, res) => {
    const plantCode = req.params.code
    console.log('plantCode: ' + plantCode)


    const plant = getPlant(db, plantCode)
    const waterings = getWaterings(db, plantCode)
    const mistings = getMistings(db, plantCode)
    const fertilizerList = getFertilizers(db)
    
    const fertilizations = getFertilizations(db, plantCode).map(f => ({
        ...f,
        type: "fertilization",
        date: f.fertilized_at
    }))

    const allWaterings = getAllWaterings(db, plantCode).map(w => ({
        ...w,
        type: "watering",
        date: w.watered_at
    }))

    const careActions  = allWaterings.concat(fertilizations)
    careActions.sort((a, b) => b.date - a.date)

    console.log('CAREACTIONS')
    console.log(careActions)


    let lastWatered = "No records"
    let lastMisted = "No records"
    let lastFertilized = "No records"

    let waterAmount = 0
    let mistAmount = 0
    let fertAmount = 0
    

    if (waterings.length > 0) {
        waterAmount = waterings[0].amount
        lastWatered = daysSinceText(waterings)
    }

    if (mistings.length > 0) {
        mistAmount = mistings[0].amount
        lastMisted = daysSinceText(mistings)
    }

    if (fertilizations.length > 0)  {
        fertAmount = fertilizations[0].amount
        lastFertilized = daysSinceFertText(fertilizations)
    }

    if (careActions) {
        for (const c of careActions) {
            let dateTime
            if (c.type === 'watering') { dateTime = formatDate(c.watered_at) }
            else { dateTime = formatDate(c.fertilized_at) }
            
            c.date = dateTime.date
            c.time = dateTime.time   
        }
    }
    res.render('plant' , { plant, lastWatered, lastMisted, lastFertilized, waterAmount, mistAmount, fertAmount, careActions, fertilizerList })
})

app.post('/plant/:code/fertilizations', (req, res) => {
    const timeStamp = Date.now()
    const fertilization = req.body
    fertilization.fertilizedAt = timeStamp

    const insertedFertilization = insertFertilization(db, fertilization)

    if (insertedFertilization) {
        const dateTime = formatDate(insertedFertilization.fertilized_at)
        const daysSince = daysSinceFertText([insertedFertilization])

        insertedFertilization.date = dateTime.date
        insertedFertilization.time = dateTime.time

        res.json({ fertilization: insertedFertilization, daysSince: daysSince })
    }
})

app.post('/plant/:code/waterings', (req, res) => {
    const timeStamp = Date.now()
    const watering = req.body
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
    const wateringId = req.params.id
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

app.get('/addplant', (req, res) => {
    console.log('addplant page')
    res.sendFile(path.join(__dirname, "views", 'addplant.html'))
})

app.post('/save-plant', (req, res) => {
    console.log('got a new plant!')
    const name = req.body
    console.log(name)
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



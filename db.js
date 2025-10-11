
import Database from 'better-sqlite3'
import Plant from './plant.js'

let db

export function getDatabase() {
    if (!db) throw new Error("Database not initialized.")
    return db
}

export function initDatabase(type) {
    if (db) return db // Makes sure only on database connection is created, if multiple calls to initDatabase()
    if (type === 'production') {
        db = new Database('production.db')
    } else if (type === 'test') {
        db = new Database('test.db')
    }
    
    db.exec("PRAGMA foreign_keys = ON;")

    console.log('intializing database...')

    db.exec(`
        CREATE TABLE IF NOT EXISTS plants (
            id INTEGER PRIMARY KEY,
            code TEXT,
            name TEXT,
            latin_name TEXT,
            image_path TEXT,
            date_acquired DATETIME
        );
        
        CREATE TABLE IF NOT EXISTS waterings (
            id INTEGER PRIMARY KEY,
            plant_id INTEGER NOT NULL,
            watered_at DATETIME NOT NULL,
            method TEXT NOT NULL,
            amount TEXT,
            notes TEXT,
            FOREIGN KEY (plant_id) REFERENCES plants(id)
                ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS fertilizers (
            id INTEGER PRIMARY KEY,
            brand TEXT,
            product_name TEXT,
            form TEXT,
            npk TEXT
        );

        CREATE TABLE IF NOT EXISTS fertilizations (
            id INTEGER PRIMARY KEY,
            plant_id INTEGER NOT NULL,
            fertilizer_id INTEGER NOT NULL,
            fertilized_at DATETIME NOT NULL,
            amount INTEGER,
            unit TEXT,
            notes TEXT,
            FOREIGN KEY (plant_id) REFERENCES plants(id)
                ON DELETE CASCADE,
            FOREIGN KEY (fertilizer_id) REFERENCES fertilizers(id)
        );
    `)
    return db
}

export function insertPlant(db, plant) {
    const insert = db.prepare('INSERT INTO PLANTS (code, name, latin_name, image_path, date_acquired) VALUES (?, ?, ?, ?, ?)')
    const info = insert.run(plant.code, plant.name, plant.latinName, plant.imagePath, plant.dateAquired )
    // console.log(info.changes)
}

export function insertWatering(db, watering) {
    const plantId = getPlantId(db, watering.plantCode)
    const stmt = db.prepare('INSERT INTO WATERINGS (plant_id, watered_at, method, amount) VALUES (?, ?, ?, ?)')
    const info = stmt.run(plantId, watering.wateredAt, watering.method, watering.amount)
    if (info.changes > 0) {
        return getWateringById(info.lastInsertRowid)
    }
    return false
}

export function getPlantId(db, code) {
    console.log('Getting plantID with code: ' + code)
    const stmt = db.prepare("SELECT id FROM plants WHERE code = ?")
    const plantId = stmt.get(code).id
    return plantId
}

export function getPlant(db, code) {
    console.log(`getPlant: ${code}`)
    const stmt = db.prepare("SELECT * FROM plants WHERE code = ?")
    const dbPlant = stmt.get(code)

    if (!dbPlant) {
        console.log(`No plant with code: ${code}`)
        return null
    }
    const plant = new Plant(
        dbPlant.code, 
        dbPlant.name,
        dbPlant.latin_name,
        dbPlant.image_path,
        dbPlant.date_acquired
    )

    console.log('Fetched plant:')
    console.log(dbPlant)
    return plant
}

export function getWaterings(db, code) {
    const plantId = getPlantId(db, code)
    const stmt = db.prepare("SELECT * FROM waterings WHERE plant_id = ? AND method IN ('top', 'bottom') ORDER BY watered_at DESC")
    const waterings = stmt.all(plantId)
    if (waterings.length < 1) {
        console.log(`No waterings recorded for plant ${code}`)
        return null
    }
    console.log(waterings)
    return waterings
}

function getWateringById(id) {
    const stmt = db.prepare("SELECT * FROM waterings WHERE id = ?")
    const watering = stmt.get(id)
    return watering
}

export function deleteWatering(id) {
    const stmt = db.prepare("DELETE FROM waterings WHERE id = ?")
    const info = stmt.run(id)
    console.log(info)
    return info
}

export function getMistings(db, code) {
    const plantId = getPlantId(db, code)
    const stmt = db.prepare("SELECT * FROM waterings WHERE plant_id = ? AND method = 'mist' ORDER BY watered_at DESC")
    const mistings = stmt.all(plantId)
    if (mistings.length < 1) {
        console.log(`No mistings recorded for plant ${code}`)
        return null
    }
    console.log(mistings)
    return mistings
}

export function getAllCareActions(db, code) {
    const plantId = getPlantId(db, code)
    const stmt = db.prepare("SELECT * FROM waterings WHERE plant_id = ? ORDER BY watered_at DESC")
    const actions = stmt.all(plantId)
    if (actions.length < 1) {
        console.log(`No care actions recorded for plant ${code}`)
        return null
    }
    console.log(actions)
    return actions
}

export function getPlants(db) {
    const getAll = db.prepare('SELECT * FROM plants')
    const plants = getAll.all()

    console.log(plants)
}

export function eraseAllData(db) {
    const deleteAll = db.prepare('DELETE FROM plants')
    const info = deleteAll.run()
    console.log(info)
}

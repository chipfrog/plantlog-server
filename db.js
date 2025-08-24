
import Database from 'better-sqlite3'
import Plant from './plant.js'

let db

export function getDatabase() {
    if (!db) throw new Error("Database not initialized.")
    return db
}

export function initDatabase() {
    if (db) return db // Makes sure only on database connection is created, if multiple calls to initDatabase()
    db = new Database('plantlog.db')
    db.exec("PRAGMA foreign_keys = ON;")

    console.log('intializing database...')

    db.exec(`
        CREATE TABLE IF NOT EXISTS plants (
            id INTEGER PRIMARY KEY,
            code TEXT,
            name TEXT,
            latin_name TEXT,
            date_acquired DATETIME
        );
        
        CREATE TABLE IF NOT EXISTS waterings (
            id INTEGER PRIMARY KEY,
            plant_id INTEGER NOT NULL,
            watered_at DATETIME NOT NULL,
            method TEXT NOT NULL,
            amount_ml INTEGER,
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
    const insert = db.prepare('INSERT INTO PLANTS (code, name, latin_name, date_acquired) VALUES (?, ?, ?, ?)')
    const info = insert.run(plant.code, plant.name, plant.latinName, plant.dateAquired )
    // console.log(info.changes)
}

export function getPlant(db, code) {
    console.log(code)
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
        dbPlant.date_acquired
    )

    console.log('Fetched plant:')
    console.log(dbPlant)
    return plant
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

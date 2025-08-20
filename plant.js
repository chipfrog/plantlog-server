export default class Plant {
    constructor(code, name, latinName = null, dateAquired = null) {
        this.code = code,
        this.name = name,
        this.latinName = latinName,
        this.dateAquired = dateAquired
    }
}
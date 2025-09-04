export default class Plant {
    constructor(code, name, latinName = null, imagePath = null, dateAquired = null) {
        this.code = code
        this.name = name
        this.latinName = latinName
        this.imagePath = imagePath
        this.dateAquired = dateAquired
    }
}
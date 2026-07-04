export default class Fertilizer {
    constructor({
        id,
        brand,
        productName,
        form,
        npk
    }) {
        this.id =  id;
        this.brand = brand;
        this.productName = productName;
        this.form = form;
        this.npk = npk;
    }
}
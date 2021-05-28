const chai = require('chai')
const expect = chai.expect
const validator = require('./app/config/validator')



//Test unitaires forecast
describe("validator isDateValide", () => {

    it("should return true when the date is lgreater  to date now", () => {
        expect(validator.isDateValide('20-05-2021')).to.be.true
    })

    it("should return false when the date is less than or equal to date now", () => {
        expect(validator.isDateValide('18-05-2021')).to.be.false
    })

    it("should return false when the date is less than or equal to date now", () => {
        expect(validator.isDateValide('19-05-2021')).to.be.false
    })



})

describe("validator isFormatValide", () => {

    it("should return true when the format is equal to format_group", () => {
        expect(validator.isFormatValide("HABILLAGE")).to.be.true
    })


    it("should return false when the format is invalid", () => {
        expect(validator.isFormatValide("FORMAT")).to.be.false
    })




})

/*describe("validator isPacksValide", () => {

    it("should return true when the pack is equal to pack_name", () => {
        expect(validator.isPacksValide("Rotation Générale")).to.be.true
    })


    it("should return false when the pack is invalid", () => {
        expect(validator.isPacksValide("Pack")).to.be.false
    })




})*/




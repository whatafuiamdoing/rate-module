import { fetchMultipleExchange } from "./lib/ticker.js"

class Rate {
    constructor(pair) {
        this.syntheticPair = pair
        this.syntheticRate = 0
        this.baseRate = 0

    }

    set _syntheticRate(value) {
        this.syntheticRate = value
    }
}

Object.assign(Rate.prototype, { fetchMultipleExchange })

const RateModule = Object.create(null)

Object.defineProperties(RateModule, {
    Rate: {
        value: Rate,
        writable: false,
        enumerable: true,
        configurable: false
    },
    init: {
        value: function (pair) {
            return new Rate(pair)
        },
        writable: false,
        enumerable: true,
        configurable: false
    }
})

Object.freeze(RateModule)

export default RateModule
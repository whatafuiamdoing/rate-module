import { calculateArbitrage } from "./lib/exchanges.js"


class Exchange {
    /**
     * 
     * @param {
     * Payload {
     *  "exchange name": {
     *  "id": string,
     *  "symbol": string
     *  "vwap": number
     *  "ask": number
     *  "last": number 
     *  "quote": number
     *   ...
     *  "amount": number // this references to bulk amount combined multiple orders with respective exchange rates on order execution
     * }
     * }
     * } payload 
     */
    constructor(payload) {
        this.payload = payload
    }
}

Object.assign(Exchange.prototype, { calculateArbitrage })

const ExchangeModule = Object.create(null)

Object.defineProperties(ExchangeModule, {
    Exchange: {
        value: Exchange,
        writable: false,
        enumerable: true,
        configurable: false
    },
    init: {
        value: function (payload) {
            return new Exchange(payload)
        },
        writable: false,
        enumerable: true,
        configurable: false
    }
})

Object.freeze(ExchangeModule)

export default ExchangeModule
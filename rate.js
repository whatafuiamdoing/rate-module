import ccxt from "ccxt"
import config from "./config.js"
import { computeCustomPrice, fetchMultipleExchange, getSyntheticRate } from "./lib/ticker.js"
import { fetchFxConversionRates } from "./lib/fx.js"

function RateConstructor(pair, base, quote, margin) {
    this.syntheticPair = pair
    this.baseRate = computeCustomPrice(base)
    this.quoteRate = typeof quote === "number" ? quote : computeCustomPrice(quote)
    this.syntheticRate = this.getSyntheticRate(margin)
}

Object.assign(RateConstructor.prototype, {
    getSyntheticRate,
    async crypto() { },
    async fiat() { }
})

Object.defineProperty(RateConstructor, "create", {
    value: function (pair, base, quote, margin) {
        const instance = Object.create(RateConstructor.prototype)
        RateConstructor.call(instance, pair, base, quote, margin)
        return new Proxy(instance, {
            get(target, prop, receiver) {
                return Reflect.get(target, prop, receiver)
            }
        })
    },
    writable: false,
    enumerable: true,
    configurable: false
})

const cryptoModule = {
    async fetchRates(symbol, cfg = config) {



        return await fetchMultipleExchange(cfg.exchanges, symbol)
    }
}

const fiatModule = {
    async fetchRates(symbol) {



        return await fetchFxConversionRates(symbol)
    }
}

const RateModule = Object.create(null)
Object.defineProperties(RateModule, {
    Rate: {
        value: RateConstructor.create,
        writable: false,
        enumerable: true,
        configurable: false
    }
})

Object.freeze(RateModule)

const ONIGIRI = Object.create(null)

Object.defineProperties(ONIGIRI, {
    Rate: {
        value: RateModule.Rate,
        writable: false,
        enumerable: true,
        configurable: false
    },
    fiat: {
        value: fiatModule,
        writable: false,
        enumerable: true,
        configurable: false
    },
    crypto: {
        value: cryptoModule,
        writable: false,
        enumerable: true,
        configurable: false
    }
})

Object.freeze(ONIGIRI)

export default ONIGIRI



import ccxt from "ccxt"
import config from "./config.js"
import { computeCustomPrice, fetchMultipleExchange, getSyntheticRate } from "./lib/ticker.js"

function ExchangeConstructor(symbol, cfg) {
    this.symbol = symbol
    this.rates = null
    this.cfg = cfg
}

function RateConstructor(pair, base, quote) {
    this.syntheticPair = pair
    this.baseRate = computeCustomPrice(base)
    this.quoteRate = computeCustomPrice(quote)
    this.syntheticRate = this.getSyntheticRate()
}

Object.assign(ExchangeConstructor.prototype, {
    async init() {
        this.rates = await fetchMultipleExchange(this.cfg.exchanges, this.symbol)
        return this
    }
})

Object.assign(RateConstructor.prototype, { getSyntheticRate })

Object.defineProperty(ExchangeConstructor, "create", {
    value: async function (symbol, cfg = config) {
        const instance = Object.create(ExchangeConstructor.prototype)
        ExchangeConstructor.call(instance, symbol, cfg)
        await instance.init()

        return new Proxy(instance, {
            get(target, prop, receiver) {
                // if (prop === "rates" && !target.extended) return undefined
                return Reflect.get(target, prop, receiver)
            },
            ownKeys(target) {
                return Reflect.ownKeys(target).filter(key => key !== "cfg" && key !== "extended")
            },
            getOwnPropertyDescriptor(target, prop) {
                if (prop === "cfg" || prop === "extended") return undefined;
                return Object.getOwnPropertyDescriptor(target, prop);
            }
        })
    },
    writable: false,
    enumerable: true,
    configurable: false
})

Object.defineProperty(RateConstructor, "create", {
    value: function (pair, base, quote) {
        const instance = Object.create(RateConstructor.prototype)
        RateConstructor.call(instance, pair, base, quote)

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

const ExchangeModule = Object.create(null)
const RateModule = Object.create(null)
Object.defineProperties(ExchangeModule, {
    Exchange: {
        value: ExchangeConstructor.create,
        writable: false,
        enumerable: true,
        configurable: false
    }
})

Object.defineProperties(RateModule, {
    Rate :{
        value: RateConstructor.create,
        writable: false,
        enumerable: true,
        configurable: false
    }
})

Object.freeze(ExchangeModule)
Object.freeze(RateModule)

const ONIGIRI = Object.create(null)

Object.defineProperties(ONIGIRI, {
    Rate: {
        value: RateModule.Rate,
        writable: false,
        enumerable: true,
        configurable: false
    },
    Exchange: {
        value: ExchangeModule.Exchange,
        writable: false,
        enumerable: true,
        configurable: false
    }
})

Object.freeze(ONIGIRI)

export default ONIGIRI

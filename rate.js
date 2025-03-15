import ccxt from "ccxt"
import config from "./config.js"
import { computeCustomPrice, fetchMultipleExchange, getSyntheticRate } from "./lib/ticker.js"
import { fetchFxConversionRates } from "./lib/fx.js"
import { fetchBinanceP2P, computeOrderMetrics, constructPayload } from "./lib/p2p.js"

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
    async fetchRates(symbol, options) {
        const fxRates = await fetchFxConversionRates(symbol)

        if (arguments.length >= 2) {
            const payload = constructPayload(options)

            const [buy, sell] = await Promise.all([
                fetchBinanceP2P({ tradeType: "BUY", ...payload }),
                fetchBinanceP2P({ tradeType: "SELL", ...payload })
            ])

            let ticker = {}
            let sellMetrics = computeOrderMetrics(sell)
            let buyMetrics = computeOrderMetrics(buy)
            let overallVol = buyMetrics.totalVolume + sellMetrics.totalVolume
            let overallVWAP = (buyMetrics.vwap * buyMetrics.totalVolume + sellMetrics.vwap * sellMetrics.totalVolume) / overallVol

            ticker = {
                symbol,
                bid: buyMetrics.bestPrice,
                ask: sellMetrics.bestPrice,
                vwap: overallVWAP,
                quote: overallVol
            }

            if (!fxRates)
                return ticker
            else
                return { ticker, fxRates }
        } else {
            return fxRates
        }
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



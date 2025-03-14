import ccxt from "ccxt"
import config from "./config.js"
import { computeCustomPrice, fetchMultipleExchange, fetchTickerPrice, getSyntheticRate } from "./lib/ticker.js"

const CACHE_TTL = 30000

const multiCache = new Map()
const tickerCache = new Map()

async function getCachedMultiExchange(ids, symbol) {
    const key = `fetchMultipleExchange:${ids.join(',')}:${symbol}`;
    const now = Date.now();
    if (multiCache.has(key)) {
        const { timestamp, value } = multiCache.get(key);
        if (now - timestamp < CACHE_TTL) {
            return value;
        }
    }
    const value = await fetchMultipleExchange(ids, symbol);
    multiCache.set(key, { timestamp: now, value });
    return value;
}

async function getCachedTicker(id, symbol) {
    const key = `fetchTicker:${id}:${symbol}`;
    const now = Date.now();
    if (tickerCache.has(key)) {
        const { timestamp, value } = tickerCache.get(key);
        if (now - timestamp < CACHE_TTL) {
            return value;
        }
    }
    const value = await fetchTickerPrice(id, symbol);
    tickerCache.set(key, { timestamp: now, value });
    return value;
}

function RateConstructor(pair, extended, cfg) {
    this.syntheticPair = pair;
    const [base, quote] = pair.split("/");
    this.baseSymbol = `${base}/USDT`;
    this.quoteSymbol = `${quote}/USDT`;
    this.extended = extended;
    this.cfg = cfg;

    this.rates = null;
    this.baseRate = null;
    this.quoteRate = null;
    this.syntheticRate = null;
}

Object.assign(RateConstructor.prototype, {
    async init() {
        const [rates, ticker] = await Promise.all([
            getCachedMultiExchange(this.cfg.exchanges, this.baseSymbol),
            getCachedTicker(this.cfg.exchanges[0], this.quoteSymbol)
        ])

        this.rates = rates
        this.baseRate = computeCustomPrice(rates)
        this.quoteRate = ticker
        this.syntheticRate = getSyntheticRate.call(this)

        if (!this.extended) {
            Object.defineProperty(this, "rates", {
                enumerable: false,
                configurable: false,
                writable: false,
                value: this.rates
            })
        }

        return this
    }
})

Object.defineProperty(RateConstructor, "create", {
    value: async function (pair, extended = false, cfg = config) {
        const instance = Object.create(RateConstructor.prototype)
        RateConstructor.call(instance, pair, extended, cfg)
        await instance.init()

        return new Proxy(instance, {
            get(target, prop, receiver) {
                if (prop === "rates" && !target.extended) return undefined
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

export default RateModule.Rate

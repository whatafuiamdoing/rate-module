import asTable from 'as-table';
import ololog from 'ololog';
import ansicolor from 'ansicolor';
import ccxt from 'ccxt';

const { noLocate } = ololog;
const log = noLocate;

ansicolor.nice

class Rate {
    constructor(pair) {
        this.stable = "USDT"
        this.syntheticPair = pair
        this.syntheticRate = ""
        this.baseSymbol = ""
        this.quoteSymbol = ""
        this.baseSymbolRate = ""
        this.quoteSymbolRate = ""

        this.rates = {}
        this.deconstructSyntheticPair(pair)
    }
}

async function fetchTickerRate(ids) {
    this.rates = await Promise.all(
        ids.map(async (id) => {
            let exchange = new ccxt[id]()
            await exchange.loadMarkets()

            if (this.baseSymbol in exchange.markets) {
                let ticker = await exchange.fetchTicker(this.baseSymbol)
                return Object.assign({ exchange: id }, ticker)
            }
        })
    )
}

function computeCustomPrice() {
    let totalWeightedPrice = 0;
    let totalVolume = 0;

    this.rates.forEach((rate) => {
        if (rate) {
            const price = typeof rate.vvwap !== 'undefined'
                ? rate.vvwap
                : ((rate.bid + rate.ask) / 2);
            const volume = typeof rate.quoteVolume !== 'undefined'
                ? rate.quoteVolume
                : 0;

            if (volume > 0) {
                totalWeightedPrice += price * volume;
                totalVolume += volume;
            }
        }
    });

    const customPrice = totalVolume > 0 ? totalWeightedPrice / totalVolume : NaN;
    this.baseSymbolRate = customPrice;
}

async function watchTicker(id, symbol, rateLimit = undefined, logger = false) {
    let exchange = new ccxt[id]()
    if (exchange) {
        await exchange.loadMarkets()
        exchange.rateLimit = rateLimit || exchange.rateLimit
        if (symbol in exchange.markets) {

            let ticker = await exchange.fetchTicker(symbol)

            if (logger) {
                log('--------------------------------------------------------')
                log(exchange.id.green, symbol.yellow, exchange.iso8601(exchange.milliseconds()))
                log(ccxt.omit(ticker, 'info'))
            }

            this.quoteSymbolRate = ticker.last
        }
    }
}

function deconstructSyntheticPair(pair) {
    const slice = pair.split("/")
    const base = slice[0]
    const quote = slice[1]

    this.syntheticPair = pair
    this.baseSymbol = `${base}/${this.stable}`
    this.quoteSymbol = `${quote}/${this.stable}`
}

function computeSyntheticPairRate() {
    this.syntheticRate = this.baseSymbolRate / this.quoteSymbolRate
}

Object.assign(Rate.prototype, { watchTicker, fetchTickerRate, computeCustomPrice, deconstructSyntheticPair, computeSyntheticPairRate })

class RateController {

    constructor() {
        this.fix = false
    }

    async getRate(exchanges, symbol) {
        this.rateInstance = new Rate(symbol)
        await this.getLiveRate()

        await this.rateInstance.fetchTickerRate(exchanges)

        this.rateInstance.computeCustomPrice()
        this.rateInstance.computeSyntheticPairRate()
        log(this.rateInstance)
    }

    async getLiveRate() {
        while (!this.fix) {
            console.log(this.fix)
            await this.rateInstance.watchTicker("binance", this.rateInstance.quoteSymbol, undefined, false)
            await new Promise(resolve => setTimeout(resolve, 1000))
        }

        // console.log(this.rateInstance.quoteSymbol + "\n" + this.rateInstance.quoteSymbolRate)
    }

    fixRate() {
        this.fix = true
    }
}

; (async () => {
    const rateController = new RateController()
    rateController.getRate(["binance", "okx", "kraken", "gate"], "TRX/BTC")

    setTimeout(() => {
        rateController.fixRate()
    }, 5000)
})()
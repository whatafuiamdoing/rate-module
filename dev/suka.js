import asTable from 'as-table';
import ololog from 'ololog';
import ansicolor from 'ansicolor';
import ccxt from 'ccxt';

const { noLocate } = ololog;
const log = noLocate;

ansicolor.nice

class Rate {
    constructor() {
        this.syntheticPair = ""
        this.baseRate = 0
        this.baseSymbol = ""
        this.quoteSymbol = ""
        this.quoteRate = 0
        this.rates = {}
    }
}

const isValidExchange = (id) => ccxt.exchanges.indexOf(id) > -1

async function fetchTickerRates(ids, symbol) {
    this.rates = await Promise.all(
        ids.map(async (id) => {
            if (isValidExchange(id)) {
                let exchange = new ccxt[id]()
                await exchange.loadMarkets()

                if (symbol in exchange.markets) {
                    let ticker = await exchange.fetchTicker(symbol)
                    return Object.assign({ exchange: id }, ticker)
                }
            } else {
                log('Exchange ' + id.red + ' not found')
                return []
            }
        })
    )
}

function computeCustomPrice() {
    let totalWeightedPrice = 0;
    let totalVolume = 0;
    log(this.rates)
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
    this.baseSymbol = this.rates[0].symbol
    this.baseRate = customPrice;
}

async function liveTicker(id, symbol, rateLimit = undefined, logger = false) {
    if (isValidExchange(id)) {

        let exchange = new ccxt[id]()
        exchange.rateLimit = rateLimit || exchange.rateLimit
        await exchange.loadMarkets()

        if (symbol in exchange.markets) {

            while (true) {

                let ticker = await exchange.fetchTicker(symbol)

                if (logger) {
                    log('--------------------------------------------------------')
                    log(exchange.id.green, symbol.yellow, exchange.iso8601(exchange.milliseconds()))
                    log(ccxt.omit(ticker, 'info'))
                }

                this.quoteSymbol = ticker.symbol
                this.quoteRate = ticker.last
            }
        } else {
            log.error('Symbol', symbol.bright, 'not found')
        }
    } else {
        log('Exchange ' + id.red + ' not found')
    }
}

Object.assign(Rate.prototype, { liveTicker, fetchTickerRates, computeCustomPrice })

    ; (async () => {
        const rate = new Rate()
        const rates = await rate.fetchTickerRates(["binance", "kraken", "okx", "gate"], "BTC/USDT")
        rate.computeCustomPrice()
        console.log(rate)
        // rate.liveTicker("binance", "BTC/USDT", undefined, false)

        // setTimeout(() => {
        //     console.log(rate)
        // }, 5000)


    })()


// class Rate {
//     constructor() {
//         this._syntheticPair = ""
//         this._baseSymbol = ""
//         this._quoteSymbol = ""
//         this._baseRate = 0
//         this._quoteRate = 0
//         this._syntheticRate = 0 // base
//         this._baseVwap = 0

//         this._fixRate = false
//     }

//     fixRate() {
//         this._fixRate = true
//     }
// }

// const isValidExchange = (id) => ccxt.exchanges.indexOf(id) > -1
// const isUSDT = (symbol) => symbol.split("/")[1] === "USDT" ? true : false

// async function watchTicker(id, symbol, rateLimit = undefined, logger = false) {
//     if (isValidExchange(id)) {
//         log('Instantiating', id.green, 'exchange')

//         let exchange = new ccxt[id]()
//         // Set rate limit
//         exchange.rateLimit = rateLimit || exchange.rateLimit;
//         // Load exchange markets
//         await exchange.loadMarkets()

//         if (symbol in exchange.markets) {
//             const fetchTicker = async () => {
//                 if (this._fixRate) {
//                     log("Rate fixed");
//                     return;
//                 }

//                 try {
//                     const ticker = await exchange.fetchTicker(symbol);

//                     if (logger) {
//                         log('--------------------------------------------------------')
//                         log(exchange.id.green, symbol.yellow, exchange.iso8601(exchange.milliseconds()))
//                         log(ccxt.omit(ticker, 'info'))
//                     }

//                     // Update the Rate instance properties
//                     this._quoteSymbol = ticker.symbol;
//                     this._quoteRate = ticker.last;

//                 } catch (error) {
//                     logger(`Error fetching ticker: ${error.message}`);
//                 }

//                 if (!this._fixRate) {
//                     setTimeout(fetchTicker, exchange.rateLimit); // Respect API rate limits
//                 }
//             }

//             fetchTicker();
//         } else {
//             log.error('Symbol', symbol.bright, 'not found')
//             return []
//         }
//     } else {
//         log('Exchange ' + id.red + ' not found')
//         return []
//     }
// }






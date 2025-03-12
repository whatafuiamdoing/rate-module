import log from "ololog"
import ccxt from "ccxt"

export async function fetchMultipleExchange(ids, symbol) {
    let tickers = {}
    await Promise.all(ids.map(async (id) => {
        try {
            let exchange = new ccxt[id]();
            await exchange.loadMarkets()

            if (symbol in exchange.markets) {
                let ticker = await exchange.fetchTicker(symbol)
                tickers[id] = {
                    id,
                    symbol: ticker["symbol"],
                    vwap: ticker["vwap"],
                    bid: ticker["bid"],
                    ask: ticker["ask"],
                    last: ticker["last"],
                    quote: ticker["quoteVolume"]
                }
                log(id, ticker)
            }

        } catch (err) {
            log(err)
        }
    }))
    return tickers
}
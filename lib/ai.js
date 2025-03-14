import ccxt from "ccxt"

async function fetchOHLCVContinuously(exchange, symbol) {
    while (true) {
        try {
            const ohlcv = await exchange.fetchOHLCV(symbol);
            const ohlcvLength = ohlcv.length;
            console.log(symbol, ohlcv)
            // console.log('Fetched ', exchange.id, ' - ', symbol, ' candles. last candle: ', ohlcv[ohlcvLength - 1]);
        }
        catch (e) {
            console.log(e);
            break;
        }
    }
}
// start exchanges and fetch OHLCV loop
export async function startExchange(exchangeName, symbols) {
    const ex = new ccxt[exchangeName]();
    const promises = [];
    for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i];
        promises.push(fetchOHLCVContinuously(ex, symbol));
    }
    await Promise.all(promises);
    await ex.close();
}

export async function binanceOrderBook(exchangeName, symbols) {
    const ex = new ccxt[exchangeName]()
    const promises = []
    for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i]
        promises.push(ex.fetchOrderBook(symbol))
    }
    const responses = await Promise.all(promises)
    responses.forEach((response) => {
        console.log(exchangeName, response.symbol, response["bids"], response["asks"])
    })
    await ex.close()
}

export async function fetchTraderForSymbol(exchangeName, symbols) {
    const ex = new ccxt[exchangeName]()

    const watchTrader = async (ex, symbol) => {
        while (true) {
            const trades = await ex.watchTradesForSymbols(symbol);
            console.log(trades);
        }
    }

    const promises = []
    for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i]
        promises.push(watchTrader(ex, symbol))
    }
    const responses = await Promise.all(promises)
    await ex.close()
}

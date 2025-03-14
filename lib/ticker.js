import log from "ololog"
import ccxt from "ccxt"

export async function fetchMultipleExchange(ids, symbol) {
    // Set of symbol to skip or return dummy ticker
    const SKIP_SYMBOLS = new Set(["USDT/USDT", "USDT/USDC", "USDT/FUSD"]);

    /**
     * Resolve alternative pairs for an exchange
     * Given desired symbol "BASE/QUOTE", if the exchange doesn't list it, 
     * try alternative quote cc
     * 
     * if "BASE/USDT" isn't avaliable
     * proceed with first of "BASE/USD" "BASE/USDC" .......
     * 
     * @param {object} exchange - ccxt exchange instance
     * @param {string} symbol - original symbol "BASE/QUOTE" format
     * @returns {string} - Resolved symbol if avaliable, otherwise the original 
     */
    function resolveSymbol(exchange, symbol) {
        const [base, quote] = symbol.split("/")
        let alternatives = []
        switch (quote) {
            case "USDT":
                alternatives.push(`${base}/USD`)
                alternatives.push(`${base}/USDC`)
                break;
            case "USD":
                alternatives.push(`${base}/USDT`);
                alternatives.push(`${base}/USDC`);
                break;
            case "USDC":
                alternatives.push(`${base}/USDT`);
                alternatives.push(`${base}/USD`);
                break;
            case "FUSD":
                alternatives.push(`${base}/USDT`);
                alternatives.push(`${base}/USD`);
                alternatives.push(`${base}/USDC`);
                break;
        }

        for (let alt of alternatives) {
            if (alt in exchange.markets) {
                return alt;
            }
        }

        return symbol;
    }


    let tickers = {}
    await Promise.all(ids.map(async (id) => {
        try {
            let exchange = new ccxt[id]();
            await exchange.loadMarkets()
            if (SKIP_SYMBOLS.has(symbol)) {
                tickers[id] = {
                    id,
                    symbol: symbol,
                    vwap: 1,
                    bid: 1,
                    ask: 1,
                    last: 1,
                    quote: 1
                };
                return;
            }

            let resolvedSymbol = symbol;
            if (!(resolvedSymbol in exchange.markets)) {
                resolvedSymbol = resolveSymbol(exchange, symbol);
            }

            if (resolvedSymbol in exchange.markets) {
                let ticker = await exchange.fetchTicker(resolvedSymbol);
                tickers[id] = {
                  id,
                  symbol: ticker["symbol"],
                  vwap: ticker["vwap"],
                  bid: ticker["bid"],
                  ask: ticker["ask"],
                  last: ticker["last"],
                  quote: ticker["quoteVolume"]
                };
              }
        } catch (err) {
            log(err)
        }
    }))
    return tickers
}

export function computeCustomPrice(rates) {
    let totalWeightedPrice = 0
    let totalVolume = 0

    Object.values(rates).forEach((rate) => {
        if (rate) {
            const price = typeof rate.vvwap !== 'undefined'
                ? rate.vvwap
                : ((rate.bid + rate.ask) / 2);
            const volume = typeof rate.quote !== 'undefined'
                ? rate.quote
                : 0;

            if (volume > 0) {
                totalWeightedPrice += price * volume;
                totalVolume += volume;
            }
        }
    })

    const rate = totalVolume > 0 ? totalWeightedPrice / totalVolume : NaN;
    return rate
}

export function getSyntheticRate() {
    return this.baseRate / this.quoteRate
}
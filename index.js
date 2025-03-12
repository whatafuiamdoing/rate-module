import log from "ololog"
import express from "express"
import RateModule from "./rate.js"
import ExchangeModule from "./exchange.js"
const PORT = 5123

import { binanceOrderBook, fetchTraderForSymbol, startExchange } from "./lib/ai.js"

const app = express()

app.use(express.json())

app.get("/api/rate/:code", async (req, res) => {
    try {
        const code = req.params.code
        const rate = RateModule.init(code)
        log(code, rate)
        res.json({ status: 200, message: rate })
    } catch (err) {
        log(err)
    }
})

app.get("/api/rate/exchanges/:code", async (req, res) => {
    try {
        const code = req.params.code
        const exchnages = ["binance", "okx", "gate", "kraken"]
        const rate = RateModule.init(code)
        const tickers = await rate.fetchMultipleExchange(exchnages, code)
        res.json({ status: 200, message: tickers })
    } catch (err) {
        log(err)
    }
})

app.get("/api/rate/arbitrage/exchanges/:code", async (req, res) => {
    try {
        const code = req.params.code
        const exchnages = ["binance", "okx", "gate", "kraken"]
        const rate = RateModule.init(code)
        const tickers = await rate.fetchMultipleExchange(exchnages, code)
        const exchange = ExchangeModule.init(tickers)

        const arbitrage = exchange.calculateArbitrage(342)
        res.json({ status: 200, message: arbitrage })
    } catch (err) {
        log(err)
    }
})

// AI prompting
app.get("/api/ai/:code", async (req, res) => {
    try {
        const exchanges = ['binance', 'okx', 'kraken', 'gate'];
        const symbols = ['BTC/USDT', 'ETH/USDT'];
        const promises = [];
        for (let i = 0; i < exchanges.length; i++) {
            const exchangeName = exchanges[i];
            promises.push(startExchange(exchangeName, symbols));
        }
        const responses = await Promise.all(promises);
        res.json({ responses })
    } catch (err) {
        log(err)
    }
})

app.get("/api/order-book/:code", async (req, res) => {
    try {
        const exchanges = ['binance', 'okx', 'kraken', 'gate'];
        const symbols = ['BTC/USDT', 'ETH/USDT'];
        const promises = [];
        for (let i = 0; i < exchanges.length; i++) {
            const exchangeName = exchanges[i];
            promises.push(binanceOrderBook(exchangeName, symbols));
        }
        const responses = await Promise.all(promises);
        res.json({ responses })
    } catch (err) {
        log(err)
    }
})

app.get("/api/trade/:code", async (req, res) => {
    try {
        const exchanges = ['okx', 'kraken', 'gate'];
        const symbols = ['BTC/USDT', 'ETH/USDT'];
        const promises = [];
        for (let i = 0; i < exchanges.length; i++) {
            const exchangeName = exchanges[i];
            promises.push(fetchTraderForSymbol(exchangeName, symbols));
        }
        const responses = await Promise.all(promises);
        res.json({ responses })
    } catch (err) {
        log(err)
    }
})

app.listen(PORT, () => { })
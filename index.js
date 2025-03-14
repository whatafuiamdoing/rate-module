import log from "ololog"
import express from "express"
import Rate from "./rate.js"
import ExchangeModule from "./exchange.js"
const PORT = 5123

import { binanceOrderBook, fetchTraderForSymbol, startExchange } from "./lib/ai.js"

const app = express()

app.use(express.json())

app.get("/api/rate/:code", async (req, res) => {
    try {
        const code = req.params.code
        const codes = ["TRX/SOL", "BTC/ETH", "BNB/ADA", "UNI/BTC"]
        const rates = await Promise.all(
            codes.map((symbol) => Rate(symbol))
        )
        // const rate = new RateModule(code)
        // log(code, rate)
        log(rates)
        res.json({ status: 200, message: rates })
    } catch (err) {
        log(err)
    }
})

app.get("/api/rate/exchanges/:code", async (req, res) => {
    try {
        const code = req.params.code
        const rate = RateModule.init(code)
        res.json({ status: 200, message: tickers })
    } catch (err) {
        log(err)
    }
})

app.get("/api/rate/arbitrage/exchanges/:code", async (req, res) => {
    try {
        const code = req.params.code
        const rate = RateModule.init(code)
        res.json({ status: 200, message: rate })
    } catch (err) {
        log(err)
    }
})

// AI prompting
app.get("/api/ai/:code", async (req, res) => {
    try {
        const exchanges = ['binance'];
        const symbols = ['TRX/USDT', 'SOL/USDT'];
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
        const exchanges = ['binance'];
        const symbols = ['TRX/USDT', 'SOL/USDT'];
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
        const exchanges = ["binance"];
        const symbols = ['TRX/USDT', 'SOL/USDT'];
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
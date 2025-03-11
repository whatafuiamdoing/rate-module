import log from "ololog"
import express from "express"
import RateModule from "./rate.js"
import ExchangeModule from "./exchange.js"
const PORT = 5123

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

app.listen(PORT, () => { })
// fees maker/taker
// amount base amount
export function calculateArbitrage(amount, fees = 0) {
    let limitBuy = null
    let limitSell = null

    Object.values(this.payload).forEach((ticker) => {
        if (!limitBuy || ticker.ask < limitBuy?.ask) {
            limitBuy = ticker
        }

        if (!limitSell || ticker.bid > limitSell?.bid) {
            limitSell = ticker
        }
    })
    console.log(limitSell, limitBuy)
    let rawArbPerc = ((limitSell.bid - limitBuy.ask) / limitBuy.ask) * 100

    // netArbPerc maker taker type + sell buy dif
    let units = (amount / limitBuy.ask) * (1 - fees)

    let limitOrderSell = units * limitSell.bid * (1 - fees)

    const profit = limitOrderSell - amount
    const profitPerc = (profit / amount) * 100

    return {
        buyExchange: limitBuy.id,
        sellExchange: limitSell.id,
        buyAsk: limitBuy.ask,
        sellBid: limitSell.bid,
        rawArbitragePercantage: rawArbPerc,
        units,
        limitOrderSell,
        profit,
        profitPercentage: profitPerc
    }
}
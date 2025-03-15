import cfg from "../config.js"


export function constructPayload(payload) {
    return {
        additionalKycVerifyFilter: 0,
        asset: "USDT",
        classifies: ["mass", "profession", "fiat_trade"],
        countries: [],
        fiat: payload.fiat_cc,
        filterType: "all",
        followed: false,
        page: 1,
        payTypes: [payload.method],
        periods: [],
        proMerchantAds: false,
        publisherType: "merchant",
        rows: 10,
        shieldMerchantAds: false,
        tradeWith: false,
        transAmount: payload.volume,
    };
}

export function computeOrderMetrics(orders) {
    let totalVolume = 0
    let totalPriceVolume = 0
    let bestPrice

    if (orders.length === 0) {
        return { totalVolume: 0, vwap: 0, bestPrice: 0 }
    }

    if (orders[0].tradeType === "SELL")
        bestPrice = Infinity
    else if (orders[0].tradeType === "BUY")
        bestPrice = -Infinity
    else {
        throw new Error("Unknown trade type")
    }

    for(const order of orders) {
        const price = parseFloat(order.price)
        const volume = parseFloat(order.surplusAmount)
        totalVolume += volume
        totalPriceVolume += price * volume
    
        if(order.tradeType === "SELL") 
            bestPrice = (price < bestPrice) ? price : bestPrice
        else if(order.tradeType === "BUY")
            bestPrice = (price > bestPrice) ? price : bestPrice
    }

    const vwap = totalPriceVolume / totalVolume
    
    return { totalVolume, vwap, bestPrice}
}

export async function fetchBinanceP2P(payload) {
    const url = cfg.binance_p2p_url
    console.log(payload)
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error(`Network error: ${res.status} ${res.statusText}`);
    }

    const formatResponse = (response) => {
        return response.data.map((id) => ({
            symbol: id.adv.asset + "/" + id.adv.fiatUnit,
            surplusAmount: id.adv.surplusAmount,
            maxSingleTransAmount: id.adv.maxSingleTransAmount,
            tradeType: id.adv.tradeType,
            minSingleTransAmount: id.adv.minSingleTransAmount,
            price: id.adv.price
        }))
    }

    const data = await res.json()

    return formatResponse(data)
}
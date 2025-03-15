import cfg from "../config.js"

export async function fetchFxConversionRates(symbol) {
    const [base, quote] = symbol.split("/")
    
    let endpoint = `&from_currency=${base}&to_currency=${quote}&apikey=${cfg.alpha_api_key}`
    let url = (cfg.fx_url) + endpoint
    
    const result = await fetch(url)
    const ticker = await result.json()
    
    const normalize = (ticker) => {
        const obj = ticker['Realtime Currency Exchange Rate']
        
        return {
            id: "Forex",
            symbol,
            rate: obj["5. Exchange Rate"],
            bid: obj["8. Bid Price"],
            ask: obj["9. Ask Price"]
        }
    }

    return normalize(ticker)
}

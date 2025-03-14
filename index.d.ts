// index.d.ts

/**
 * Configuration options for the Rate library.
 */
export interface Config {
    /**
     * List of exchange IDs (as strings) to be used in fetching ticker data.
     */
    exchanges: string[];
  }
  
  /**
   * Represents the ticker data fetched from an exchange.
   */
  export interface Ticker {
    id: string;
    symbol: string;
    vwap: number;
    bid: number;
    ask: number;
    last: number;
    quote: number;
  }
  
  /**
   * An object mapping exchange IDs to their respective ticker data.
   */
  export interface MultiExchangeTickers {
    [exchangeId: string]: Ticker;
  }
  
  /**
   * The RateInstance interface represents the final computed rate information for a synthetic pair.
   */
  export interface RateInstance {
    /**
     * The synthetic pair, e.g., "UNI/BTC".
     */
    syntheticPair: string;
    /**
     * The base symbol, e.g., "UNI/USDT".
     */
    baseSymbol: string;
    /**
     * The quote symbol, e.g., "BTC/USDT".
     */
    quoteSymbol: string;
    /**
     * The computed base rate based on aggregated exchange data.
     */
    baseRate: number;
    /**
     * The fetched quote rate from the designated exchange.
     */
    quoteRate: number;
    /**
     * The computed synthetic rate (typically, baseRate divided by quoteRate).
     */
    syntheticRate: number;
    /**
     * (Optional) The raw ticker data from exchanges if extended mode is enabled.
     */
    rates?: MultiExchangeTickers;
  }
  
  /**
   * Asynchronously creates and initializes a Rate instance for a given synthetic pair.
   *
   * @param pair - The synthetic pair, e.g., "UNI/BTC".
   * @param extended - If true, the returned object includes the raw `rates` property.
   * @param cfg - Optional configuration object; defaults to the library’s built-in configuration.
   * @returns A promise that resolves to a fully initialized RateInstance.
   *
   * @example
   * import Rate from 'your-library';
   *
   * async function main() {
   *   const rate = await Rate("UNI/BTC");
   *   console.log(rate.baseRate, rate.quoteRate, rate.syntheticRate);
   * }
   * main();
   */
  export default function Rate(
    pair: string,
    extended?: boolean,
    cfg?: Config
  ): Promise<RateInstance>;
  
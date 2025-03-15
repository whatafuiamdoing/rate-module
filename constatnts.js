"use strict";

const FiatCurrencyCodes = new Set([
    "UAH", "USD", "EUR", "GBP", "CAD", "CHF", "CZK", "PLN",
    "GEL", "HKD", "HUF", "IDR", "JPY", "KZT", "KRW", "RON",
    "SEK", "VND", "XCD", "TRY"
]);

/**
 * Checks if the provided currency code is fiat.
 * @param {string} code - Currency code.
 * @returns {boolean} True if the code is fiat.
 */
function isFiat(code) {
    return FiatCurrencyCodes.has(code);
}

const constants = {
    FiatCurrencyCodes: FiatCurrencyCodes,
    isFiat: isFiat
};

Object.freeze(constants);

export { constants }
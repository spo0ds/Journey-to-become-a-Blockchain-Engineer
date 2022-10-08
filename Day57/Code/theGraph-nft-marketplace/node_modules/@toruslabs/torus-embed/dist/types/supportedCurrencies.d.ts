/**
 * From https://min-api.cryptocompare.com/data/v2/pair/mapping/fsym?fsym=BTC&extraParams=YourSite
 * GET https://min-api.cryptocompare.com/data/v2/pair/mapping/fsym?fsym=BTC
 * Then map over returned entries, picking tsym
 *
 * Last updated: Date of commit
 */
export declare const CRYPTO_COMPARE_CURRENCIES: string[];
/**
 * Fiat currencies that we support
 */
export declare function supportedFiatCurrencies(provider: any): any;

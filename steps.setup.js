
const compositions = {

  // ******************
  // MODIFY BELOW ONLY
  // 

  BINANCE: {
    mild_bear: {
      compo: {
        STRAT_BTC_USD_FUNDING_8H_1: 0.15,
        STRAT_ETH_USD_FUNDING_8H_1: 0.15,
        STRAT_BTC_ETH_USD_H_1: 0.7,
      },
      leverage: 1.0,
      botOnly: true,
    },
    mild_bull: {
      compo: {
        STRAT_BTC_USD_FUNDING_8H_1: 0.25,
        STRAT_ETH_USD_FUNDING_8H_1: 0.25,
        STRAT_BTC_ETH_USD_H_1: 0.5,
      },
      leverage: 1.5,
      botOnly: true,
    },
    extreme: {
      compo: {
        STRAT_ETH_USD_H_3_V2: 0.4,
        STRAT_BTC_USD_H_3_V2: 0.4,
        STRAT_BTC_ETH_USD_H_1: 0.2,
      },
      leverage: 1.0,
      botOnly: true,
    },
  },
  BITFINEX: {
    mild_bear: {
      compo: {
        STRAT_BTC_USD_FUNDING_8H_1: 0.15,
        STRAT_ETH_USD_FUNDING_8H_1: 0.15,
        STRAT_BTC_ETH_USD_H_1: 0.7,
      },
      leverage: 1.0,
      botOnly: true,
    },
    mild_bull: {
      compo: {
        STRAT_BTC_USD_FUNDING_8H_1: 0.25,
        STRAT_ETH_USD_FUNDING_8H_1: 0.25,
        STRAT_BTC_ETH_USD_H_1: 0.5,
      },
      leverage: 1.5,
      botOnly: true,
    },
    extreme: {
      compo: {
        STRAT_ETH_USD_H_3_V2: 0.4,
        STRAT_BTC_USD_H_3_V2: 0.4,
        STRAT_BTC_ETH_USD_H_1: 0.2,
      },
      leverage: 1.0,
      botOnly: true,
    },
  },

  /**
   *  Remove the double-slashes // in front of your exchange to start editing it.
   *  You may as well copy/paste the configuration from one of the examples above to start with.
   */

  // BITSTAMP: {},
  // KRAKEN: {},
  // BITMEX: {},
  // PHEMEX: {},
  // OKEX: {},
  // BITPANDA: {}

  // 
  // MODIFY ABOVE ONLY
  // ******************
}

/**
 * See below all available strategies labels and their respective codes
* NapoX BCH LO daily (STRAT_BCH_USD_LO_D_1)
* NapoX medium term TF BTC LO (STRAT_BTC_USD_D_3)
* NapoX medium term TF EOS LO (STRAT_EOS_USD_D_2)
* NapoX medium term TF ETH LO (STRAT_ETH_USD_D_3)
* NapoX medium term TF LTC LO (STRAT_LTC_USD_D_1)
* NapoX medium term TF XRP LO (STRAT_XRP_USD_D_1)
* NapoX alloc ETH/BTC/USD AR hourly (STRAT_BTC_ETH_USD_H_1)
* NapoX BNB LO daily (STRAT_BNB_USD_LO_D_1)
* NapoX alloc ETH/BTC/USD LO daily (STRAT_BTC_ETH_USD_LO_D_1)
* NapoX alloc ETH/BTC/USD LO hourly (STRAT_BTC_ETH_USD_LO_H_1)
* NapoX ETH Volume AR daily (STRAT_ETH_USD_VOLUME_H_1)
* NapoX BTC Volume AR daily (STRAT_BTC_USD_VOLUME_H_1)
* NapoX BTC Funding AR hourly (STRAT_BTC_USD_FUNDING_8H_1)
* NapoX ETH Funding AR hourly (STRAT_ETH_USD_FUNDING_8H_1)
* NapoX ETH Ultra flex AR hourly (STRAT_ETH_USD_H_3_V2)
* NapoX BTC Ultra flex AR hourly (STRAT_BTC_USD_H_3_V2)
* NapoX alloc ETH/BTC/USD AR daily (STRAT_BTC_ETH_USD_D_1_V2)
* NapoX BTC AR daily (STRAT_BTC_USD_D_2_V2)
* NapoX ETH AR daily (STRAT_ETH_USD_D_2_V2)
* NapoX ETH AR hourly (STRAT_ETH_USD_H_4_V2)
* NapoX BTC AR hourly (STRAT_BTC_USD_H_4_V2)
 */


// Dynamic params that yous set in the "params" section above the code section
return {
  email: params.NAPBOTS_EMAIL,
  password: params.NAPBOTS_PASSWORD,
  // testMode: params.TEST_MODE,
  compositions
}

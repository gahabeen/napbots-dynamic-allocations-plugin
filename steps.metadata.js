const axios = require('axios');
// Axios wrapper to easily handle response/error
const ask = async (options) => axios(options).then(({ data }) => ({ success: true, ...data })).catch(err => {
  console.error(err)
  return { success: false }
})

if (!$checkpoint) $checkpoint = { metadata: {}, users: {} }
if (!$checkpoint.metadata) $checkpoint.metadata = {}
if (!$checkpoint.users) $checkpoint.users = {}

const ONE_DAY = 24 * 60 * 60 * 1000
const cacheHasExpired = !$checkpoint.metadata.cachedAt || ($checkpoint.metadata.cachedAt + ONE_DAY) < new Date().getTime()

console.log('cacheHasExpired', cacheHasExpired)

if (cacheHasExpired) {

  // Set cached timestamp
  $checkpoint.metadata.cachedAt = new Date().getTime()

  // Update exchanges
  const exchangesResponse = await ask({ url: 'https://middle.napbots.com/v1/exchange' })
  if (exchangesResponse.success) {
    $checkpoint.metadata.exchanges = (exchangesResponse.data ?? []).reduce((acc, exchange) => {
      acc[exchange.code] = exchange
      return acc
    }, {})
  }

  // Update strategies by exchanges
  for (let exchangeKey of Object.keys($checkpoint.metadata.exchanges)) {
    const strategiesResponse = await ask({ url: 'https://middle.napbots.com/v1/exchange/available-strategies/' + exchangeKey })
    if (strategiesResponse.success) {
      $checkpoint.metadata.exchanges[exchangeKey].strategies = (strategiesResponse.data ?? []).reduce((acc, strategy) => {
        acc[strategy.code] = strategy
        return acc
      }, {})

      $checkpoint.metadata.exchanges[exchangeKey].strategiesRecap = (strategiesResponse.data ?? []).reduce((text, strategy) => {
        return text + `${strategy.label} (${strategy.code}) \n`
      }, "")
    }
  }

} else {
  console.log("Using $checkpoint cached at ", new Date($checkpoint.metadata.cachedAt).toISOString())
}

/**
 * Based on https://github.com/PierrickI3/napbots by @PierrickI3
 * Which is originally based on a gist from @julienarcin (https://gist.github.com/julienarcin/af2727307de2fd37d6a72973eafdbfc9)
 */

const axios = require('axios');
const deepEqual = require('lodash.isequal')

// Axios wrapper to easily handle response/error
const ask = async (options) => axios(options).then(({ data }) => ({ success: true, ...data })).catch(err => {
  console.error(err)
  return { success: false }
})

// Set the params in the previous code editor
const { email, password, testMode, compositions } = steps.setup.$return_value
let output = {
  exchanges: {}
}

// Fetches NAPBOTS METADATA (DAILY CACHED LAYER)
const metadata = $checkpoint.metadata

const WEATHER_INDICATOR = {
  extreme: "Extreme markets",
  mild_bull: "Mild bull markets",
  mild_bear: "Mild bear or range markets"
}

const endpoints = {
  LOGIN: 'https://middle.napbots.com/v1/user/login',
  ME: 'https://middle.napbots.com/v1/user/me',
  CRYPTO_WEATHER: 'https://middle.napbots.com/v1/crypto-weather',
  ACCOUNT: 'https://middle.napbots.com/v1/account/for-user/'
}

// Check NapBots Availibility
const available = await ask({ url: endpoints.CRYPTO_WEATHER })
if (!available.success) {
  // IF NAPBOTS seem OFF, STOP
  // Could be because of a maintenance
  const errorMsg = `NapBots API needs to be available to go any further.`
  console.error(errorMsg)
  output.error = errorMsg
}

const checkStrategyByExchange = (exchangeCode, strategyCode, strategy) => {
  const exchange = metadata.exchanges[exchangeCode]
  const availableStrategiesCodes = Object.keys(metadata.exchanges[exchangeCode].strategies)
  // Check composition
  const composition = strategy?.compo
  const compositionCodes = Object.keys(composition)
  const unavailableStrategiesCodes = compositionCodes.filter(code => !availableStrategiesCodes.includes(code))
  // console.log('availableStrategiesCodes', availableStrategiesCodes)
  // console.log('compositionCodes', compositionCodes)
  // console.log('unavailableStrategiesCodes', unavailableStrategiesCodes)
  if (unavailableStrategiesCodes.length > 0) {
    const errorMsg = `It seems like your using unavailable strategies (${unavailableStrategiesCodes.join(', ')}) for the exchange ${exchangeCode}.`
    console.error(errorMsg)
    output.error = errorMsg
    return false
  }
  // Check composition percentage
  const compositionPercentage = +Object.values(composition).reduce((total, percentage) => total + percentage, 0).toFixed(2)
  if (compositionPercentage > 1) {
    const errorMsg = `The percentage for your strategy ${strategyCode} in ${exchangeCode} is higher than 100% (${compositionPercentage * 100}%)`
    console.error(errorMsg)
    output.error = errorMsg
    return false
  }
  // Check leverage
  const validLeverage = strategy.leverage.toFixed(2) <= exchange.maxLeverage
  if (!validLeverage) {
    const errorMsg = `The leverage for your strategy ${strategyCode} in ${exchangeCode} is higher than ${strategy.leverage * 100}% (${exchange.maxLeverage * 100}%)`
    console.error(errorMsg)
    output.error = errorMsg
    return false
  }
  return true
}

const compositionsAreValid = Object.keys(compositions).reduce((valid, exchange) => {
  const strategiesCodes = Object.keys(compositions[exchange])
  const containsRequiredStrategies = Object.keys(WEATHER_INDICATOR).every(code => strategiesCodes.includes(code))
  const missingRequiredStrategies = Object.keys(WEATHER_INDICATOR).filter(code => !strategiesCodes.includes(code))
  if (!containsRequiredStrategies) {
    console.error(`Following strategies are missing for ${exchange}: ${missingRequiredStrategies.join(', ')}`)
  }
  const strategiesValidated = strategiesCodes.every(strategyCode => checkStrategyByExchange(exchange, strategyCode, compositions[exchange][strategyCode]))
  return valid && containsRequiredStrategies && strategiesValidated
}, true)

if (!compositionsAreValid) {
  // IF INVALID COMPOSITION, STOP
  const errorMsg = `Valid compositions are required to go any further.`
  console.error(errorMsg)
  output.error = errorMsg
  return output
}

const getCryptoWeater = async () => {
  const { success, data } = await ask({
    url: endpoints.CRYPTO_WEATHER
  });

  if (!success) {
    console.error('No weather information found.');
    return;
  }

  console.log('Current weather:', data?.weather?.weather);

  return data?.weather?.weather;
};

const getAuthToken = async () => {

  let { success, data } = await ask({
    url: endpoints.LOGIN,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      email,
      password,
    },
  })

  const authToken = data?.accessToken

  if (!success || !authToken) {
    console.error('No Auth Token');
    return;
  }

  console.log(`Logged in`)

  return authToken
};

const getUserId = async (token) => {

  if ($checkpoint.users?.[email]?.id) {
    return $checkpoint.users?.[email]?.id
  }

  if (!$checkpoint.users?.[email]) {
    $checkpoint.users[email] = { id: null }
  }

  const { success, data } = await ask({ url: endpoints.ME, headers: { 'Host': 'middle.napbots.com', token, } })

  const userId = data?.userId

  if (!success || !userId) {
    console.error('No User ID')
    return
  }

  $checkpoint.users[email].id = userId

  return userId
}

const getCurrentAllocations = async (authToken) => {
  let { success, data } = await ask({
    url: endpoints.ACCOUNT + userId,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      token: authToken,
    },
  });

  if (!success) {
    console.error(`Couldn't get the current bot allocations`);
    return;
  }

  const currentAllocations = data ?? []

  console.log('currentAllocations', currentAllocations)

  // Rebuild exchanges array
  let exchanges = [];
  for (let currentAllocation of currentAllocations) {
    if (!currentAllocation.accountId || !currentAllocation.compo || !currentAllocation.tradingActive) {
      continue; // Next
    }
    exchanges.push({
      id: currentAllocation.accountId,
      code: currentAllocation.exchange,
      compo: currentAllocation.compo,
    });
  }

  console.log(`Current allocations by exchange:`, exchanges)

  return exchanges;
};

const weather = await getCryptoWeater();
if (!weather) {
  // IF NO WEATHER FOUND, STOP
  // Could be because of a maintenance of the website or a modification of the API
  const errorMsg = `Weather informations are required to go any further.`
  console.error(errorMsg)
  output.error = errorMsg
  return output
}

let compositionToSet = {}

for (let exchangeCode of Object.keys(compositions)) {
  switch (weather) {
    case WEATHER_INDICATOR.extreme:
      compositionToSet[exchangeCode] = compositions[exchangeCode].extreme;
      break;
    case WEATHER_INDICATOR.mild_bull:
      compositionToSet[exchangeCode] = compositions[exchangeCode].mild_bull;
      break;
    case WEATHER_INDICATOR.mild_bear:
      compositionToSet[exchangeCode] = compositions[exchangeCode].mild_bear;
      break;
    default:
      console.error('Unknown weather condition:', weather);
      return;
  }
}

// console.log('compositionToSet', compositionToSet)

console.log('Authenticating...');
const authToken = await getAuthToken();
if (!authToken) {
  // IF LOGIN FAILED, STOP
  // Could be because of a typo in your login/password or a modification in the API
  const errorMsg = `Authentication is required to go any further.`
  console.error(errorMsg)
  output.error = errorMsg
  return output
}

const userId = await getUserId(authToken);
if (!userId) {
  // IF User isn't accessible, STOP
  const errorMsg = `User data required to be available to go any further.`
  console.error(errorMsg)
  output.error = errorMsg
  return output
}

const userExchanges = await getCurrentAllocations(authToken);
if (!Array.isArray(userExchanges)) return

// For each exchange, update allocation if different from the current crypto weather
for (let userExchange of userExchanges) {
  const userExchangeCode = userExchange.code
  output.exchanges[userExchangeCode] = {}

  const userExchangeCompositionToSet = compositionToSet[userExchangeCode]
  output.exchanges[userExchangeCode].update = false;

  // If leverage different, set to update
  if (userExchange.compo.leverage.toFixed(2) !== userExchangeCompositionToSet.leverage.toFixed(2)) {
    console.log('=> Leverage is different');
    output.exchanges[userExchangeCode].update_reason = "Updating because leverage is different"
    output.exchanges[userExchangeCode].update = true;
  }

  // If composition different, set to update
  let equalCompos = deepEqual(userExchange.compo.compo, userExchangeCompositionToSet.compo);
  if (!equalCompos) {
    console.log('=> Compositions are different');
    output.exchanges[userExchangeCode].update_reason = "Updating because compositions are different"
    output.exchanges[userExchangeCode].update = true;
  }

  // Rebuild string for composition
  const data = {
    botOnly: userExchangeCompositionToSet.botOnly,
    compo: {
      leverage: userExchangeCompositionToSet.leverage.toFixed(2),
      compo: userExchangeCompositionToSet.compo,
    },
  };

  // Make the updated data available to the other steps
  output.exchanges[userExchangeCode].data = data

  // If composition different, update allocation for this exchange
  if (output.exchanges[userExchangeCode].update) {
    
    // Uncomment to activate the test mode feature
    // if (!testMode) {
    console.log('Updating allocation to:', data, 'for', userExchange);
    const { success } = await ask({
      url: 'https://middle.napbots.com/v1/account/' + userExchange.id,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        token: authToken,
      },
      data,
    });
    if (success) {
      console.log('Success!');
      output.exchanges[userExchangeCode].update_success = true
    } else {
      const errorMsg = `Couldn't update the allocation. Check out the logs.`
      console.error(errorMsg)
      output.exchanges[userExchangeCode].error = errorMsg
      output.exchanges[userExchangeCode].update_success = false
    }
    // } else {
    //   console.log("[Test Mode] Updating allocation to:", data, 'for', userExchange)
    // }
  } else {
    console.log('No updates are necessary.');
  }
}

return output

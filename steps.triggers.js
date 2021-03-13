
const output = steps.allocator.$return_value

if (output.error) {
  $send.email({
    subject: "[Error] Napbots - Dynamic Allocations",
    html: `<p>The dynamic allocation failed before to be able to try to update it with the following error: <b>"${output.error}"</b></p>
    <p><a href="https://pipedream.com/@${steps.trigger.context.owner_id}/${steps.trigger.context.workflow_id}">Check out your logs here.</a></p>
    <br><br><br><br><br>`
  });
}

let hasUpdateOrFailure = false

for (let exchangeCode of Object.keys(output?.exchanges)) {
  const exchange = output?.exchanges?.[exchangeCode]
  hasUpdateOrFailure = hasUpdateOrFailure || exchange.update || !!exchange.error
}

// console.log('hasUpdateOrFailure', hasUpdateOrFailure)

if (hasUpdateOrFailure) {
  $send.email({
    subject: "[Update] Napbots - Dynamic Allocations",
    html: `<p>The weather forecast did not imply an update of your napbots.</p>
<p>Here follows your report:</p>

${Object.keys(output?.exchanges).map(exchangeCode => {
  const exchange = output?.exchanges?.[exchangeCode]
  return `
    <h2>${exchangeCode}</h2>
    <h3>Status:</h3>
    ${exchange.update ? 'Updated' : 'No update required'} [${exchange.update_reason || exchange.error || 'Success'}]
    <h3>Leverage</h3>
    ${exchange.data.compo.leverage}
    <h3>Bot only</h3>
    ${exchange.data.botOnly ? "Yes" : 'No'}
    <h3>Allocations</h3>
    <table style="text-align:left;">
      <thead>
        <tr>
          <th style="padding:5px 10px 5px 0;">Strategy</th>
          <th style="padding:5px 0 5px 10px;">Percentage</th>
        </tr>
      </thead>
      <tbody>
        ${Object.keys(exchange.data.compo.compo).map(stratCode => `
          <tr>
            <td style="padding:5px 10px 5px 0;">${stratCode}</td>
            <td style="padding:5px 0 5px 10px;">${exchange.data.compo.compo[stratCode] * 100}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}).join('')}

<p><a href="https://pipedream.com/@${steps.trigger.context.owner_id}/${steps.trigger.context.workflow_id}">Check out your logs here.</a></p>
<br><br><br><br><br>`
  });
} 

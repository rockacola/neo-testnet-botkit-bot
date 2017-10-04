const NeoHelper = require('../utils/neo-helper')
const Profiles = require('../utils/profiles')
const Neon = require('neon-js')

const VERSION = require('../package.json').version
const CMD_MSG_HANDLER = 'testnet'
const WHITELIST_CHANNELS = [
  'C7ALUBNMQ', // lorem-test #general
  'G66LK87KQ', // neosmarteconomy #_develop
]
const HELP_TEXT = `
I will respond to the following commands:
\`help\` - to see this message.
\`version\` - to see version of this Slack bot.
\`height\` - to output current blockchain height.
\`wallet\` - to output this bot's wallet information.
\`send <address> <quantity> <asset-name>\` - to make a transfer from bot's account. 'asset name' can be either 'Neo' or 'Gas'.
`
  
module.exports = (controller) => {

  //*********************************************
  // Implement message handlers
  //*********************************************
  
  let msg_version = (bot, message) => {
    bot.startConversationInThread(message, (err, convo) => {
      convo.say(`Version: \`${VERSION}\``)
    })
  }

  let msg_help = (bot, message) => {
    bot.startConversationInThread(message, (err, convo) => {
      convo.say(`${HELP_TEXT}`)
    })
  }
  
  let msg_height = (bot, message) => {
    bot.startConversationInThread(message, (err, convo) => {
      convo.say('Fetching block height...')
      Neon.getWalletDBHeight(Profiles.Blockchains.CityOfZionTestNet)
        .then((height) => {
          convo.say(`Block height: \`${height}\``)
        })
    })
  }
  
  let msg_wallet = (bot, message) => {
    bot.startConversationInThread(message, (err, convo) => {
      convo.say('Fetching wallet information...')
      Neon.getBalance(Profiles.Blockchains.CityOfZionTestNet, Profiles.Wallets.WalletPiccolo.Address)
        .then((balanceObj) => {
          convo.say(`Bot wallet: \`${Profiles.Wallets.WalletPiccolo.Address}\` Balance: \`${balanceObj.Neo.toString()} NEO\` and \`${balanceObj.Gas.toString()} GAS\` `)
        })
    })
  }
  
  let msg_send = (bot, message, args) => {
    let depositAddress = args[0]
    let assetAmount = parseFloat(args[1])
    let assetName = args[2]

    bot.startConversationInThread(message, (err, convo) => {
      // Validation and sanitization
      if (!NeoHelper.IsValidAddress(depositAddress)) {
        convo.say(`The provided deposit address is invalid.`)
        return
      }
      assetName = NeoHelper.SanitizeAssetName(assetName)
      if (!assetName) {
        convo.say(`The provided asset name is invalid.`)
        return
      }
      if (!NeoHelper.IsValidAmount(assetName, assetAmount)) {
        convo.say(`The provided amount is invalid.`)
        return
      }

      // Act
      let url = Profiles.Blockchains.CityOfZionTestNet;
      let fromSecret = Profiles.Wallets.WalletPiccolo.Secret;
      convo.say(`Sending \`${assetAmount} ${assetName}\` to \`${depositAddress}\`...`)
      Neon.doSendAsset(url, depositAddress, fromSecret, assetName, assetAmount)
        .then((res) => {
          console.log('doSendAsset response:', res)
          if (res.result) {
            convo.say('Transaction succeeded.')
          } else {
            convo.say('Transaction appears to be rejected.')
          }
        })
        .catch((err2) => {
          console.log('doSendAsset error:', err2)
          convo.say('Transacton execution error.')
        })
    })
  }
  
  //*********************************************
  // Bootstrap message handlers
  //*********************************************
  
  controller.hears([`${CMD_MSG_HANDLER} (.*)`], 'ambient', (bot, message) => {
    console.log('/testnet triggered.')

    // Validate application-level permission
    if (WHITELIST_CHANNELS.length > 0 && (WHITELIST_CHANNELS.indexOf(message.channel) === -1)) { // Pass, if whitelist is empty
      console.log('Permission denied. team:', message.team, 'channel:', message.channel, 'user:', message.user)
      return
    }
    
    // Validate input arguments
    let args = message.match[1].trim().split(/\s+/)
    if (!args || args.length === 0) {
      return
    }
    let cmd = args[0]
    args.shift()
    console.log('cmd:', cmd, 'args:', args)
    
    //TODO: act
    if (cmd === 'version') {
      msg_version(bot, message)
    } else if (cmd === 'help') {
      msg_help(bot, message)
    } else if (cmd === 'height') {
      msg_height(bot, message)
    } else if (cmd === 'wallet') {
      msg_wallet(bot, message)
    } else if (cmd === 'send') {
      msg_send(bot, message, args)
    }
  })
  
}

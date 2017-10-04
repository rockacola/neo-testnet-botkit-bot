# NEO Testnet Bot

Slack bot uses [Slapp][https://github.com/howdyai/botkit] library and interacts with NEO Testnet blockchain. This repo is designed to drop fit into [Botkit Studio](https://studio.botkit.ai/).

## Setup Instructions

### Slack App

You'll want to enable **Event Subscriptions** on your Slack App using the `URL` provided and add subscriptions for the following **Bot Events**:

+ `message.channels`
+ `message.im`

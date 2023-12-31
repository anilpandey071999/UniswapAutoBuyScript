# Uniswap Auto Buy Script
## Overview
This is a script developed to automatically buy tokens from Uniswap V2 when liquidity is added. It utilizes Node.js and Ethereum's Web3 library (ethers.js) to interact with the Ethereum blockchain and Uniswap's smart contracts.

## Prerequisites
* [Node.js](https://nodejs.org/en/download)
* [npm](https://docs.npmjs.com/getting-started) (usually comes with Node.js)
* An Ethereum wallet with its private key
* [Infura](https://app.infura.io/register) account or other Ethereum JSON RPC provider

## Installation
To use this script, you need to have Node.js installed on your machine. Once Node.js is installed, you can clone this repository and install the dependencies.

```
git clone https://github.com/anilpandey071999/UniswapAutoBuyScript.git
cd UniswapAutoBuyScript
npm install
```
## Configuration
In the script, you need to set the private key of your Ethereum wallet, the provider, the addresses of the tokens you want to buy, and the number of buys per run.

To find the liquidity for the tokens, you can follow this [link](https://pancakeswap.finance/v2/add/0x28cb013caAB2FAD79a339406d65d3c09F49f918C/0xA1F299674e75eB1CDF1b8332cF26E3211bE70ce9?chain=bscTestnet).

## Usage
Once everything is set up, you can start the script by running:
```
node app.js
```
This will start the script, and it will check for added liquidity every minute. If liquidity is added, the script will execute the desired amount of buy transactions.
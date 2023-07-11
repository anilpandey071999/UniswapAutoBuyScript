// Import required modules
const express = require("express");
const app = express();
const port = 3000;
const cron = require("node-cron");
const ethers = require("ethers");
const routherAbi = require("./Routher_ABI.json"); // PancakeSwap Router ABI
const ERC20Abi = require("./ERC20.json"); // ERC20 Token ABI
const dotenv = require('dotenv')
dotenv.config();
const {RPC_URL, PRIVATE_KEY} = process.env

// Define wallet and provider
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Define variables to track token balances
let balanceOfToken1 = 0;
let balanceOfToken2 = 0;

// Define contract addresses
const routerAddress = "0xd99d1c33f9fc3444f8101754abc46c52416550d1";
const pancakePairAddress = "0xc5B4a9bD23E19228b317f5CB8E36175d7562c1Ed";
const token1Address = "0xA1F299674e75eB1CDF1b8332cF26E3211bE70ce9";
const token2Address = "0x28cb013caAB2FAD79a339406d65d3c09F49f918C";

// Create contract instances
const routherContract = new ethers.Contract(routerAddress, routherAbi, wallet);
const Token1 = new ethers.Contract(token1Address, ERC20Abi, wallet);
const Token2 = new ethers.Contract(token2Address, ERC20Abi, wallet);

// Function to update and return current token balances
async function updateTokenBalance() {
    const token1Promise = Token1.balanceOf(pancakePairAddress);
    const token2Promise = Token2.balanceOf(pancakePairAddress);

    const [token1CurrentBalance, token2CurrentBalance] = (
        await Promise.all([token1Promise, token2Promise])
    ).map((value) => ethers.formatEther(value));

    // console.log(token1CurrentBalance, token2CurrentBalance);

    return { token1CurrentBalance, token2CurrentBalance }
}

// Function to buy tokens
async function buyToken() {
    try {
        const numberOfBuys = 5;

        const { token1CurrentBalance, token2CurrentBalance } = await updateTokenBalance();
        // Initialize balances
        if (balanceOfToken1 === 0 && balanceOfToken2 === 0) {
            console.log("true");
            balanceOfToken1 = token1CurrentBalance;
            balanceOfToken2 = token2CurrentBalance;
        }
        
        let amountOut = ethers.parseEther("1.2");
        let amountInMax = ethers.parseEther("0.9");
        let path = [token1Address, token2Address];
        let to = wallet.address;

        // Check if token balances increased
        if (balanceOfToken1 < token1CurrentBalance && balanceOfToken2 < token2CurrentBalance) {
            for (let i = 0; i < numberOfBuys; i++) {
                const amounts = await routherContract.getAmountsIn(amountOut, [
                    token1Address,
                    token2Address,
                ]);

                // Update amountInMax if it's lower than the required amount
                if (amountInMax < amounts[0]) {
                    amountInMax = amounts[0];
                }

                // Check allowance and approve if it's not enough
                const checkAllowance = await Token1.allowance(
                    wallet.address,
                    routerAddress
                );
                if (
                    ethers.formatEther(checkAllowance) < ethers.formatEther(amountInMax)
                ) {
                    const getAprovel = await Token1.approve(routerAddress, amountInMax);
                    await getAprovel.wait();
                    console.log("checkAllowance:- ", getAprovel);
                }
                
                // Execute swap transaction
                const tx = await routherContract.swapTokensForExactTokens(
                    amountOut,
                    amountInMax, // amountOutMin: we can set to 0 for simplicity
                    path, // path: from WETH to the token
                    to, // recipient
                    Math.floor(Date.now() / 1000) + 60 * 20 // deadline: using 'now' + 20min
                );
                console.log(`Transaction ${i} hash: ${tx.hash}`);
            }
            
            // Update balances after buying tokens
            const { token1CurrentBalance, token2CurrentBalance } = updateTokenBalance();
            balanceOfToken1 = token1CurrentBalance;
            balanceOfToken2 = token2CurrentBalance;
        }
    } catch (error) {
        console.log(error);
    }
}

// Execute buyToken function initially
buyToken();

// Schedule the buyToken function to run every minute
cron.schedule("*/1 * * * *", () => {
    buyToken(balanceOfToken1, balanceOfToken2).catch(console.error);
});

// Start Express server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

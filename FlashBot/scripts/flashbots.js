const { FlashbotsBundleProvider } = require("@flashbots/ethers-provider-bundle")
const { ethers } = require("hardhat")
require("dotenv").config({ path: ".env" })

async function main() {
    // deploying NFT contract
    const RandomNftFactory = await ethers.getContractFactory("RandomNft")
    const RandomNft = await RandomNftFactory.deploy()
    RandomNft.deployed()

    console.log(`Random NFT deployed at: ${RandomNft.address}`)

    // creating a websocket provider
    const provider = new ethers.providers.WebSocketProvider(
        process.env.GOERLI_WEBSOCKET_URL,
        "goerli"
    )

    // create a wallet from the private key connected to the provider
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

    // Create a Flashbots Provider which will forward the request to the relayer
    // Which will further send it to the flashbot miner
    // reason why we created a WebSocket provider this time is because we want to create a socket to listen to every new block that comes in Goerli network
    // the client opens a connection with the WebSocket server once, and then the server continuously sends them updates as long as the connection remains open. Therefore the client does not need to send requests again and again.

    // HTTP Providers, as we had been using previously, work on a request-response model, where a client sends a request to a server, and the server responds back

    // all the miners in Goerli are not flashbot miners, therefore we listen for each block and send request in each block
    // so that when the coinbase miner is flashbot miner, our transaction gets executed
    const flashbotsProvider = await FlashbotsBundleProvider.create(
        provider,
        signer,
        // URL for the flashbots relayer
        "https://relay-goerli.flashbots.net",
        "goerli"
    )

    provider.on("block", async (blockNumber) => {
        console.log(`Block Number: ${blockNumber}`)
        // sending a bundle of transactions to the flashbot relayer

        // getting a response doesn't guarantee that our bundle will get included in the next block or not
        // To check if it will get included in the next block or not you can use bundleResponse.wait()
        const bundleResponse = await flashbotsProvider.sendBundle(
            [
                {
                    transaction: {
                        chainId: 5,
                        // Post-London Upgrade gas model EIP-1559
                        type: 2,
                        value: ethers.utils.parseEther("0.01"),
                        to: RandomNft.address,
                        // function selector in the data field
                        data: RandomNft.interface.getSighash("mint()"),
                        maxFeePerGas: ethers.BigNumber.from(10).pow(9).mul(3),
                        maxPriorityFeePerGas: ethers.BigNumber.from(10).pow(9).mul(2),
                    },

                    signer: signer,
                },
            ],
            // We want the transaction to be mined in the next block
            blockNumber + 1
        )

        if ("error" in bundleResponse) {
            console.log(bundleResponse.error.message)
        }
    })
}

main()

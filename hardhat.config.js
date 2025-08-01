require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    etherlink: {
      url: "https://node.ghostnet.etherlink.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 128123,
    },
  },
  etherscan: {
    apiKey: {
      etherlink: "no-api-key-needed",
    },
    customChains: [
      {
        network: "etherlink",
        chainId: 128123,
        urls: {
          apiURL: "https://testnet-explorer.etherlink.com/api",
          browserURL: "https://testnet-explorer.etherlink.com",
        },
      },
    ],
  },
};


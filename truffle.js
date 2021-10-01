const HDWalletProvider = require("@truffle/hdwallet-provider");

require('dotenv').config();

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*'
    },
    testnet: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, process.env.NETWORK_URL),
      network_id: process.env.NETWORK_ID,
      skipDryRun: true,
      timeoutBlocks: 200,
      confirmations: 1,
      networkCheckTimeout: 1000000,
      deploymentPollingInterval: 10000
    },
    bsc: {
      provider: () => new HDWalletProvider(process.env.MNEMONIC, `https://bsc-dataseed1.binance.org`),
      network_id: 56,
      confirmations: 10,
      timeoutBlocks: 200,
      skipDryRun: true
    },
  },
  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
    // parallel: true
  },
  // Configure your compilers
  compilers: {
    solc: {
      version: "^0.8.4",
      settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: false,
          runs: 200
        },
        evmVersion: "byzantium"
      }
    }
  },
  db: {
    enabled: false
  },
  plugins: [
    'truffle-plugin-verify',
  ],
  api_keys: {
    [process.env.NETWORK_API_NAME]: process.env.NETWORK_API_KEY,
  }
};

require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {

  api_keys: {
    gnosisscan: process.env.GNOSISSCAN_APIKEY
  },

  plugins: [
    'truffle-plugin-verify',
    'truffle-plugin-stdjsonin'
  ],

  contracts_build_directory: "../client/src/contracts",

  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8546,            // Standard Ethereum port (default: none)
      network_id: "100"     // Any network (default: none)
    },
    gnosis: {
      provider: function () {
        return new HDWalletProvider(`${process.env.MNEMONIC}`, `https://rpc.ankr.com/gnosis`)
      },
      network_id: 100
    }
  },

  // Set default mocha options here, use special reporters, etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.14",      // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
       optimizer: {
         enabled: false,
         runs: 1
       }
       //evmVersion: "byzantium"
      }
    }
  }
};

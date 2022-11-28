# Truffle environment

## Getting started

### Start a local gnosis fork

```bash
npx ganache --server.port=8546 --chain.chainId=100 --miner.blockTime=2 -f='YOUR_GNOSIS_RPC_URL' --wallet.mnemonic='MNEMONIC' --wallet.unlockedAccounts='UNLOCKED_WALLET_ADDRESS'
```
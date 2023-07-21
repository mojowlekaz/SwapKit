import { isDetected } from '@thorswap-lib/toolbox-evm';
import { Chain, WalletOption } from '@thorswap-lib/types';

import { getWalletForChain } from './helpers.js';
import { OKXConfig } from './types.js';

const OKX_SUPPORTED_CHAINS = [
  Chain.Avalanche,
  Chain.BinanceSmartChain,
  Chain.Bitcoin,
  Chain.Ethereum,
  Chain.Cosmos,
] as const;

const connectOkx =
  ({
    addChain,
    config: { covalentApiKey, ethplorerApiKey, utxoApiKey },
  }: {
    addChain: any;
    config: OKXConfig;
  }) =>
  async (chains: (typeof OKX_SUPPORTED_CHAINS)[number][]) => {
    const promises = chains.reduce(async (chainsToConnect, chain) => {
      await chainsToConnect;
      const walletMethods = await getWalletForChain({
        chain,
        utxoApiKey,
        covalentApiKey,
        ethplorerApiKey,
      });

      // Unwrap the address from a possible promise
      const address = await walletMethods.getAddress();

      addChain({
        chain,
        walletMethods: { ...walletMethods, getAddress: () => address },
        wallet: { address, balance: [], walletType: WalletOption.OKX },
      });
    }, Promise.resolve());

    await promises;

    return true;
  };

export const okxWallet = {
  connectMethodName: 'connectOkx' as const,
  connect: connectOkx,
  isDetected,
};
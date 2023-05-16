import { Amount, AssetAmount } from '@thorswap-lib/swapkit-entities';
import { Chain } from '@thorswap-lib/types';
import { useCallback, useState } from 'react';

import { getSwapKitClient } from '../swapKitClient';

export default function Loan({
  inputAsset,
  outputAsset,
  stagenet,
}: {
  stagenet?: boolean;
  inputAsset?: AssetAmount;
  outputAsset?: AssetAmount;
}) {
  const [openLoan] = useState(true);
  const [inputAmount, setInputAmount] = useState<Amount | undefined>();
  const [borrowAmount, setBorrowAmount] = useState<Amount | undefined>();

  const setAmount = useCallback(
    (amountValue: string, type: 'input' | 'borrow' = 'input') => {
      if (!inputAsset) return;

      const value = parseFloat(amountValue);
      const amount = Amount.fromNormalAmount(value);
      const setFunction = type === 'input' ? setInputAmount : setBorrowAmount;

      setFunction(amount.gt(inputAsset.amount) ? inputAsset.amount : amount);
    },
    [inputAsset],
  );

  const handleLoanAction = useCallback(async () => {
    if (!inputAsset || !outputAsset || !inputAmount) return;
    const client = getSwapKitClient(stagenet);
    const assetAmount = new AssetAmount(inputAsset.asset, inputAmount);

    const txHash = await (openLoan ? client.openLoan : client.closeLoan)({
      assetAmount,
      borrowAmount,
      assetTicker: `${outputAsset.asset.chain}.${outputAsset.asset.ticker}`,
    });

    window.open(
      `${client.getExplorerTxUrl(Chain.THORChain, txHash as string)}${
        stagenet ? '?network=stagenet' : ''
      }`,
      '_blank',
    );
  }, [inputAsset, outputAsset, inputAmount, openLoan, borrowAmount, stagenet]);

  return (
    <div>
      <h4>Loan</h4>

      <div style={{ display: 'flex', flex: 1, flexDirection: 'column' }}>
        <div>
          <div>
            <span>Input Asset:</span>
            {inputAsset?.amount.toSignificant(6)} {inputAsset?.asset.ticker}
          </div>

          <div>
            <span>Borrow Asset:</span>
            {outputAsset?.asset.ticker}
          </div>
        </div>

        <div>
          <div>
            <span>Input Amount:</span>
            <input
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              type="number"
              value={inputAmount?.toSignificant(6)}
            />
          </div>
          <div>
            <span>Borrow Amount:</span>
            <input
              onChange={(e) => setAmount(e.target.value, 'borrow')}
              placeholder="0.0"
              type="number"
              value={borrowAmount?.toSignificant(6)}
            />
          </div>

          <button disabled={!inputAsset || !outputAsset} onClick={handleLoanAction} type="button">
            {openLoan ? 'Open Loan' : 'Close Loan'}
          </button>
        </div>
      </div>
    </div>
  );
}
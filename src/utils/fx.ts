export interface QuoteCalcInput {
  amountGhs: number;
  midRate: number;
  spreadBps: number;
  flatFeeGhs: number;
  percentFeeBps: number;
}

export const calculateQuote = ({ amountGhs, midRate, spreadBps, flatFeeGhs, percentFeeBps }: QuoteCalcInput) => {
  const customerRate = midRate * (1 + spreadBps / 10000);
  const percentFee = amountGhs * (percentFeeBps / 10000);
  const feeGhs = Number((flatFeeGhs + percentFee).toFixed(2));
  const netGhs = amountGhs - feeGhs;
  const amountUsd = Number((netGhs / customerRate).toFixed(2));
  return { customerRate, feeGhs, amountUsd };
};

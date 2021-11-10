import { formatUnits } from "@ethersproject/units";

export const convertValue = (amountInUnits, decimals, toEthMultiplier, showUsdPrice, ethPrice) => {
  return (parseFloat(formatUnits(amountInUnits,decimals)) * toEthMultiplier * (showUsdPrice ? ethPrice : 1))
}

export const formattedValue = (amountInUnits, decimals, toEthMultiplier, showUsdPrice, ethPrice) => {
  return convertValue(amountInUnits, decimals, toEthMultiplier, showUsdPrice, ethPrice).toLocaleString()
}

type Notation = "compact" | "engineering" | "scientific" | "standard";

const formatNumber = (
  number: number | string | bigint,
  decimals = 1,
  style = "decimal",
  notation: Notation = "compact",
  lessThanThresholdToReplace = 0.001
) => {
  if (Number(number) < lessThanThresholdToReplace) {
    return `< ${lessThanThresholdToReplace.toLocaleString("en-US")}`;
  }

  return Number(number).toLocaleString("en-US", {
    notation,
    maximumFractionDigits: decimals,
    style,
  });
};
export default formatNumber;

export function numberToPercent(value?: number) {
  if (!value) return undefined;
  return value * 100;
}

export function percentToNumber(value: number) {
  return value / 100;
}

function formatMoney(n) {
  const number = parseFloat(n);

  return number.toLocaleString('en-US', {
    minimumFractionDigits: 2,
  });
}

export default formatMoney;

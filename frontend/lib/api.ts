export const getStockData = async (ticker: string) => {
  const res = await fetch(`http://127.0.0.1:8000/stock/${ticker}`);
  return res.json();
};
export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    );

    const data = await response.json();

    const ethPrice = data.ethereum.usd;

    res.status(200).json({
      success: true,
      eth_usd: ethPrice
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch price"
    });
  }
}

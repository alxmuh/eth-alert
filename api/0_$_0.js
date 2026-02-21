let lastAlertTimestamp = null;

export default async function handler(req, res) {
  try {
    const DAILY_THRESHOLD = 5;   // 5%
    const WEEKLY_THRESHOLD = 10; // 10%
    const COOLDOWN_HOURS = 24;   // do not alert again for 24 hours

    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false"
    );

    const data = await response.json();

    const price = data.market_data.current_price.usd;
    const change24h = data.market_data.price_change_percentage_24h;
    const change7d = data.market_data.price_change_percentage_7d;

    const dailyAlert = Math.abs(change24h) >= DAILY_THRESHOLD;
    const weeklyAlert = Math.abs(change7d) >= WEEKLY_THRESHOLD;
    const volatilityTriggered = dailyAlert || weeklyAlert;

    let alertTriggered = false;
    let reason = null;

    if (volatilityTriggered) {
      const now = Date.now();

      if (
        !lastAlertTimestamp ||
        now - lastAlertTimestamp > COOLDOWN_HOURS * 60 * 60 * 1000
      ) {
        alertTriggered = true;
        lastAlertTimestamp = now;

        reason = dailyAlert
          ? "24h movement exceeded 5%"
          : "7d movement exceeded 10%";
      }
    }

    res.status(200).json({
      success: true,
      current_price: price,
      change_24h_percent: change24h,
      change_7d_percent: change7d,
      alert_triggered: alertTriggered,
      alert_reason: reason,
      last_alert_timestamp: lastAlertTimestamp
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch price data"
    });
  }
}

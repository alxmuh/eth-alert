import webpush from "web-push";

let storedSubscription = null;

/*
  ⚡ Temporary in-memory subscription storage
  (For real production we move this to a database later)
*/

export default async function handler(req, res) {

  /* ============================= */
  /* 🔐 AUTH CHECK (Cron Protection) */
  /* ============================= */

  const authHeader = req.headers.authorization;

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {

    /* ============================= */
    /* 🚀 Initialize Web Push */
    /* ============================= */

    webpush.setVapidDetails(
      process.env.VAPID_EMAIL,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    /* ============================= */
    /* 📊 Fetch ETH Data */
    /* ============================= */

    const response = await fetch(
      "https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false"
    );

    const data = await response.json();

    const price = data?.market_data?.current_price?.usd;
    const change24h = data?.market_data?.price_change_percentage_24h;
    const change7d = data?.market_data?.price_change_percentage_7d;

    if (!price) {
      return res.status(500).json({ error: "Failed to fetch price" });
    }

    /* ============================= */
    /* 🎯 Volatility Logic (Test Mode) */
    /* ============================= */

    const DAILY_THRESHOLD = 5;  // Temporary stress test
    const WEEKLY_THRESHOLD = 1;

    const dailyAlert = Math.abs(change24h) >= DAILY_THRESHOLD;
    const weeklyAlert = Math.abs(change7d) >= WEEKLY_THRESHOLD;

    const volatilityTriggered = dailyAlert || weeklyAlert;

    let pushSent = false;

    /* ============================= */
    /* 🔔 Send Push If Condition Met */
    /* ============================= */

    if (volatilityTriggered && storedSubscription) {

      await webpush.sendNotification(
        storedSubscription,
        JSON.stringify({
          title: "ETH Alert 🚨",
          body: `ETH moved!\nPrice: $${price}\n24h: ${change24h}%\n7d: ${change7d}%`
        })
      );

      pushSent = true;

      console.log("✅ Push sent successfully");
    }

    /* ============================= */
    /* 📤 Return Response */
    /* ============================= */

    return res.status(200).json({
      success: true,
      price,
      change_24h: change24h,
      change_7d: change7d,
      alert_triggered: volatilityTriggered,
      push_sent: pushSent
    });

  } catch (error) {

    console.error("❌ Error:", error);

    return res.status(500).json({
      success: false,
      error: "Internal error"
    });
  }
}

import { storedSubscription } from "./subscribe.js";
import webpush from "web-push";

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Initialize Web Push with VAPID keys
    webpush.setVapidDetails(
      process.env.VAPID_EMAIL,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    const DAILY_THRESHOLD = 5;
    const WEEKLY_THRESHOLD = 10;

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

    if (volatilityTriggered) {

      // 🔥 SEND PUSH NOTIFICATION
      // TEMPORARY: We use a fake demo subscription
      if (!storedSubscription) {
  console.log("No subscriber yet.");
} else {
  await webpush.sendNotification(
    storedSubscription,
    JSON.stringify({
      title: "ETH Alert 🚨",
      body: `ETH moved significantly!\nPrice: $${price}`,
    })
  );
} // replaced with pointer to sub.js

      await webpush.sendNotification(
        demoSubscription,
        JSON.stringify({
          title: "ETH Alert 🚨",
          body: `ETH moved significantly!\nPrice: $${price}`,
        })
      );
    }

    res.status(200).json({
      success: true,
      price,
      change_24h: change24h,
      change_7d: change7d,
      alert_triggered: volatilityTriggered
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Push or price check failed"
    });
  }
}

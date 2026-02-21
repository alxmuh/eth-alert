let storedSubscription = null;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const subscription = req.body;

    storedSubscription = subscription;

    res.status(200).json({
      success: true,
      message: "Subscription stored successfully"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to store subscription"
    });
  }
}

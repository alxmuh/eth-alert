let storedSubscription = null;

export { storedSubscription };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    storedSubscription = req.body;

    console.log("Subscription received:");
    console.log(JSON.stringify(req.body, null, 2));

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Subscription failed" });
  }
}

console.log(JSON.stringify(req.body, null, 2));
/*
export let storedSubscription = null;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    storedSubscription = req.body;

    res.status(200).json({
      success: true,
      message: "Subscription stored"
    });

  } catch (err) {
    res.status(500).json({ error: "Failed" });
  }
}
*/

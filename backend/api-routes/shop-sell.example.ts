// /api/shop/sell pseudocode
// Use later, after exploit review.
// Sell must be server-authoritative.

export async function POST(req: Request) {
  const { walletAddress, itemName, qty } = await req.json();

  // 1. Verify authenticated wallet session.
  // 2. Check inventory qty in DB.
  // 3. Apply rate limit and daily sell cap.
  // 4. Remove inventory item in DB transaction.
  // 5. Create payout credit or send treasury tx.
  // 6. Store payout tx signature.
  // 7. Return updated profile.

  return Response.json({ ok: true, mode: "server-authoritative-sell" });
}

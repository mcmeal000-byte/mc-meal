// Example Next.js API route pseudocode: /api/daily/claim
// Needs: wallet auth/session + Supabase service role.
// This is intentionally not wired to secrets in the static launch build.

export async function POST(req: Request) {
  const { walletAddress } = await req.json();

  // 1. Verify wallet session/signature.
  // 2. Load daily_streaks by wallet.
  // 3. Use server date, not client date.
  // 4. If already claimed today, return 409.
  // 5. Update streak + inventory rewards in one DB transaction/RPC.
  // 6. Return updated profile/inventory.

  return Response.json({
    ok: true,
    note: "Implement with Supabase transaction/RPC."
  });
}

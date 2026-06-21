// /api/profile/connect pseudocode
// Verifies a signed message and creates/loads profile.
// For launch build this is read-only in frontend.
// Backend version should verify wallet ownership before writing profile.

export async function POST(req: Request) {
  const { walletAddress, signedMessage } = await req.json();

  // 1. Verify signature belongs to walletAddress.
  // 2. Upsert public.profiles row.
  // 3. Return profile + inventory + streak.

  return Response.json({ ok: true });
}

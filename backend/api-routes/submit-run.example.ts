// Example Next.js API route pseudocode: /api/runs/submit
// Critical: do not trust client blindly.

export async function POST(req: Request) {
  const { walletAddress, gameKey, score, durationMs, drops, clientRunId } = await req.json();

  // Basic anti-cheat:
  // - rate limit wallet/IP
  // - reject impossible scores
  // - reject impossible duration
  // - unique clientRunId
  // - cap daily reward runs
  // - log suspicious runs for review

  return Response.json({
    ok: true,
    accepted: true
  });
}

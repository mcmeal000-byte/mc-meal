# MC Meal v10.2 Sync Fix

This hotfix fixes the case where a stale local wallet cache hides the start screen while backend sync is not active.

Upload everything except backend/ to GitHub. Then hard refresh.

Expected behavior:
- Start screen appears if backend is not synced.
- User must click CONNECT WALLET.
- Kitchen opens only after check-access and profile-connect succeed.
- Footer shows LIVE SYNC after successful backend sync.

# MC Meal v10.3 Connect Fix

Fixes wallet connect hanging by removing browser-side public RPC balance lookup during connect.

- check-access remains server-side source of truth for $MEAL holder access
- profile-connect receives balance from check-access fallback
- backend calls now timeout after 12 seconds and show endpoint-specific errors

Deploy frontend files only. Do not upload backend/.

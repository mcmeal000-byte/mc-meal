# MC Meal v10.1 Hotfix

Fixes browser RPC 403 by replacing the browser Solana RPC with:

```txt
https://solana-rpc.publicnode.com
```

Important Supabase setting:

```txt
profile-connect Verify JWT must be OFF
check-access Verify JWT must be OFF
submit-run Verify JWT must be OFF
craft Verify JWT must be OFF
daily-claim Verify JWT must be OFF
shop-buy-demo Verify JWT must be OFF
shop-sell-demo Verify JWT must be OFF
```

Upload all frontend files except backend/.

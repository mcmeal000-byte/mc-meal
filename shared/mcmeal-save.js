/**
 * MC Meal Shared Save v1
 * Frontend/local preview storage.
 *
 * This is the bridge between Hub, Mini-Games, Craft Kitchen and Shop.
 * Later this shape maps 1:1 to backend wallet profiles.
 */
window.MCMealSave = (() => {
  const KEY = "mcmeal_shared_profile_v1";

  const DEFAULT_PROFILE = {
    version: 1,
    wallet: null,
    accessTier: "Visitor",
    xp: 420,
    meal: 10000,
    burned: 0,
    rewardPool: 0,
    bestScore: 0,
    mealsCrafted: 0,
    miniRuns: 0,
    streak: {
      current: 0,
      lastClaimDate: null,
      totalClaims: 0
    },
    inventory: {
      Bun: 6,
      Patty: 5,
      Cheese: 4,
      Lettuce: 4,
      Fries: 5,
      Soda: 5,
      Sauce: 4,
      "Mystery Ticket": 2,
      "Recipe Fragment": 1,
      "Secret Receipt": 0,
      "Craft Entry": 0,
      "Combo Spice": 0,
      "Fizz Combo": 0,
      "Basic Burger": 0,
      "Classic MC Meal": 0,
      "Kitchen Scrap": 0,
      "Common Meal": 1,
      "Rare Meal": 0,
      "Supreme Meal": 0,
      "Legendary Meal": 0,
      "Golden Meal": 0
    },
    log: ["Welcome to MC Meal Kitchen Street."]
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function load() {
    const raw = localStorage.getItem(KEY);
    if (!raw) return clone(DEFAULT_PROFILE);

    try {
      const saved = JSON.parse(raw);
      return mergeProfile(saved);
    } catch {
      return clone(DEFAULT_PROFILE);
    }
  }

  function mergeProfile(saved) {
    const profile = clone(DEFAULT_PROFILE);
    Object.assign(profile, saved || {});
    profile.inventory = { ...DEFAULT_PROFILE.inventory, ...(saved.inventory || {}) };
    profile.streak = { ...DEFAULT_PROFILE.streak, ...(saved.streak || {}) };
    profile.log = Array.isArray(saved.log) ? saved.log : DEFAULT_PROFILE.log.slice();
    return profile;
  }

  function save(profile) {
    localStorage.setItem(KEY, JSON.stringify(mergeProfile(profile)));
    return load();
  }

  function reset() {
    localStorage.removeItem(KEY);
    return load();
  }

  function addLog(profile, text) {
    profile.log = profile.log || [];
    profile.log.push(text);
    if (profile.log.length > 12) profile.log = profile.log.slice(-12);
    return profile;
  }

  function addItem(profile, item, qty = 1) {
    profile.inventory[item] = (profile.inventory[item] || 0) + qty;
    return profile;
  }

  function removeItem(profile, item, qty = 1) {
    profile.inventory[item] = Math.max(0, (profile.inventory[item] || 0) - qty);
    return profile;
  }

  function hasItem(profile, item, qty = 1) {
    return (profile.inventory[item] || 0) >= qty;
  }

  function spendMeal(profile, amount, burnRate = 0.8) {
    if (profile.meal < amount) return { ok: false, profile, burn: 0, pool: 0 };
    const burn = Math.floor(amount * burnRate);
    const pool = amount - burn;
    profile.meal -= amount;
    profile.burned += burn;
    profile.rewardPool += pool;
  
  function setWallet(profile, walletAddress, mealBalance = null) {
    profile.wallet = walletAddress;
    if (mealBalance !== null && !Number.isNaN(Number(mealBalance))) {
      profile.realMealBalance = Number(mealBalance);
    }
    profile.accessTier = getAccessTier(profile.realMealBalance ?? profile.meal ?? 0);
    addLog(profile, `Wallet connected: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)} · Tier ${profile.accessTier}.`);
    return profile;
  }

  function disconnectWallet(profile) {
    profile.wallet = null;
    profile.accessTier = "Visitor";
    addLog(profile, "Wallet disconnected.");
    return profile;
  }

  function getAccessTier(balance) {
    const amount = Number(balance || 0);
    if (amount >= 1000000) return "Legendary Kitchen";
    if (amount >= 250000) return "Golden Kitchen";
    if (amount >= 50000) return "Grill Access";
    if (amount >= 10000) return "Basic Kitchen";
    return "Visitor";
  }

  function buyFromShop(profile, item, qty, price) {
    if ((profile.meal || 0) < price) {
      addLog(profile, `Shop buy failed: not enough $MEAL for ${item}.`);
      return { ok: false, profile };
    }
    const spend = spendMeal(profile, price, 0.8);
    addItem(profile, item, qty);
    addLog(profile, `Bought ${qty}x ${item}. ${spend.burn} $MEAL burned, ${spend.pool} to pool.`);
    return { ok: true, profile, burn: spend.burn, pool: spend.pool };
  }

  function sellToShop(profile, item, qty, price) {
    if (!hasItem(profile, item, qty)) {
      addLog(profile, `Sell failed: missing ${item}.`);
      return { ok: false, profile };
    }
    removeItem(profile, item, qty);
    profile.meal += price;
    profile.marketVolume = (profile.marketVolume || 0) + price;
    addLog(profile, `Sold ${qty}x ${item} for ${price} $MEAL.`);
    return { ok: true, profile };
  }


  return { ok: true, profile, burn, pool };
  }

  function claimDaily(profile) {
    const today = todayKey();
    if (profile.streak.lastClaimDate === today) {
    
  function setWallet(profile, walletAddress, mealBalance = null) {
    profile.wallet = walletAddress;
    if (mealBalance !== null && !Number.isNaN(Number(mealBalance))) {
      profile.realMealBalance = Number(mealBalance);
    }
    profile.accessTier = getAccessTier(profile.realMealBalance ?? profile.meal ?? 0);
    addLog(profile, `Wallet connected: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)} · Tier ${profile.accessTier}.`);
    return profile;
  }

  function disconnectWallet(profile) {
    profile.wallet = null;
    profile.accessTier = "Visitor";
    addLog(profile, "Wallet disconnected.");
    return profile;
  }

  function getAccessTier(balance) {
    const amount = Number(balance || 0);
    if (amount >= 1000000) return "Legendary Kitchen";
    if (amount >= 250000) return "Golden Kitchen";
    if (amount >= 50000) return "Grill Access";
    if (amount >= 10000) return "Basic Kitchen";
    return "Visitor";
  }

  function buyFromShop(profile, item, qty, price) {
    if ((profile.meal || 0) < price) {
      addLog(profile, `Shop buy failed: not enough $MEAL for ${item}.`);
      return { ok: false, profile };
    }
    const spend = spendMeal(profile, price, 0.8);
    addItem(profile, item, qty);
    addLog(profile, `Bought ${qty}x ${item}. ${spend.burn} $MEAL burned, ${spend.pool} to pool.`);
    return { ok: true, profile, burn: spend.burn, pool: spend.pool };
  }

  function sellToShop(profile, item, qty, price) {
    if (!hasItem(profile, item, qty)) {
      addLog(profile, `Sell failed: missing ${item}.`);
      return { ok: false, profile };
    }
    removeItem(profile, item, qty);
    profile.meal += price;
    profile.marketVolume = (profile.marketVolume || 0) + price;
    addLog(profile, `Sold ${qty}x ${item} for ${price} $MEAL.`);
    return { ok: true, profile };
  }


  return { ok: false, alreadyClaimed: true, profile, rewardText: "Already claimed today." };
    }

    let newStreak = 1;
    if (profile.streak.lastClaimDate) {
      const last = new Date(profile.streak.lastClaimDate + "T00:00:00Z");
      const now = new Date(today + "T00:00:00Z");
      const diffDays = Math.round((now - last) / 86400000);
      newStreak = diffDays === 1 ? profile.streak.current + 1 : 1;
    }

    profile.streak.current = newStreak;
    profile.streak.lastClaimDate = today;
    profile.streak.totalClaims += 1;

    const rewards = [
      { item: "Bun", qty: 1 },
      { item: "Fries", qty: 1 },
      { item: "Soda", qty: 1 }
    ];
    let bonus = "+1 Bun, +1 Fries, +1 Soda";

    if (newStreak >= 3) {
      rewards.push({ item: "Mystery Ticket", qty: 1 });
      bonus += ", +1 Mystery Ticket";
    }
    if (newStreak >= 5) {
      rewards.push({ item: "Recipe Fragment", qty: 1 });
      bonus += ", +1 Recipe Fragment";
    }
    if (newStreak >= 7) {
      rewards.push({ item: "Craft Entry", qty: 1 });
      bonus += ", +1 Craft Entry";
    }

    for (const r of rewards) addItem(profile, r.item, r.qty);
    profile.xp += 25 + newStreak * 5;
    addLog(profile, `Daily claimed: streak ${newStreak}. ${bonus}.`);

  
  function setWallet(profile, walletAddress, mealBalance = null) {
    profile.wallet = walletAddress;
    if (mealBalance !== null && !Number.isNaN(Number(mealBalance))) {
      profile.realMealBalance = Number(mealBalance);
    }
    profile.accessTier = getAccessTier(profile.realMealBalance ?? profile.meal ?? 0);
    addLog(profile, `Wallet connected: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)} · Tier ${profile.accessTier}.`);
    return profile;
  }

  function disconnectWallet(profile) {
    profile.wallet = null;
    profile.accessTier = "Visitor";
    addLog(profile, "Wallet disconnected.");
    return profile;
  }

  function getAccessTier(balance) {
    const amount = Number(balance || 0);
    if (amount >= 1000000) return "Legendary Kitchen";
    if (amount >= 250000) return "Golden Kitchen";
    if (amount >= 50000) return "Grill Access";
    if (amount >= 10000) return "Basic Kitchen";
    return "Visitor";
  }

  function buyFromShop(profile, item, qty, price) {
    if ((profile.meal || 0) < price) {
      addLog(profile, `Shop buy failed: not enough $MEAL for ${item}.`);
      return { ok: false, profile };
    }
    const spend = spendMeal(profile, price, 0.8);
    addItem(profile, item, qty);
    addLog(profile, `Bought ${qty}x ${item}. ${spend.burn} $MEAL burned, ${spend.pool} to pool.`);
    return { ok: true, profile, burn: spend.burn, pool: spend.pool };
  }

  function sellToShop(profile, item, qty, price) {
    if (!hasItem(profile, item, qty)) {
      addLog(profile, `Sell failed: missing ${item}.`);
      return { ok: false, profile };
    }
    removeItem(profile, item, qty);
    profile.meal += price;
    profile.marketVolume = (profile.marketVolume || 0) + price;
    addLog(profile, `Sold ${qty}x ${item} for ${price} $MEAL.`);
    return { ok: true, profile };
  }


  return { ok: true, profile, rewardText: `Streak ${newStreak}: ${bonus}` };
  }

  function submitRun(profile, game, score, drops) {
    profile.miniRuns += 1;
    profile.bestScore = Math.max(profile.bestScore || 0, score || 0);
    profile.xp += 30 + Math.floor((score || 0) / 100);
    for (const d of drops || []) addItem(profile, d.item, d.qty || 1);
    addLog(profile, `${game} run: score ${score}, drops ${drops.map(d => `${d.item} x${d.qty || 1}`).join(", ")}.`);
    return profile;
  }


  function setWallet(profile, walletAddress, mealBalance = null) {
    profile.wallet = walletAddress;
    if (mealBalance !== null && !Number.isNaN(Number(mealBalance))) {
      profile.realMealBalance = Number(mealBalance);
    }
    profile.accessTier = getAccessTier(profile.realMealBalance ?? profile.meal ?? 0);
    addLog(profile, `Wallet connected: ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)} · Tier ${profile.accessTier}.`);
    return profile;
  }

  function disconnectWallet(profile) {
    profile.wallet = null;
    profile.accessTier = "Visitor";
    addLog(profile, "Wallet disconnected.");
    return profile;
  }

  function getAccessTier(balance) {
    const amount = Number(balance || 0);
    if (amount >= 1000000) return "Legendary Kitchen";
    if (amount >= 250000) return "Golden Kitchen";
    if (amount >= 50000) return "Grill Access";
    if (amount >= 10000) return "Basic Kitchen";
    return "Visitor";
  }

  function buyFromShop(profile, item, qty, price) {
    if ((profile.meal || 0) < price) {
      addLog(profile, `Shop buy failed: not enough $MEAL for ${item}.`);
      return { ok: false, profile };
    }
    const spend = spendMeal(profile, price, 0.8);
    addItem(profile, item, qty);
    addLog(profile, `Bought ${qty}x ${item}. ${spend.burn} $MEAL burned, ${spend.pool} to pool.`);
    return { ok: true, profile, burn: spend.burn, pool: spend.pool };
  }

  function sellToShop(profile, item, qty, price) {
    if (!hasItem(profile, item, qty)) {
      addLog(profile, `Sell failed: missing ${item}.`);
      return { ok: false, profile };
    }
    removeItem(profile, item, qty);
    profile.meal += price;
    profile.marketVolume = (profile.marketVolume || 0) + price;
    addLog(profile, `Sold ${qty}x ${item} for ${price} $MEAL.`);
    return { ok: true, profile };
  }


  return {
    KEY,
    DEFAULT_PROFILE,
    todayKey,
    load,
    save,
    reset,
    addLog,
    addItem,
    removeItem,
    hasItem,
    spendMeal,
    claimDaily,
    submitRun,
    setWallet,
    disconnectWallet,
    getAccessTier,
    buyFromShop,
    sellToShop
  };
})();

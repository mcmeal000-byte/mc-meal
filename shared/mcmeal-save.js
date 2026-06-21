/**
 * MC Meal Shared Save – Season 0
 * Keeps the latest synced wallet profile cached locally so the Hub can render fast.
 * Server actions are handled by Supabase Edge Functions from hub.js.
 */
window.MCMealSave = (() => {
  const KEY = "mcmeal_season0_profile_v1";

  const DEFAULT_PROFILE = {
    version: 2,
    wallet: null,
    accessTier: "Locked",
    prelaunchAccess: false,
    backendSynced: false,
    lastSync: null,
    xp: 0,
    meal: 0,
    burned: 0,
    rewardPool: 0,
    marketVolume: 0,
    bestScore: 0,
    mealsCrafted: 0,
    miniRuns: 0,
    streak: {
      current: 0,
      lastClaimDate: null,
      totalClaims: 0
    },
    inventory: {
      Bun: 0,
      Patty: 0,
      Cheese: 0,
      Lettuce: 0,
      Fries: 0,
      Soda: 0,
      Sauce: 0,
      "Mystery Ticket": 0,
      "Recipe Fragment": 0,
      "Secret Receipt": 0,
      "Craft Entry": 0,
      "Combo Spice": 0,
      "Fizz Combo": 0,
      "Basic Burger": 0,
      "Classic MC Meal": 0,
      "Kitchen Scrap": 0,
      "Common Meal": 0,
      "Rare Meal": 0,
      "Supreme Meal": 0,
      "Legendary Meal": 0,
      "Golden Meal": 0
    },
    log: ["MC Meal private test kitchen locked until wallet access."]
  };

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function todayKey() {
    return new Date().toISOString().slice(0, 10);
  }

  function mergeProfile(saved) {
    const profile = clone(DEFAULT_PROFILE);
    Object.assign(profile, saved || {});
    profile.inventory = { ...DEFAULT_PROFILE.inventory, ...((saved && saved.inventory) || {}) };
    profile.streak = { ...DEFAULT_PROFILE.streak, ...((saved && saved.streak) || {}) };
    profile.log = Array.isArray(saved && saved.log) ? saved.log : DEFAULT_PROFILE.log.slice();
    return profile;
  }

  function load() {
    const raw = localStorage.getItem(KEY);
    if (!raw) return clone(DEFAULT_PROFILE);
    try {
      return mergeProfile(JSON.parse(raw));
    } catch {
      return clone(DEFAULT_PROFILE);
    }
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

  return {
    KEY,
    DEFAULT_PROFILE,
    todayKey,
    load,
    save,
    reset,
    addLog
  };
})();

// Market Dynamics Module

// Initialize market data
function initMarket() {
  STRAINS.forEach(strain => {
    // Start all at base price
    state.strainPriceMultipliers[strain.id] = 1.0;
    
    // Stock levels based on tier
    let baseStock;
    if (strain.tier === 'budget') {
      baseStock = 100;
    } else if (strain.tier === 'premium') {
      baseStock = 50;
    } else {
      baseStock = 20;
    }
    state.strainStock[strain.id] = baseStock;
  });
}

// Update market dynamics (stock regeneration and price decay)
function updateMarket() {
  const now = Date.now();
  const timeSinceUpdate = now - state.lastStockUpdate;
  const minutesPassed = timeSinceUpdate / (60 * 1000);
  
  if (minutesPassed < 1) return; // Only update every minute
  
  STRAINS.forEach(strain => {
    // Regenerate stock over time
    let maxStock;
    if (strain.tier === 'budget') {
      maxStock = 100;
    } else if (strain.tier === 'premium') {
      maxStock = 50;
    } else {
      maxStock = 20;
    }
    
    const currentStock = state.strainStock[strain.id] || 0;
    const regenRate = maxStock * 0.1; // 10% per minute
    state.strainStock[strain.id] = Math.min(maxStock, currentStock + (regenRate * minutesPassed));
    
    // Price decay towards 1.0 over time
    const currentMultiplier = state.strainPriceMultipliers[strain.id] || 1.0;
    if (currentMultiplier > 1.0) {
      // Decay by 5% per minute
      const decayRate = 0.05 * minutesPassed;
      state.strainPriceMultipliers[strain.id] = Math.max(1.0, currentMultiplier - decayRate);
    } else if (currentMultiplier < 1.0) {
      // Rise by 5% per minute
      const riseRate = 0.05 * minutesPassed;
      state.strainPriceMultipliers[strain.id] = Math.min(1.0, currentMultiplier + riseRate);
    }
  });
  
  state.lastStockUpdate = now;
}

// Calculate current price for a strain
function getCurrentPrice(strain) {
  const basePrice = strain.cost;
  const multiplier = state.strainPriceMultipliers[strain.id] || 1.0;
  return Math.round(basePrice * multiplier);
}

// Update price after purchase (demand increases price)
function updatePriceAfterPurchase(strainId, quantity) {
  const strain = STRAINS.find(s => s.id === strainId);
  
  // Price increase based on quantity and tier scarcity
  let priceImpact;
  if (strain.tier === 'budget') {
    priceImpact = 0.01 * quantity; // 1% per seed
  } else if (strain.tier === 'premium') {
    priceImpact = 0.02 * quantity; // 2% per seed
  } else {
    priceImpact = 0.03 * quantity; // 3% per seed
  }
  
  const currentMultiplier = state.strainPriceMultipliers[strainId] || 1.0;
  state.strainPriceMultipliers[strainId] = Math.min(2.0, currentMultiplier + priceImpact); // Cap at 2x
  
  // Reduce stock
  state.strainStock[strainId] = Math.max(0, state.strainStock[strainId] - quantity);
}

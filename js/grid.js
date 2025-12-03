// Farm Grid Module

let hasDragged = false;

// Render grid
function renderGrid() {
  const farmGrid = document.getElementById('farmGrid');
  farmGrid.innerHTML = '';
  
  state.grid.forEach((tile) => {
    const div = document.createElement('div');
    div.className = tile.locked ? 'tile locked' : 'tile unlocked';
    div.style.left = tile.x * TILE_SIZE + 'px';
    div.style.top = tile.y * TILE_SIZE + 'px';
    
    // Add plantable class if seed is selected and tile is empty
    if (!tile.locked && !tile.plant && state.selectedSeed && !tile.isWaterTap) {
      div.classList.add('plantable');
    }
    
    // Add watered class if plant is watered
    if (tile.watered && tile.plant) {
      div.classList.add('watered');
    }
    
    if (tile.locked) {
      div.textContent = tile.obstacle;
      const badge = document.createElement('div');
      badge.className = 'cost-badge';
      badge.textContent = `$${tile.cost}`;
      div.appendChild(badge);
    } else if (tile.plant) {
      const elapsed = Date.now() - tile.plant.plantedAt;
      const progress = Math.min(elapsed / tile.plant.growthTime, 1);
      const isReady = progress >= 1;
      
      if (isReady) {
        div.classList.add('ready');
      }
      
      // Determine growth stage and emoji
      let stageEmoji = '🌱';
      if (progress >= 1) {
        stageEmoji = '🌿'; // Ready to harvest
      } else if (progress >= 0.75) {
        stageEmoji = '☘️'; // Flowering
      } else if (progress >= 0.5) {
        stageEmoji = '🌿'; // Vegetative
      } else if (progress >= 0.25) {
        stageEmoji = '🌱'; // Sprout
      } else {
        stageEmoji = '🌱'; // Seedling
      }
      
      // Calculate time remaining
      const timeRemaining = Math.max(0, tile.plant.growthTime - elapsed);
      const minutes = Math.floor(timeRemaining / 60000);
      const seconds = Math.floor((timeRemaining % 60000) / 1000);
      const timeString = isReady ? 'READY' : `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      div.innerHTML = `
        <div class="plant-container">
          ${tile.watered ? '<div class="water-indicator">💧</div>' : ''}
          <div class="growth-timer">${timeString}</div>
          <div class="plant-icon">${stageEmoji}</div>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${progress * 100}%"></div>
          </div>
        </div>
      `;
    } else {
      const empty = document.createElement('div');
      empty.className = 'empty-tile';
      empty.textContent = '+';
      div.appendChild(empty);
    }
    
    div.addEventListener('click', (e) => {
      e.stopPropagation();
      handleTileClick(tile);
    });
    
    farmGrid.appendChild(div);
  });
}

// Handle tile click
function handleTileClick(tile) {
  // Don't handle clicks if we just dragged
  if (hasDragged) return;
  
  // PRIORITY 1: Planting seeds (overrides watering)
  if (state.selectedSeed && !tile.locked && !tile.plant) {
    const strain = STRAINS.find(s => s.id === state.selectedSeed);
    if (state.inventory[state.selectedSeed] > 0) {
      // Calculate effective growth time and sell price based on PASSIVE tools only
      let effectiveGrowthTime = strain.growthTime;
      let effectiveSellPrice = strain.sellPrice;
      
      state.activeTools.forEach(toolId => {
        const tool = TOOLS.find(t => t.id === toolId);
        // Skip manual watering can - it's not automatic
        if (tool.effect === 'manual-water') return;
        
        if (tool.effect === 'speed' || tool.effect === 'auto-water') {
          effectiveGrowthTime *= tool.value;
        } else if (tool.effect === 'yield') {
          effectiveSellPrice *= tool.value;
        }
      });
      
      // Plant the seed
      tile.plant = {
        strain: strain,
        plantedAt: Date.now(),
        growthTime: effectiveGrowthTime,
        sellPrice: Math.round(effectiveSellPrice),
        emoji: '🌱',
        ready: false
      };
      
      // Remove from inventory
      state.inventory[state.selectedSeed]--;
      
      // Deselect if no more seeds
      if (state.inventory[state.selectedSeed] <= 0) {
        state.selectedSeed = null;
      }
      
      renderGrid();
    }
    return;
  }
  
  // PRIORITY 2: Watering plants (only if no seed selected)
  if (state.selectedTool === 1 && !state.selectedSeed) {
    if (tile.plant && !tile.watered) {
      // Check if can has uses left
      if (state.wateringCanUses >= 4) {
        showNotification('💧 Watering can is empty! Refill at the water tap', 'warning');
        return;
      }
      
      // Water the plant
      tile.watered = true;
      state.wateringCanUses++;
      
      // Apply speed boost to plant
      const speedBoost = 0.85; // 15% faster
      if (tile.plant.growthTime) {
        tile.plant.growthTime = Math.floor(tile.plant.growthTime * speedBoost);
      }
      
      renderGrid();
      updateToolsMenu();
      
      // Deselect tool if can is now empty
      if (state.wateringCanUses >= 4) {
        state.selectedTool = null;
        updateToolIndicator();
      }
    } else if (tile.plant && tile.watered) {
      showNotification('💧 This plant is already watered!', 'info');
    } else if (!tile.plant && !tile.locked) {
      showNotification('🌱 You can only water planted crops!', 'info');
    }
    return;
  }
  
  // PRIORITY 3: Harvest mode (if harvest button is selected)
  if (state.selectedMode === 'harvest' && !state.selectedSeed) {
    if (tile.plant) {
      const elapsed = Date.now() - tile.plant.plantedAt;
      const isReady = elapsed >= tile.plant.growthTime;
      
      if (isReady) {
        // Calculate yield in grams (base yield + modifiers)
        const baseYield = calculateYield(tile.plant.strain, tile);
        const strainName = tile.plant.strain.name;
        
        // Add to harvested product inventory
        if (!state.harvestedProduct[tile.plant.strain.id]) {
          state.harvestedProduct[tile.plant.strain.id] = 0;
        }
        state.harvestedProduct[tile.plant.strain.id] += baseYield;
        
        // Clear plant
        tile.plant = null;
        tile.watered = false;
        renderGrid();
        showNotification(`🌿 Harvested ${baseYield}g of ${strainName}!`, 'success');
      } else {
        const timeRemaining = tile.plant.growthTime - elapsed;
        const minutes = Math.floor(timeRemaining / 60000);
        showNotification(`⏳ Still growing... ${minutes} minutes remaining`, 'info');
      }
    } else if (!tile.locked) {
      showNotification('🌱 No plant to harvest!', 'info');
    }
    return;
  }
  
  // PRIORITY 4: Other interactions
  if (tile.locked) {
    if (state.money >= tile.cost) {
      showConfirmModal(
        '🔓 Clear Obstacle?',
        `Clear ${tile.obstacle} for $${tile.cost}?`,
        () => {
          state.money -= tile.cost;
          tile.locked = false;
          tile.obstacle = null;
          updateMoney();
          renderGrid();
          showNotification('✅ Obstacle cleared!', 'success');
        }
      );
    } else {
      showNotification(`💰 Not enough money! Need $${tile.cost}`, 'error');
    }
  } else if (tile.plant) {
    const elapsed = Date.now() - tile.plant.plantedAt;
    const isReady = elapsed >= tile.plant.growthTime;
    
    if (isReady) {
      showNotification(`✨ Plant ready! Use harvest mode to collect`, 'info');
    } else {
      const timeRemaining = tile.plant.growthTime - elapsed;
      const minutes = Math.floor(timeRemaining / 60000);
      showNotification(`⏳ Still growing... ${minutes} minutes remaining`, 'info');
    }
  }
}

// Refill watering can with countdown
function refillWateringCan() {
  if (!state.ownedTools[1]) {
    showNotification('🔒 You need to buy a Watering Can from the Tools shop first!', 'warning');
    return;
  }
  
  if (state.wateringCanUses === 0) {
    showNotification('💧 Your watering can is already full!', 'info');
    return;
  }
  
  // Disable refill button and start countdown
  const refillBtn = document.querySelector('.refill-button');
  if (refillBtn) {
    refillBtn.disabled = true;
    let countdown = 5;
    refillBtn.textContent = `Refilling... ${countdown}s`;
    
    const countdownInterval = setInterval(() => {
      countdown--;
      if (countdown > 0) {
        refillBtn.textContent = `Refilling... ${countdown}s`;
      } else {
        clearInterval(countdownInterval);
        state.wateringCanUses = 0;
        updateToolsMenu();
        showNotification('💧 Watering can refilled! (4 uses available)', 'success');
      }
    }, 1000);
  }
}

// Render tools menu with all available tools
function updateToolsMenu() {
  const toolsMenu = document.getElementById('toolsMenu');
  if (!toolsMenu) return;
  
  toolsMenu.innerHTML = '';
  
  // Add handle for swiping
  const handle = document.createElement('div');
  handle.className = 'tools-handle';
  handle.innerHTML = '<div class="handle-icon">👈</div>';
  handle.addEventListener('click', () => {
    toolsMenu.classList.toggle('expanded');
  });
  toolsMenu.appendChild(handle);
  
  // Harvest button (always available)
  const harvestBtn = document.createElement('div');
  harvestBtn.className = `tool-button ${state.selectedMode === 'harvest' ? 'active' : ''}`;
  harvestBtn.innerHTML = `
    ✂️
    <div class="tool-label">
      Harvest Mode<br>
      Collect your grown plants
    </div>
  `;
  harvestBtn.addEventListener('click', () => {
    toggleHarvestMode();
  });
  toolsMenu.appendChild(harvestBtn);
  
  // Just show watering can for now
  const wateringCan = TOOLS.find(t => t.id === 1);
  
  if (wateringCan) {
    const isUnlocked = state.cultivationLevel >= wateringCan.level;
    const isOwned = state.ownedTools[wateringCan.id];
    const isSelected = state.selectedTool === wateringCan.id;
    const usesLeft = 4 - state.wateringCanUses;
    const isEmpty = state.wateringCanUses >= 4;
    
    // Watering can button
    const toolBtn = document.createElement('div');
    toolBtn.className = `tool-button ${isSelected ? 'active' : ''} ${!isOwned ? 'locked' : ''} ${isEmpty && isOwned ? 'disabled' : ''}`;
    toolBtn.innerHTML = `
      ${wateringCan.emoji}
      ${!isOwned ? `<span class="tool-lock-badge">🔒 $${wateringCan.cost}</span>` : ''}
      ${isOwned ? `<span class="tool-uses">${usesLeft}/4</span>` : ''}
      <div class="tool-label">
        ${wateringCan.name}<br>
        ${isOwned ? wateringCan.description : `Locked - Buy in shop for $${wateringCan.cost}`}
      </div>
    `;
    
    if (isOwned) {
      toolBtn.addEventListener('click', () => {
        selectWateringCan();
      });
    } else {
      toolBtn.addEventListener('click', () => {
        showConfirmModal(
          '🛒 Buy Tool?',
          `Buy ${wateringCan.name} for $${wateringCan.cost}?`,
          () => {
            if (state.money >= wateringCan.cost) {
              state.money -= wateringCan.cost;
              state.ownedTools[wateringCan.id] = true;
              updateMoney();
              updateToolsMenu();
              showNotification(`✅ ${wateringCan.name} purchased! Click it to use.`, 'success');
            } else {
              showNotification('💰 Not enough money!', 'error');
            }
          }
        );
      });
    }
    
    toolsMenu.appendChild(toolBtn);
    
    // Refill button (only if owned)
    if (isOwned) {
      const refillBtn = document.createElement('button');
      refillBtn.className = 'refill-button';
      refillBtn.textContent = 'Refill 🚰';
      refillBtn.disabled = usesLeft === 4;
      refillBtn.addEventListener('click', () => {
        refillWateringCan();
      });
      toolsMenu.appendChild(refillBtn);
    }
  }
}

// Toggle watering can selection
function selectWateringCan() {
  if (!state.ownedTools[1]) {
    return;
  }
  
  if (state.wateringCanUses >= 4) {
    showNotification('💧 Watering can is empty! Click "Refill 🚰" button', 'warning');
    return;
  }
  
  if (state.selectedTool === 1) {
    state.selectedTool = null;
  } else {
    state.selectedTool = 1;
    state.selectedSeed = null;
    state.selectedMode = null; // Deselect harvest mode
  }
  
  updateToolsMenu();
  updateToolIndicator();
  renderGrid();
}

// Toggle harvest mode
function toggleHarvestMode() {
  if (state.selectedMode === 'harvest') {
    state.selectedMode = null;
  } else {
    state.selectedMode = 'harvest';
    state.selectedTool = null; // Deselect watering can
    state.selectedSeed = null; // Deselect seed
  }
  
  updateToolsMenu();
  updateToolIndicator();
  renderGrid();
}

// Update tool indicator UI
function updateToolIndicator() {
  let indicator = document.getElementById('toolIndicator');
  
  if (!indicator) {
    indicator = document.createElement('div');
    indicator.id = 'toolIndicator';
    indicator.className = 'tool-indicator';
    document.body.appendChild(indicator);
  }
  
  // Only show if on farm screen
  if (state.currentScreen !== 'farmScreen') {
    indicator.classList.remove('show');
    return;
  }
  
  if (state.selectedTool === 1) {
    const usesLeft = 4 - state.wateringCanUses;
    indicator.textContent = `💧 Watering Can (${usesLeft}/4 uses)`;
    indicator.classList.add('show');
  } else if (state.selectedMode === 'harvest') {
    indicator.textContent = `✂️ Harvest Mode`;
    indicator.classList.add('show');
  } else {
    indicator.classList.remove('show');
  }
}

// Calculate yield based on strain and modifiers
function calculateYield(strain, tile) {
  // Base yield in grams (varies by strain tier)
  let baseYield = 0;
  
  if (strain.tier === 'budget') {
    baseYield = 5 + Math.random() * 5; // 5-10g
  } else if (strain.tier === 'premium') {
    baseYield = 10 + Math.random() * 10; // 10-20g
  } else if (strain.tier === 'elite') {
    baseYield = 20 + Math.random() * 15; // 20-35g
  }
  
  // Modifiers
  let modifier = 1.0;
  
  // Watered plants get +20% yield
  if (tile.watered) {
    modifier += 0.2;
  }
  
  // TODO: Add seasonal modifiers
  // TODO: Add fertilizer modifiers
  // TODO: Add other environmental factors
  
  const finalYield = Math.round(baseYield * modifier * 10) / 10; // Round to 1 decimal
  return finalYield;
}

// Setup swipe gestures for tools menu
function setupToolsMenuSwipe() {
  const toolsMenu = document.getElementById('toolsMenu');
  if (!toolsMenu) return;
  
  let touchStartX = 0;
  let touchEndX = 0;
  
  const handleSwipe = () => {
    const swipeDistance = touchStartX - touchEndX;
    
    // Swipe left to open (from right edge)
    if (swipeDistance > 50 && !toolsMenu.classList.contains('expanded')) {
      toolsMenu.classList.add('expanded');
    }
    // Swipe right to close
    else if (swipeDistance < -50 && toolsMenu.classList.contains('expanded')) {
      toolsMenu.classList.remove('expanded');
    }
  };
  
  toolsMenu.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  });
  
  toolsMenu.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  });
  
  // Also allow swiping from right edge of screen
  const farmContainer = document.getElementById('farmContainer');
  if (farmContainer) {
    farmContainer.addEventListener('touchstart', (e) => {
      const touch = e.changedTouches[0];
      // Check if touch started near right edge
      if (touch.screenX > window.innerWidth - 50) {
        touchStartX = touch.screenX;
      }
    });
    
    farmContainer.addEventListener('touchend', (e) => {
      const touch = e.changedTouches[0];
      if (touchStartX > window.innerWidth - 50) {
        touchEndX = touch.screenX;
        handleSwipe();
      }
    });
  }
}

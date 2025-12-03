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
        alert('Watering can is empty! Refill at the water tap (🚰)');
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
      alert('This plant is already watered!');
    } else if (!tile.plant && !tile.locked) {
      alert('You can only water planted crops!');
    }
    return;
  }
  
  // PRIORITY 3: Other interactions
  if (tile.locked) {
    if (state.money >= tile.cost) {
      if (confirm(`Clear ${tile.obstacle} for $${tile.cost}?`)) {
        state.money -= tile.cost;
        tile.locked = false;
        tile.obstacle = null;
        updateMoney();
        renderGrid();
      }
    } else {
      alert(`Not enough money! Need $${tile.cost}`);
    }
  } else if (tile.plant) {
    const elapsed = Date.now() - tile.plant.plantedAt;
    const isReady = elapsed >= tile.plant.growthTime;
    
    if (isReady) {
      // Harvest
      state.money += tile.plant.sellPrice;
      tile.plant = null;
      tile.watered = false;
      updateMoney();
      renderGrid();
    } else {
      const timeRemaining = tile.plant.growthTime - elapsed;
      const minutes = Math.floor(timeRemaining / 60000);
      alert(`Still growing... ${minutes} minutes remaining`);
    }
  }
}

// Refill watering can with countdown
function refillWateringCan() {
  if (!state.ownedTools[1]) {
    alert('You need to buy a Watering Can from the Tools shop first!');
    return;
  }
  
  if (state.wateringCanUses === 0) {
    alert('Your watering can is already full!');
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
        alert('Watering can refilled! (4 uses available)');
      }
    }, 1000);
  }
}

// Render tools menu with all available tools
function updateToolsMenu() {
  const toolsMenu = document.getElementById('toolsMenu');
  if (!toolsMenu) return;
  
  toolsMenu.innerHTML = '';
  
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
        if (confirm(`Buy ${wateringCan.name} for $${wateringCan.cost}?`)) {
          if (state.money >= wateringCan.cost) {
            state.money -= wateringCan.cost;
            state.ownedTools[wateringCan.id] = true;
            updateMoney();
            updateToolsMenu();
            alert(`${wateringCan.name} purchased! Click it to use.`);
          } else {
            alert('Not enough money!');
          }
        }
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
    alert('Watering can is empty! Click "Refill 🚰" button');
    return;
  }
  
  if (state.selectedTool === 1) {
    state.selectedTool = null;
  } else {
    state.selectedTool = 1;
    state.selectedSeed = null;
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
  
  if (state.selectedTool === 1) {
    const usesLeft = 4 - state.wateringCanUses;
    indicator.textContent = `💧 Watering Can (${usesLeft}/4 uses)`;
    indicator.classList.add('show');
  } else {
    indicator.classList.remove('show');
  }
}

// Game State Management
const TILE_SIZE = 80;

// Game State
let state = {
  money: 150,
  cultivationLevel: 1,
  cultivationXP: 0,
  xpToNextLevel: 100, // Increases each level
  
  // Skills system
  skills: {
    harvesting: {
      level: 1,
      xp: 0,
      xpToNext: 100
    }
    // Future skills: planting, watering, etc.
  },
  totalLevel: 1, // Sum of all skill levels
  
  inventory: {}, // { strainId: count } - seeds (max 10 items)
  harvestedProduct: {}, // { strainId: weight } - harvested nugs in grams (max 10 items)
  storage: {}, // { type-id: { type: 'seed'|'product', id, quantity } } - bank storage (max 50 items)
  inventoryLimit: 10,
  storageLimit: 50,
  ownedTools: {}, // { toolId: count } - for consumables, or true for permanent
  activeTools: [], // Array of tool IDs currently active
  selectedSeed: null, // strainId of selected seed
  selectedTool: null, // toolId for manual tools like watering can
  selectedMode: null, // 'water', 'harvest', or null
  wateringCanUses: 0, // Track uses before refill needed
  grid: [],
  currentScreen: 'farmScreen',
  // Market dynamics
  strainPriceMultipliers: {}, // { strainId: multiplier } - starts at 1.0
  strainStock: {}, // { strainId: stock } - regenerates over time
  lastStockUpdate: Date.now(),
  // Shopping basket
  basket: [] // Array of { type: 'seed'|'tool', id, quantity, price }
};

// Initialize grid (10x6 with center 3x3 unlocked)
function initGrid() {
  state.grid = [];
  for (let y = 0; y < 6; y++) {
    for (let x = 0; x < 10; x++) {
      const isCenterArea = x >= 3 && x <= 5 && y >= 1 && y <= 3;
      const obstacles = ['🌾', '🪨', '🌲', '🌾'];
      const costs = [15, 75, 300, 15];
      const obstacleIndex = (x + y * 10) % 4;
      
      state.grid.push({
        id: `${x}-${y}`,
        x, y,
        locked: !isCenterArea,
        obstacle: !isCenterArea ? obstacles[obstacleIndex] : null,
        cost: !isCenterArea ? costs[obstacleIndex] : 0,
        plant: null,
        watered: false
      });
    }
  }
}

// Save game to localStorage
function saveGame() {
  const saveData = {
    money: state.money,
    cultivationLevel: state.cultivationLevel,
    cultivationXP: state.cultivationXP,
    skills: state.skills,
    totalLevel: state.totalLevel,
    inventory: state.inventory,
    harvestedProduct: state.harvestedProduct,
    storage: state.storage,
    ownedTools: state.ownedTools,
    activeTools: state.activeTools,
    wateringCanUses: state.wateringCanUses,
    grid: state.grid,
    strainPriceMultipliers: state.strainPriceMultipliers,
    strainStock: state.strainStock,
    lastStockUpdate: state.lastStockUpdate,
    basket: state.basket,
    savedAt: Date.now()
  };
  
  localStorage.setItem('weedFarmSave', JSON.stringify(saveData));
  // Silent auto-save - no notification
  updateSaveInfo();
}

// Load game from localStorage
function loadGame() {
  const savedData = localStorage.getItem('weedFarmSave');
  if (!savedData) {
    showNotification('⚠️ No save data found!', 'error');
    return false;
  }
  
  try {
    const saveData = JSON.parse(savedData);
    
    // Restore state
    state.money = saveData.money || 150;
    state.cultivationLevel = saveData.cultivationLevel || 1;
    state.cultivationXP = saveData.cultivationXP || 0;
    state.skills = saveData.skills || {
      harvesting: { level: 1, xp: 0, xpToNext: 100 }
    };
    state.totalLevel = saveData.totalLevel || 1;
    state.inventory = saveData.inventory || {};
    state.harvestedProduct = saveData.harvestedProduct || {};
    state.storage = saveData.storage || {};
    state.ownedTools = saveData.ownedTools || {};
    state.activeTools = saveData.activeTools || [];
    state.wateringCanUses = saveData.wateringCanUses || 0;
    state.grid = saveData.grid || [];
    state.strainPriceMultipliers = saveData.strainPriceMultipliers || {};
    state.strainStock = saveData.strainStock || {};
    state.lastStockUpdate = saveData.lastStockUpdate || Date.now();
    state.basket = saveData.basket || [];
    
    updateMoney();
    renderGrid();
    showNotification('✅ Game loaded successfully!', 'success');
    return true;
  } catch (e) {
    showNotification('❌ Failed to load save data!', 'error');
    return false;
  }
}

// Check if save exists
function hasSaveData() {
  return localStorage.getItem('weedFarmSave') !== null;
}

// Update save info display
function updateSaveInfo() {
  const saveInfo = document.getElementById('saveInfo');
  if (!saveInfo) return;
  
  if (hasSaveData()) {
    try {
      const saveData = JSON.parse(localStorage.getItem('weedFarmSave'));
      const date = new Date(saveData.savedAt);
      saveInfo.textContent = `Last saved: ${date.toLocaleString()} | Level ${saveData.cultivationLevel} | $${saveData.money}`;
    } catch (e) {
      saveInfo.textContent = 'Save data found';
    }
  } else {
    saveInfo.textContent = 'No save data found';
  }
}

// Start new game
function startNewGame() {
  if (hasSaveData()) {
    showConfirmModal(
      '⚠️ Start New Game?',
      'Starting a new game will overwrite your current save. Continue?',
      () => {
        // Reset to initial state
        state.money = 150;
        state.cultivationLevel = 1;
        state.cultivationXP = 0;
        state.skills = {
          harvesting: { level: 1, xp: 0, xpToNext: 100 }
        };
        state.totalLevel = 1;
        state.inventory = {};
        state.harvestedProduct = {};
        state.storage = {};
        state.ownedTools = {};
        state.activeTools = [];
        state.selectedSeed = null;
        state.selectedTool = null;
        state.wateringCanUses = 0;
        state.grid = [];
        state.currentScreen = 'farmScreen';
        state.strainPriceMultipliers = {};
        state.strainStock = {};
        state.lastStockUpdate = Date.now();
        state.basket = [];
        
        // Reinitialize
        initGrid();
        initMarket();
        
        // Go to game
        startGame();
      }
    );
  } else {
    // No save data, just start
    state.money = 150;
    state.cultivationLevel = 1;
    state.cultivationXP = 0;
    state.skills = {
      harvesting: { level: 1, xp: 0, xpToNext: 100 }
    };
    state.totalLevel = 1;
    state.inventory = {};
    state.harvestedProduct = {};
    state.storage = {};
    state.ownedTools = {};
    state.activeTools = [];
    state.selectedSeed = null;
    state.selectedTool = null;
    state.wateringCanUses = 0;
    state.grid = [];
    state.currentScreen = 'farmScreen';
    state.strainPriceMultipliers = {};
    state.strainStock = {};
    state.lastStockUpdate = Date.now();
    state.basket = [];
    
    initGrid();
    initMarket();
    startGame();
  }
}

// Start game (switch from menu to game)
function startGame() {
  document.getElementById('startMenu').classList.remove('active');
  document.getElementById('farmScreen').classList.add('active');
  state.currentScreen = 'farmScreen';
  
  // Show UI elements
  document.querySelector('.top-bar').style.display = 'flex';
  document.querySelector('.bottom-nav').style.display = 'flex';
  
  updateMoney();
  renderGrid();
  updateToolsMenu();
  document.getElementById('toolsMenu').classList.add('show');
  
  // Auto-save every 10 minutes (600000ms)
  setInterval(() => {
    saveGame();
  }, 600000);
}

// Skill system functions
function addSkillXP(skillName, amount) {
  const skill = state.skills[skillName];
  if (!skill) return;
  
  skill.xp += amount;
  
  // Check for level up
  while (skill.xp >= skill.xpToNext && skill.level < 100) {
    skill.xp -= skill.xpToNext;
    skill.level++;
    
    // XP needed increases - faster early levels, slower later
    // Level 1-10: ~5% increase per level
    // Level 10-30: ~7% increase per level  
    // Level 30+: ~10% increase per level
    let xpIncrease;
    if (skill.level <= 10) {
      xpIncrease = 1.05; // 5% increase - fast early progression
    } else if (skill.level <= 30) {
      xpIncrease = 1.07; // 7% increase - medium progression
    } else {
      xpIncrease = 1.10; // 10% increase - slower late game
    }
    
    skill.xpToNext = Math.floor(skill.xpToNext * xpIncrease);
    
    // Update total level
    calculateTotalLevel();
    
    // Show level up notification
    showNotification(`🎉 Harvesting level up! Now level ${skill.level}`, 'success');
  }
}

function calculateTotalLevel() {
  let total = 0;
  Object.keys(state.skills).forEach(skillName => {
    total += state.skills[skillName].level;
  });
  state.totalLevel = total;
}

function getHarvestingLevel() {
  return state.skills.harvesting ? state.skills.harvesting.level : 1;
}

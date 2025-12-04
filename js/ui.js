// UI Management Module

// Update money display
function updateMoney() {
  document.getElementById('money').textContent = state.money;
}

// Update level displays
function updateLevels() {
  document.getElementById('totalLevel').textContent = state.totalLevel;
  document.getElementById('harvestingLevel').textContent = state.skills.harvesting.level;
}


// Setup navigation
function setupNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetScreen = btn.dataset.screen;
      
      // Skip if no screen (bag/water buttons)
      if (!targetScreen) return;
      
      // Update active button
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update active screen
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
      document.getElementById(targetScreen).classList.add('active');
      
      // Show/hide tools menu based on screen
      const toolsMenu = document.getElementById('toolsMenu');
      if (targetScreen === 'farmScreen') {
        toolsMenu.classList.add('show');
        updateToolsMenu();
        setupToolsMenuSwipe();
      } else {
        toolsMenu.classList.remove('show');
        toolsMenu.classList.remove('expanded');
      }
      
      // Render shop when opening it
      if (targetScreen === 'shopScreen') {
        renderShop();
      }
      
      // Render skills when opening it
      if (targetScreen === 'skillsScreen') {
        renderSkills();
      }
      
      state.currentScreen = targetScreen;
    });
  });
}

// Setup start menu
function setupStartMenu() {
  // New Game button
  document.getElementById('newGameBtn').addEventListener('click', () => {
    startNewGame();
  });
  
  // Load Game button
  document.getElementById('loadGameBtn').addEventListener('click', () => {
    if (loadGame()) {
      startGame();
    }
  });
  
  // Continue button (if save exists)
  const continueBtn = document.getElementById('continueBtn');
  if (hasSaveData()) {
    continueBtn.style.display = 'block';
    continueBtn.addEventListener('click', () => {
      if (loadGame()) {
        startGame();
      }
    });
  }
  
  // Update save info on load
  updateSaveInfo();
}

// Start game loop for updating plants
function startGameLoop() {
  // Game loop - update more frequently to show smooth animations
  setInterval(() => {
    if (state.currentScreen === 'farmScreen') {
      // Check if any tiles are animating
      const hasAnimations = state.grid.some(tile => tile.planting || tile.harvesting);
      
      // Render grid (animations update every frame, plants update every second)
      renderGrid();
    }
    
    // Always update levels display
    updateLevels();
  }, 100); // Check every 100ms for smooth animation updates
}

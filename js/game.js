// Main Game Initialization

// Initialize game on page load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize game data
  initGrid();
  initMarket();
  
  // Setup UI
  setupStartMenu();
  setupNavigation();
  setupInventoryListeners();
  
  // Initial render
  renderGrid();
  updateTotalLevel();
  
  // Show tools menu initially (since farm is default screen)
  setTimeout(() => {
    updateToolsMenu();
    document.getElementById('toolsMenu').classList.add('show');
    setupToolsMenuSwipe();
  }, 100);
  
  // Start game loop
  startGameLoop();
  
  console.log('🌿 Weed Farm Idle Game loaded successfully!');
});

// Inventory Management Module

// Render inventory
function renderInventory() {
  const seedBag = document.getElementById('seedBag');
  seedBag.innerHTML = '';
  
  const hasSeeds = Object.keys(state.inventory).some(id => state.inventory[id] > 0);
  
  if (!hasSeeds) {
    seedBag.innerHTML = '<div class="empty-bag">Your bag is empty!<br>Visit the shop to buy seeds.</div>';
    return;
  }
  
  // Show all seeds in inventory
  Object.keys(state.inventory).forEach(strainId => {
    const count = state.inventory[strainId];
    if (count <= 0) return;
    
    const strain = STRAINS.find(s => s.id === parseInt(strainId));
    if (!strain) return;
    
    const stack = document.createElement('div');
    stack.className = `seed-stack ${state.selectedSeed === strain.id ? 'selected' : ''}`;
    
    stack.innerHTML = `
      <div class="seed-count">x${count}</div>
      <div class="seed-icon">🌱</div>
      <div class="seed-name">${strain.name}</div>
    `;
    
    stack.addEventListener('click', () => {
      // Select seed
      state.selectedSeed = strain.id;
      
      // Close inventory overlay
      document.getElementById('inventoryOverlay').classList.remove('show');
      
      // Update grid to show plantable tiles
      renderGrid();
    });
    
    seedBag.appendChild(stack);
  });
}

// Setup inventory event listeners
function setupInventoryListeners() {
  // Bag button - toggle inventory overlay
  document.getElementById('bagButton').addEventListener('click', () => {
    const overlay = document.getElementById('inventoryOverlay');
    overlay.classList.add('show');
    renderInventory();
  });
  
  // Close inventory button
  document.querySelector('.close-inventory').addEventListener('click', () => {
    document.getElementById('inventoryOverlay').classList.remove('show');
  });
  
  // Close inventory on backdrop click
  document.getElementById('inventoryOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'inventoryOverlay') {
      document.getElementById('inventoryOverlay').classList.remove('show');
    }
  });
}

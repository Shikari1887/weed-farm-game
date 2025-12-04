// Inventory Management Module

// Render seeds inventory tab
function renderSeedsInventory() {
  const seedBag = document.getElementById('seedBag');
  if (!seedBag) return;
  
  seedBag.innerHTML = '';
  
  const hasSeeds = Object.keys(state.inventory).some(id => state.inventory[id] > 0);
  
  if (!hasSeeds) {
    seedBag.innerHTML = '<div class="empty-bag">No seeds in inventory!<br>Visit the shop to buy seeds.</div>';
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

// Render product inventory tab
function renderProductInventory() {
  const productStorage = document.getElementById('productStorage');
  if (!productStorage) return;
  
  productStorage.innerHTML = '';
  
  const hasProduct = Object.keys(state.harvestedProduct).some(id => state.harvestedProduct[id] > 0);
  
  if (!hasProduct) {
    productStorage.innerHTML = '<div class="empty-bag">No harvested product yet!<br>Harvest plants to collect product.</div>';
    return;
  }
  
  // Show all harvested product
  Object.keys(state.harvestedProduct).forEach(strainId => {
    const weight = state.harvestedProduct[strainId];
    if (weight <= 0) return;
    
    const strain = STRAINS.find(s => s.id === parseInt(strainId));
    if (!strain) return;
    
    const item = document.createElement('div');
    item.className = 'product-item';
    
    item.innerHTML = `
      <div class="product-weight">${weight}g</div>
      <div class="product-icon">🌿</div>
      <div class="product-name">${strain.name}</div>
      <div class="product-quality quality-fresh">Fresh</div>
    `;
    
    // Future: Add click handler for drying/curing/selling
    
    productStorage.appendChild(item);
  });
}

// Render inventory (both tabs)
function renderInventory() {
  renderSeedsInventory();
  renderProductInventory();
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
  
  // Setup inventory tab switching
  document.querySelectorAll('.inventory-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      
      // Update active tab button
      document.querySelectorAll('.inventory-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active content
      document.querySelectorAll('.inventory-tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(`${tabName}InventoryTab`).classList.add('active');
    });
  });
}

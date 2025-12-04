// Inventory management with selection + transfer system

let selectedInventoryItems = new Set(); // Set of "type-id" strings
let selectedStorageItems = new Set();

// Helper: Count items in inventory
function getInventoryCount(type) {
  if (type === 'seeds') {
    return Object.keys(state.inventory).filter(id => state.inventory[id] > 0).length;
  } else if (type === 'product') {
    return Object.keys(state.harvestedProduct).filter(id => state.harvestedProduct[id] > 0).length;
  }
  return 0;
}

// Helper: Count items in storage
function getStorageCount() {
  return Object.keys(state.storage).length;
}

// Helper: Check if can add to inventory
function canAddToInventory(type) {
  const count = getInventoryCount(type);
  return count < state.inventoryLimit;
}

// Helper: Check if can add to storage
function canAddToStorage() {
  const count = getStorageCount();
  return count < state.storageLimit;
}

// Update capacity counters
function updateCapacityCounters() {
  const seedsCount = getInventoryCount('seeds');
  const productCount = getInventoryCount('product');
  const storageCount = getStorageCount();
  
  document.getElementById('seedsCount').textContent = seedsCount;
  document.getElementById('productCount').textContent = productCount;
  document.getElementById('storageCount').textContent = storageCount;
}

// Render seeds inventory tab
function renderSeedsInventory() {
  const seedBag = document.getElementById('seedBag');
  if (!seedBag) return;
  
  seedBag.innerHTML = '';
  
  const hasSeeds = Object.keys(state.inventory).some(id => state.inventory[id] > 0);
  
  if (!hasSeeds) {
    seedBag.innerHTML = '<div class="empty-bag">No seeds in inventory!<br>Visit the shop to buy seeds.</div>';
    updateCapacityCounters();
    return;
  }
  
  // Show all seeds in inventory
  Object.keys(state.inventory).forEach(strainId => {
    const count = state.inventory[strainId];
    if (count <= 0) return;
    
    const strain = STRAINS.find(s => s.id === parseInt(strainId));
    if (!strain) return;
    
    const itemKey = `seed-${strainId}`;
    const isSelected = selectedInventoryItems.has(itemKey);
    
    const stack = document.createElement('div');
    stack.className = `seed-stack ${state.selectedSeed === strain.id ? 'selected' : ''} ${isSelected ? 'selected' : ''}`;
    stack.dataset.type = 'seed';
    stack.dataset.id = strainId;
    stack.dataset.key = itemKey;
    
    stack.innerHTML = `
      <div class="seed-count">x${count}</div>
      <div class="seed-icon">🌱</div>
      <div class="seed-name">${strain.name}</div>
    `;
    
    stack.addEventListener('click', (e) => {
      // If holding shift/ctrl, toggle selection for transfer
      if (e.shiftKey || e.ctrlKey || e.metaKey) {
        if (isSelected) {
          selectedInventoryItems.delete(itemKey);
        } else {
          selectedInventoryItems.add(itemKey);
        }
        renderInventory();
      } else {
        // Normal click - select seed for planting
        state.selectedSeed = strain.id;
        document.getElementById('inventoryOverlay').classList.remove('show');
        renderGrid();
      }
    });
    
    seedBag.appendChild(stack);
  });
  
  updateCapacityCounters();
}

// Render product inventory tab
function renderProductInventory() {
  const productInventory = document.getElementById('productInventory');
  if (!productInventory) return;
  
  productInventory.innerHTML = '';
  
  const hasProduct = Object.keys(state.harvestedProduct).some(id => state.harvestedProduct[id] > 0);
  
  if (!hasProduct) {
    productInventory.innerHTML = '<div class="empty-bag">No harvested product yet!<br>Harvest plants to collect product.</div>';
    updateCapacityCounters();
    return;
  }
  
  // Show all harvested product
  Object.keys(state.harvestedProduct).forEach(strainId => {
    const weight = state.harvestedProduct[strainId];
    if (weight <= 0) return;
    
    const strain = STRAINS.find(s => s.id === parseInt(strainId));
    if (!strain) return;
    
    const itemKey = `product-${strainId}`;
    const isSelected = selectedInventoryItems.has(itemKey);
    
    const item = document.createElement('div');
    item.className = `product-item ${isSelected ? 'selected' : ''}`;
    item.dataset.type = 'product';
    item.dataset.id = strainId;
    item.dataset.key = itemKey;
    
    item.innerHTML = `
      <div class="product-weight">${weight}g</div>
      <div class="product-icon">🌿</div>
      <div class="product-name">${strain.name}</div>
      <div class="product-quality quality-fresh">Fresh</div>
    `;
    
    item.addEventListener('click', () => {
      if (isSelected) {
        selectedInventoryItems.delete(itemKey);
      } else {
        selectedInventoryItems.add(itemKey);
      }
      renderInventory();
    });
    
    productInventory.appendChild(item);
  });
  
  updateCapacityCounters();
}

// Render storage section
function renderStorage() {
  const storageContainer = document.getElementById('storageContainer');
  if (!storageContainer) return;
  
  storageContainer.innerHTML = '';
  
  const hasItems = Object.keys(state.storage).length > 0;
  
  if (!hasItems) {
    storageContainer.innerHTML = '<div class="empty-bag">Storage is empty!<br>Select items and transfer here.</div>';
    updateCapacityCounters();
    return;
  }
  
  // Show all storage items (smaller grid)
  Object.keys(state.storage).forEach(key => {
    const storageItem = state.storage[key];
    const strain = STRAINS.find(s => s.id === parseInt(storageItem.id));
    if (!strain) return;
    
    const isSelected = selectedStorageItems.has(key);
    
    const item = document.createElement('div');
    item.className = `storage-item-small ${isSelected ? 'selected' : ''}`;
    item.dataset.storageKey = key;
    item.dataset.type = storageItem.type;
    item.dataset.id = storageItem.id;
    
    if (storageItem.type === 'seed') {
      item.innerHTML = `
        <div class="seed-count">x${storageItem.quantity}</div>
        <div class="seed-icon">🌱</div>
        <div class="seed-name">${strain.name}</div>
      `;
    } else {
      item.innerHTML = `
        <div class="product-weight">${storageItem.quantity}g</div>
        <div class="product-icon">🌿</div>
        <div class="product-name">${strain.name}</div>
      `;
    }
    
    item.addEventListener('click', () => {
      if (isSelected) {
        selectedStorageItems.delete(key);
      } else {
        selectedStorageItems.add(key);
      }
      renderStorage();
    });
    
    storageContainer.appendChild(item);
  });
  
  updateCapacityCounters();
}

// Transfer selected items to storage
function transferToStorage() {
  if (selectedInventoryItems.size === 0) {
    showNotification('⚠️ No items selected!', 'warning');
    return;
  }
  
  if (getStorageCount() + selectedInventoryItems.size > state.storageLimit) {
    showNotification('⚠️ Not enough storage space!', 'warning');
    return;
  }
  
  selectedInventoryItems.forEach(itemKey => {
    const [type, id] = itemKey.split('-');
    
    if (type === 'seed') {
      const quantity = state.inventory[id];
      delete state.inventory[id];
      state.storage[itemKey] = { type: 'seed', id: parseInt(id), quantity };
    } else if (type === 'product') {
      const weight = state.harvestedProduct[id];
      delete state.harvestedProduct[id];
      state.storage[itemKey] = { type: 'product', id: parseInt(id), quantity: weight };
    }
  });
  
  showNotification(`📦 Moved ${selectedInventoryItems.size} item(s) to storage`, 'success');
  selectedInventoryItems.clear();
  renderInventory();
}

// Transfer selected items to inventory
function transferToInventory() {
  if (selectedStorageItems.size === 0) {
    showNotification('⚠️ No items selected!', 'warning');
    return;
  }
  
  // Check if there's space for each type
  let seedCount = 0;
  let productCount = 0;
  
  selectedStorageItems.forEach(key => {
    const item = state.storage[key];
    if (item.type === 'seed') seedCount++;
    else if (item.type === 'product') productCount++;
  });
  
  if (getInventoryCount('seeds') + seedCount > state.inventoryLimit ||
      getInventoryCount('product') + productCount > state.inventoryLimit) {
    showNotification('⚠️ Not enough inventory space!', 'warning');
    return;
  }
  
  selectedStorageItems.forEach(key => {
    const item = state.storage[key];
    delete state.storage[key];
    
    if (item.type === 'seed') {
      state.inventory[item.id] = item.quantity;
    } else if (item.type === 'product') {
      state.harvestedProduct[item.id] = item.quantity;
    }
  });
  
  showNotification(`🎒 Moved ${selectedStorageItems.size} item(s) to inventory`, 'success');
  selectedStorageItems.clear();
  renderInventory();
}

// Render inventory (all sections)
function renderInventory() {
  renderSeedsInventory();
  renderProductInventory();
  renderStorage();
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
    selectedInventoryItems.clear();
    selectedStorageItems.clear();
  });
  
  // Close inventory on backdrop click
  document.getElementById('inventoryOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'inventoryOverlay') {
      document.getElementById('inventoryOverlay').classList.remove('show');
      selectedInventoryItems.clear();
      selectedStorageItems.clear();
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
      
      // Clear selections when switching tabs
      selectedInventoryItems.clear();
      renderInventory();
    });
  });
  
  // Transfer buttons
  document.getElementById('transferToStorage').addEventListener('click', transferToStorage);
  document.getElementById('transferToInventory').addEventListener('click', transferToInventory);
}

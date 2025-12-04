// Inventory management with drag & drop and storage

let seedsSortable = null;
let productSortable = null;
let storageSortable = null;

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
    
    const stack = document.createElement('div');
    stack.className = `seed-stack ${state.selectedSeed === strain.id ? 'selected' : ''}`;
    stack.dataset.type = 'seed';
    stack.dataset.id = strainId;
    
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
  
  // Initialize drag & drop
  if (seedsSortable) {
    seedsSortable.destroy();
  }
  
  seedsSortable = Sortable.create(seedBag, {
    group: {
      name: 'inventory',
      pull: true,
      put: ['storage']
    },
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    filter: '.empty-bag',
    onEnd: function(evt) {
      handleInventoryDrop(evt, 'seeds');
    }
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
    
    const item = document.createElement('div');
    item.className = 'product-item';
    item.dataset.type = 'product';
    item.dataset.id = strainId;
    
    item.innerHTML = `
      <div class="product-weight">${weight}g</div>
      <div class="product-icon">🌿</div>
      <div class="product-name">${strain.name}</div>
      <div class="product-quality quality-fresh">Fresh</div>
    `;
    
    productInventory.appendChild(item);
  });
  
  // Initialize drag & drop
  if (productSortable) {
    productSortable.destroy();
  }
  
  productSortable = Sortable.create(productInventory, {
    group: {
      name: 'inventory',
      pull: true,
      put: ['storage']
    },
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    filter: '.empty-bag',
    onEnd: function(evt) {
      handleInventoryDrop(evt, 'product');
    }
  });
  
  updateCapacityCounters();
}

// Render storage tab
function renderStorage() {
  const storageContainer = document.getElementById('storageContainer');
  if (!storageContainer) return;
  
  storageContainer.innerHTML = '';
  
  const hasItems = Object.keys(state.storage).length > 0;
  
  if (!hasItems) {
    storageContainer.innerHTML = '<div class="empty-bag">Storage is empty!<br>Drag items here from inventory.</div>';
    updateCapacityCounters();
    return;
  }
  
  // Show all storage items
  Object.keys(state.storage).forEach(key => {
    const storageItem = state.storage[key];
    const strain = STRAINS.find(s => s.id === parseInt(storageItem.id));
    if (!strain) return;
    
    const item = document.createElement('div');
    item.className = storageItem.type === 'seed' ? 'seed-stack storage-item' : 'product-item storage-item';
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
        <div class="product-quality quality-fresh">Fresh</div>
      `;
    }
    
    storageContainer.appendChild(item);
  });
  
  // Initialize drag & drop
  if (storageSortable) {
    storageSortable.destroy();
  }
  
  storageSortable = Sortable.create(storageContainer, {
    group: {
      name: 'storage',
      pull: true,
      put: ['inventory']
    },
    animation: 150,
    ghostClass: 'sortable-ghost',
    chosenClass: 'sortable-chosen',
    dragClass: 'sortable-drag',
    filter: '.empty-bag',
    onEnd: function(evt) {
      handleStorageDrop(evt);
    }
  });
  
  updateCapacityCounters();
}

// Handle drops from inventory to storage or within inventory
function handleInventoryDrop(evt, inventoryType) {
  const itemElement = evt.item;
  const type = itemElement.dataset.type;
  const id = parseInt(itemElement.dataset.id);
  
  // Check if dropped into storage
  if (evt.to.id === 'storageContainer') {
    // Moving to storage
    if (!canAddToStorage()) {
      showNotification('⚠️ Storage is full! (50/50)', 'warning');
      renderInventory();
      return;
    }
    
    // Remove from inventory
    if (type === 'seed') {
      const quantity = state.inventory[id];
      delete state.inventory[id];
      
      // Add to storage
      const storageKey = `seed-${id}`;
      state.storage[storageKey] = {
        type: 'seed',
        id: id,
        quantity: quantity
      };
    } else if (type === 'product') {
      const weight = state.harvestedProduct[id];
      delete state.harvestedProduct[id];
      
      // Add to storage
      const storageKey = `product-${id}`;
      state.storage[storageKey] = {
        type: 'product',
        id: id,
        quantity: weight
      };
    }
    
    showNotification('📦 Moved to storage', 'success');
  }
  
  // Re-render everything
  renderInventory();
}

// Handle drops from storage to inventory or within storage
function handleStorageDrop(evt) {
  const itemElement = evt.item;
  const storageKey = itemElement.dataset.storageKey;
  const type = itemElement.dataset.type;
  const id = parseInt(itemElement.dataset.id);
  
  // Check if dropped into inventory
  if (evt.to.id === 'seedBag' || evt.to.id === 'productInventory') {
    const targetType = evt.to.id === 'seedBag' ? 'seeds' : 'product';
    
    // Check inventory capacity
    if (!canAddToInventory(targetType)) {
      showNotification('⚠️ Inventory is full! (10/10)', 'warning');
      renderInventory();
      return;
    }
    
    // Get storage item
    const storageItem = state.storage[storageKey];
    if (!storageItem) return;
    
    // Remove from storage
    delete state.storage[storageKey];
    
    // Add to inventory
    if (storageItem.type === 'seed') {
      if (!state.inventory[id]) {
        state.inventory[id] = 0;
      }
      state.inventory[id] = storageItem.quantity;
    } else if (storageItem.type === 'product') {
      if (!state.harvestedProduct[id]) {
        state.harvestedProduct[id] = 0;
      }
      state.harvestedProduct[id] = storageItem.quantity;
    }
    
    showNotification('🎒 Moved to inventory', 'success');
  }
  
  // Re-render everything
  renderInventory();
}

// Render inventory (all tabs)
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

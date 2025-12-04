// Shop Management Module

// Render shop
function renderShop() {
  const shopLevel = document.getElementById('shopLevel');
  shopLevel.textContent = state.cultivationLevel;
  
  renderSeeds();
  renderTools();
  updateBasketUI();
  
  // Setup tab switching
  document.querySelectorAll('.shop-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      
      // Update active tab button
      document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Update active content
      document.querySelectorAll('.shop-tab-content').forEach(c => c.classList.remove('active'));
      document.getElementById(`${tabName}Tab`).classList.add('active');
    });
  });
  
  // Setup basket button
  const basketBtn = document.getElementById('basketBtn');
  const basketPanel = document.getElementById('basketPanel');
  const closeBasket = document.querySelector('.close-basket');
  
  if (basketBtn && basketPanel) {
    basketBtn.addEventListener('click', () => {
      basketPanel.classList.add('show');
      renderBasketPanel();
    });
    
    if (closeBasket) {
      closeBasket.addEventListener('click', () => {
        basketPanel.classList.remove('show');
      });
    }
    
    // Close on backdrop click
    basketPanel.addEventListener('click', (e) => {
      if (e.target === basketPanel) {
        basketPanel.classList.remove('show');
      }
    });
  }
  
  // Setup checkout button
  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      checkout();
    });
  }
  
  // Setup clear basket button
  const clearBasketBtn = document.getElementById('clearBasketBtn');
  if (clearBasketBtn) {
    clearBasketBtn.addEventListener('click', () => {
      if (state.basket.length > 0) {
        showConfirmModal(
          '🗑️ Clear Basket?',
          'Remove all items from your basket?',
          () => clearBasket()
        );
      }
    });
  }
}

// Render seeds list
function renderSeeds() {
  const strainList = document.getElementById('strainList');
  strainList.innerHTML = '';
  
  // Update market first
  updateMarket();
  
  STRAINS.forEach(strain => {
    const isUnlocked = state.cultivationLevel >= strain.level;
    const currentPrice = getCurrentPrice(strain);
    const canAfford = state.money >= currentPrice;
    const stock = Math.floor(state.strainStock[strain.id] || 0);
    const outOfStock = stock <= 0;
    const priceChange = ((state.strainPriceMultipliers[strain.id] || 1.0) - 1) * 100;
    
    const card = document.createElement('div');
    card.className = `strain-card ${!isUnlocked ? 'locked' : ''}`;
    
    if (isUnlocked) {
      const priceIndicator = priceChange > 0 ? `📈` : priceChange < 0 ? `📉` : '';
      
      card.innerHTML = `
        <div class="strain-info">
          <div class="strain-tier tier-${strain.tier}">${strain.tier}</div>
          <div class="strain-name">${strain.name}</div>
          <div class="strain-stats">
            <span>💰 $${currentPrice} ${priceIndicator}</span>
            <span>📈 $${strain.sellPrice}</span>
            <span>⏱️ ${Math.round(strain.growthTime / 60000)}m</span>
            <span style="color: ${stock < 10 ? '#ef4444' : stock < 30 ? '#fbbf24' : '#4ade80'}; font-size: 10px;">
              📦 ${outOfStock ? 'OUT' : stock}
            </span>
          </div>
        </div>
      `;
      
      if (!outOfStock && canAfford) {
        card.addEventListener('click', (e) => {
          e.stopPropagation();
          showStrainDetails(strain);
        });
      } else {
        card.style.opacity = '0.5';
        card.style.cursor = 'not-allowed';
      }
    } else {
      card.innerHTML = `
        <div class="strain-info">
          <div class="strain-tier tier-${strain.tier}">${strain.tier}</div>
          <div class="strain-name">${strain.name}</div>
          <div class="strain-stats">
            <span style="font-size: 10px;">???</span>
          </div>
          <div class="locked-requirement">
            🔒 Lv ${strain.level}
          </div>
        </div>
      `;
    }
    
    strainList.appendChild(card);
  });
}

// Render tools list
function renderTools() {
  const toolsList = document.getElementById('toolsList');
  toolsList.innerHTML = '';
  
  TOOLS.forEach(tool => {
    const isUnlocked = state.cultivationLevel >= tool.level;
    const canAfford = state.money >= tool.cost;
    const isOwned = state.ownedTools[tool.id];
    const isPermanent = tool.uses === Infinity;
    
    const card = document.createElement('div');
    card.className = `strain-card ${!isUnlocked ? 'locked' : ''}`;
    
    if (isUnlocked) {
      const buttonText = isOwned && isPermanent ? 'Owned' : 'Add to Basket';
      const buttonDisabled = (isOwned && isPermanent) || !canAfford;
      
      card.innerHTML = `
        <div class="strain-info">
          <div class="strain-tier tier-${tool.tier}">${tool.tier}</div>
          <div class="strain-name">${tool.emoji} ${tool.name}</div>
          <div class="strain-stats">
            <span>${tool.description}</span>
          </div>
          <div class="strain-stats">
            <span>💰 $${tool.cost}</span>
            ${isOwned && !isPermanent ? `<span>📦 x${state.ownedTools[tool.id]}</span>` : ''}
          </div>
        </div>
      `;
      
      if (!buttonDisabled) {
        card.addEventListener('click', (e) => {
          e.stopPropagation();
          showToolDetails(tool);
        });
      } else {
        card.style.opacity = '0.5';
        card.style.cursor = 'not-allowed';
      }
    } else {
      card.innerHTML = `
        <div class="strain-info">
          <div class="strain-tier tier-${tool.tier}">${tool.tier}</div>
          <div class="strain-name">${tool.emoji} ${tool.name}</div>
          <div class="strain-stats">
            <span style="font-size: 10px;">???</span>
          </div>
          <div class="locked-requirement">
            🔒 Lv ${tool.level}
          </div>
        </div>
      `;
    }
    
    toolsList.appendChild(card);
  });
}

// Buy tool
function buyTool(tool) {
  if (state.money >= tool.cost) {
    state.money -= tool.cost;
    
    if (tool.uses === Infinity) {
      // Permanent tool
      state.ownedTools[tool.id] = true;
      state.activeTools.push(tool.id);
    } else {
      // Consumable tool
      if (!state.ownedTools[tool.id]) {
        state.ownedTools[tool.id] = 0;
      }
      state.ownedTools[tool.id]++;
    }
    
    updateMoney();
    renderShop();
    
    const message = tool.uses === Infinity 
      ? `✅ ${tool.name} purchased!\n🔧 Now active on all plants.`
      : `✅ ${tool.name} purchased!`;
    showNotification(message, 'success');
  }
}

// Show strain details modal
function showStrainDetails(strain) {
  // Remove any existing popup
  const existing = document.querySelector('.item-details-modal');
  if (existing) existing.remove();
  
  const currentPrice = getCurrentPrice(strain);
  const stock = Math.floor(state.strainStock[strain.id] || 0);
  const maxAffordable = Math.floor(state.money / currentPrice);
  const maxPurchase = Math.min(maxAffordable, stock);
  const priceChange = ((state.strainPriceMultipliers[strain.id] || 1.0) - 1) * 100;
  const priceIndicator = priceChange > 0 ? `📈 +${priceChange.toFixed(0)}%` : priceChange < 0 ? `📉 ${priceChange.toFixed(0)}%` : '➡️ Stable';
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'item-details-modal';
  
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="item-details-content">
      <div class="item-details-header">
        <div>
          <div class="strain-tier tier-${strain.tier}">${strain.tier}</div>
          <h2>${strain.name}</h2>
        </div>
        <button class="close-details">✕</button>
      </div>
      
      <div class="item-details-body">
        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-label">💰 Buy Price</div>
            <div class="detail-value">$${currentPrice}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">📈 Sell Price</div>
            <div class="detail-value">$${strain.sellPrice}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">⏱️ Growth Time</div>
            <div class="detail-value">${Math.round(strain.growthTime / 60000)} min</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">⭐ XP Reward</div>
            <div class="detail-value">${strain.xp} XP</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">📊 Market</div>
            <div class="detail-value">${priceIndicator}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">📦 Stock</div>
            <div class="detail-value" style="color: ${stock < 10 ? '#ef4444' : stock < 30 ? '#fbbf24' : '#4ade80'}">${stock}</div>
          </div>
        </div>
        
        <div class="quantity-section">
          <div class="quantity-label">Select Quantity:</div>
          <div class="quantity-buttons">
            <button class="qty-btn" data-qty="1" ${maxPurchase < 1 ? 'disabled' : ''}>1x</button>
            <button class="qty-btn" data-qty="5" ${maxPurchase < 5 ? 'disabled' : ''}>5x</button>
            <button class="qty-btn" data-qty="10" ${maxPurchase < 10 ? 'disabled' : ''}>10x</button>
          </div>
          <div class="custom-input-row">
            <input type="number" class="custom-input" placeholder="Custom amount" min="1" max="${maxPurchase}" id="customQty" value="1">
          </div>
          <div class="max-info">You can afford: ${maxAffordable} • In stock: ${stock}</div>
        </div>
      </div>
      
      <div class="item-details-footer">
        <button class="details-btn cancel">Cancel</button>
        <button class="details-btn confirm">🛒 Add to Basket</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Animate in
  setTimeout(() => modal.classList.add('show'), 10);
  
  // Handle quantity button clicks
  modal.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const qty = parseInt(btn.dataset.qty);
      document.getElementById('customQty').value = qty;
    });
  });
  
  // Handle close
  const closeBtn = modal.querySelector('.close-details');
  const backdrop = modal.querySelector('.modal-backdrop');
  const cancelBtn = modal.querySelector('.cancel');
  
  const handleClose = () => {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  };
  
  closeBtn.addEventListener('click', handleClose);
  backdrop.addEventListener('click', handleClose);
  cancelBtn.addEventListener('click', handleClose);
  
  // Handle confirm - Add to basket
  modal.querySelector('.confirm').addEventListener('click', () => {
    const qty = parseInt(document.getElementById('customQty').value) || 0;
    if (qty > 0 && qty <= maxPurchase) {
      // Check inventory space
      const currentSeedCount = Object.keys(state.inventory).filter(id => state.inventory[id] > 0).length;
      const hasSpace = currentSeedCount < state.inventoryLimit || state.inventory[strain.id];
      
      if (!hasSpace) {
        showNotification('⚠️ Inventory full! Move seeds to storage first.', 'warning');
        return;
      }
      
      addToBasket('seed', strain.id, qty, currentPrice);
      handleClose();
      showNotification(`🛒 Added ${qty}x ${strain.name} to basket`, 'success');
    } else if (qty > maxPurchase) {
      showNotification(`⚠️ Maximum you can buy: ${maxPurchase}!`, 'warning');
    } else {
      showNotification('⚠️ Please enter a valid quantity.', 'warning');
    }
  });
}

// Show tool details modal
function showToolDetails(tool) {
  // Remove any existing popup
  const existing = document.querySelector('.item-details-modal');
  if (existing) existing.remove();
  
  const canAfford = state.money >= tool.cost;
  const isOwned = state.ownedTools[tool.id];
  const isPermanent = tool.uses === Infinity;
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'item-details-modal';
  
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="item-details-content">
      <div class="item-details-header">
        <div>
          <div class="strain-tier tier-${tool.tier}">${tool.tier}</div>
          <h2>${tool.emoji} ${tool.name}</h2>
        </div>
        <button class="close-details">✕</button>
      </div>
      
      <div class="item-details-body">
        <div class="tool-description">${tool.description}</div>
        
        <div class="detail-grid">
          <div class="detail-item">
            <div class="detail-label">💰 Price</div>
            <div class="detail-value">$${tool.cost}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">🔓 Unlock Level</div>
            <div class="detail-value">Level ${tool.level}</div>
          </div>
          <div class="detail-item">
            <div class="detail-label">📦 Type</div>
            <div class="detail-value">${isPermanent ? 'Permanent' : 'Consumable'}</div>
          </div>
          ${isOwned && !isPermanent ? `
          <div class="detail-item">
            <div class="detail-label">🎒 Owned</div>
            <div class="detail-value">x${state.ownedTools[tool.id]}</div>
          </div>
          ` : ''}
        </div>
      </div>
      
      <div class="item-details-footer">
        <button class="details-btn cancel">Cancel</button>
        <button class="details-btn confirm" ${!canAfford ? 'disabled' : ''}>
          🛒 Add to Basket
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Animate in
  setTimeout(() => modal.classList.add('show'), 10);
  
  // Handle close
  const closeBtn = modal.querySelector('.close-details');
  const backdrop = modal.querySelector('.modal-backdrop');
  const cancelBtn = modal.querySelector('.cancel');
  
  const handleClose = () => {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  };
  
  closeBtn.addEventListener('click', handleClose);
  backdrop.addEventListener('click', handleClose);
  cancelBtn.addEventListener('click', handleClose);
  
  // Handle confirm
  const confirmBtn = modal.querySelector('.confirm');
  if (canAfford) {
    confirmBtn.addEventListener('click', () => {
      addToBasket('tool', tool.id, 1, tool.cost);
      handleClose();
      showNotification(`🛒 Added ${tool.name} to basket`, 'success');
    });
  }
}

// Old function kept for backwards compatibility - redirects to new details view
function showBuyOptions(strain, card) {
  showStrainDetails(strain);
}

// Buy strain
function buyStrain(strain, quantity = 1) {
  const currentPrice = getCurrentPrice(strain);
  const totalCost = currentPrice * quantity;
  
  if (state.money >= totalCost) {
    state.money -= totalCost;
    
    // Add to inventory
    if (!state.inventory[strain.id]) {
      state.inventory[strain.id] = 0;
    }
    state.inventory[strain.id] += quantity;
    
    // Update market dynamics
    updatePriceAfterPurchase(strain.id, quantity);
    
    updateMoney();
    renderShop();
    showNotification(`✅ Purchased ${quantity}x ${strain.name}\n💰 Total: $${totalCost}`, 'success');
  }
}

// Add item to basket
function addToBasket(type, id, quantity, price) {
  // Check if item already in basket
  const existingIndex = state.basket.findIndex(item => item.type === type && item.id === id);
  
  if (existingIndex !== -1) {
    // Update quantity
    state.basket[existingIndex].quantity += quantity;
  } else {
    // Add new item
    state.basket.push({
      type: type, // 'seed' or 'tool'
      id: id,
      quantity: quantity,
      price: price
    });
  }
  
  updateBasketUI();
}

// Remove item from basket
function removeFromBasket(index) {
  state.basket.splice(index, 1);
  updateBasketUI();
  showNotification('🗑️ Item removed from basket', 'info');
}

// Clear entire basket
function clearBasket() {
  state.basket = [];
  updateBasketUI();
  showNotification('🗑️ Basket cleared', 'info');
}

// Calculate basket total
function getBasketTotal() {
  return state.basket.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
}

// Checkout - purchase all items in basket
function checkout() {
  if (state.basket.length === 0) {
    showNotification('🛒 Your basket is empty!', 'warning');
    return;
  }
  
  const total = getBasketTotal();
  
  if (state.money < total) {
    showNotification(`💰 Not enough money! Need $${total}, have $${state.money}`, 'error');
    return;
  }
  
  showConfirmModal(
    '💳 Checkout',
    `Purchase ${state.basket.length} item(s) for $${total}?`,
    () => {
      // Process each item
      state.basket.forEach(item => {
        if (item.type === 'seed') {
          const strain = STRAINS.find(s => s.id === item.id);
          if (!state.inventory[item.id]) {
            state.inventory[item.id] = 0;
          }
          state.inventory[item.id] += item.quantity;
          updatePriceAfterPurchase(item.id, item.quantity);
        } else if (item.type === 'tool') {
          const tool = TOOLS.find(t => t.id === item.id);
          if (tool.uses === Infinity) {
            state.ownedTools[item.id] = true;
            state.activeTools.push(item.id);
          } else {
            if (!state.ownedTools[item.id]) {
              state.ownedTools[item.id] = 0;
            }
            state.ownedTools[item.id] += item.quantity;
          }
        }
      });
      
      // Deduct money
      state.money -= total;
      
      // Clear basket
      const itemCount = state.basket.length;
      state.basket = [];
      
      updateMoney();
      updateBasketUI();
      renderShop();
      
      showNotification(`✅ Purchased ${itemCount} item(s)!\n💰 Spent: $${total}`, 'success');
    }
  );
}

// Update basket UI
function updateBasketUI() {
  const basketBtn = document.getElementById('basketBtn');
  const basketCount = state.basket.reduce((sum, item) => sum + item.quantity, 0);
  const basketTotal = getBasketTotal();
  
  if (basketBtn) {
    const countBadge = basketBtn.querySelector('.basket-count');
    if (countBadge) {
      countBadge.textContent = basketCount;
      countBadge.style.display = basketCount > 0 ? 'block' : 'none';
    }
  }
  
  // Update basket panel if open
  const basketPanel = document.getElementById('basketPanel');
  if (basketPanel && basketPanel.classList.contains('show')) {
    renderBasketPanel();
  }
}

// Render basket panel
function renderBasketPanel() {
  const basketItems = document.getElementById('basketItems');
  const basketTotal = document.getElementById('basketTotal');
  const basketSubtotal = document.getElementById('basketSubtotal');
  
  if (!basketItems) return;
  
  basketItems.innerHTML = '';
  
  if (state.basket.length === 0) {
    basketItems.innerHTML = '<div class="empty-basket">Your basket is empty<br>Add items from the shop!</div>';
    if (basketTotal) basketTotal.textContent = '0';
    if (basketSubtotal) basketSubtotal.textContent = '0';
    return;
  }
  
  state.basket.forEach((item, index) => {
    let itemName = '';
    let itemEmoji = '';
    
    if (item.type === 'seed') {
      const strain = STRAINS.find(s => s.id === item.id);
      itemName = strain.name;
      itemEmoji = '🌱';
    } else {
      const tool = TOOLS.find(t => t.id === item.id);
      itemName = tool.name;
      itemEmoji = tool.emoji;
    }
    
    const itemTotal = item.price * item.quantity;
    
    const itemDiv = document.createElement('div');
    itemDiv.className = 'basket-item';
    itemDiv.innerHTML = `
      <div class="basket-item-icon">${itemEmoji}</div>
      <div class="basket-item-info">
        <div class="basket-item-name">${itemName}</div>
        <div class="basket-item-price">$${item.price} × ${item.quantity}</div>
      </div>
      <div class="basket-item-total">$${itemTotal}</div>
      <button class="basket-item-remove" data-index="${index}">✕</button>
    `;
    
    basketItems.appendChild(itemDiv);
  });
  
  // Add remove button listeners
  basketItems.querySelectorAll('.basket-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      removeFromBasket(index);
    });
  });
  
  const total = getBasketTotal();
  if (basketTotal) basketTotal.textContent = total;
  if (basketSubtotal) basketSubtotal.textContent = total;
}

// Shop Management Module

// Render shop
function renderShop() {
  const shopLevel = document.getElementById('shopLevel');
  shopLevel.textContent = state.cultivationLevel;
  
  renderSeeds();
  renderTools();
  
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
          <button class="buy-button" ${!canAfford || outOfStock ? 'disabled' : ''}>
            ${outOfStock ? 'Sold Out' : 'Buy'}
          </button>
        </div>
      `;
      
      const buyBtn = card.querySelector('.buy-button');
      if (!outOfStock && canAfford) {
        buyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          showBuyOptions(strain, card);
        });
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
      const buttonText = isOwned && isPermanent ? 'Owned' : 'Buy';
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
        <button class="buy-button" ${buttonDisabled ? 'disabled' : ''}>
          ${buttonText}
        </button>
      `;
      
      const buyBtn = card.querySelector('.buy-button');
      if (!buttonDisabled) {
        buyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          buyTool(tool);
        });
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

// Show buy options popup
function showBuyOptions(strain, card) {
  // Remove any existing popup
  const existing = document.querySelector('.buy-options');
  if (existing) existing.remove();
  
  const currentPrice = getCurrentPrice(strain);
  const stock = Math.floor(state.strainStock[strain.id] || 0);
  const maxAffordable = Math.floor(state.money / currentPrice);
  const maxPurchase = Math.min(maxAffordable, stock);
  
  // Create popup
  const popup = document.createElement('div');
  popup.className = 'buy-options';
  
  popup.innerHTML = `
    <div class="buy-popup">
      <h3>${strain.name}</h3>
      <div class="buy-popup-subtitle">
        $${currentPrice} each • Can afford: ${maxAffordable} • In stock: ${stock}
      </div>
      
      <div class="quantity-buttons">
        <button class="qty-btn" data-qty="1" ${maxPurchase < 1 ? 'disabled' : ''}>1x</button>
        <button class="qty-btn" data-qty="5" ${maxPurchase < 5 ? 'disabled' : ''}>5x</button>
        <button class="qty-btn" data-qty="10" ${maxPurchase < 10 ? 'disabled' : ''}>10x</button>
      </div>
      
      <div class="custom-input-row">
        <input type="number" class="custom-input" placeholder="Custom amount" min="1" max="${maxPurchase}" id="customQty">
      </div>
      
      <div class="popup-actions">
        <button class="popup-btn cancel">Cancel</button>
        <button class="popup-btn confirm">Buy</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  // Handle quantity button clicks
  popup.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const qty = parseInt(btn.dataset.qty);
      document.getElementById('customQty').value = qty;
    });
  });
  
  // Handle cancel
  popup.querySelector('.cancel').addEventListener('click', () => {
    popup.remove();
  });
  
  // Handle confirm
  popup.querySelector('.confirm').addEventListener('click', () => {
    const qty = parseInt(document.getElementById('customQty').value) || 0;
    if (qty > 0 && qty <= maxPurchase) {
      buyStrain(strain, qty);
      popup.remove();
    } else if (qty > maxPurchase) {
      showNotification(`⚠️ Maximum you can buy: ${maxPurchase}!`, 'warning');
    } else {
      showNotification('⚠️ Please enter a valid quantity.', 'warning');
    }
  });
  
  // Close on backdrop click
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.remove();
    }
  });
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

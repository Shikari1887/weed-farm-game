// Skills UI management

// Render skills screen
function renderSkills() {
  const skillsList = document.getElementById('skillsList');
  const totalLevelDisplay = document.getElementById('skillsTotalLevel');
  
  if (!skillsList) return;
  
  skillsList.innerHTML = '';
  totalLevelDisplay.textContent = state.totalLevel;
  
  // Render each skill
  Object.keys(state.skills).forEach(skillName => {
    const skill = state.skills[skillName];
    const progress = (skill.xp / skill.xpToNext) * 100;
    
    const skillCard = document.createElement('div');
    skillCard.className = 'skill-card';
    
    // Get skill icon
    const skillIcon = getSkillIcon(skillName);
    const skillDisplayName = getSkillDisplayName(skillName);
    
    skillCard.innerHTML = `
      <div class="skill-header">
        <div class="skill-icon">${skillIcon}</div>
        <div class="skill-info">
          <div class="skill-name">${skillDisplayName}</div>
          <div class="skill-level">Level ${skill.level} / 100</div>
        </div>
      </div>
      <div class="skill-progress">
        <div class="xp-bar-container">
          <div class="xp-bar" style="width: ${progress}%">
            ${progress >= 20 ? Math.floor(progress) + '%' : ''}
          </div>
        </div>
        <div class="xp-text">
          <span>${skill.xp.toLocaleString()}</span> / ${skill.xpToNext.toLocaleString()} XP
        </div>
      </div>
    `;
    
    // Click to show details
    skillCard.addEventListener('click', () => {
      showSkillDetails(skillName);
    });
    
    skillsList.appendChild(skillCard);
  });
}

// Get skill icon emoji
function getSkillIcon(skillName) {
  const icons = {
    harvesting: '✂️',
    planting: '🌱',
    watering: '💧'
  };
  return icons[skillName] || '📊';
}

// Get skill display name
function getSkillDisplayName(skillName) {
  return skillName.charAt(0).toUpperCase() + skillName.slice(1);
}

// Show skill details modal with XP table
function showSkillDetails(skillName) {
  // Remove existing modal
  const existing = document.querySelector('.skill-details-modal');
  if (existing) existing.remove();
  
  const skill = state.skills[skillName];
  const skillIcon = getSkillIcon(skillName);
  const skillDisplayName = getSkillDisplayName(skillName);
  
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'skill-details-modal show';
  
  // Get XP table based on skill
  let xpTableHTML = '';
  if (skillName === 'harvesting') {
    xpTableHTML = generateHarvestingXPTable();
  }
  
  modal.innerHTML = `
    <div class="skill-details-content">
      <div class="skill-details-header">
        <div class="skill-details-title">
          <div class="skill-icon">${skillIcon}</div>
          <h3>${skillDisplayName}</h3>
        </div>
        <button class="close-skill-details">✕</button>
      </div>
      
      <div class="skill-details-body">
        <div class="skill-progress">
          <div class="skill-level" style="text-align: center; font-size: 24px; margin-bottom: 16px;">
            Level ${skill.level} / 100
          </div>
          <div class="xp-bar-container">
            <div class="xp-bar" style="width: ${(skill.xp / skill.xpToNext) * 100}%">
              ${Math.floor((skill.xp / skill.xpToNext) * 100)}%
            </div>
          </div>
          <div class="xp-text" style="margin-top: 12px;">
            <span>${skill.xp.toLocaleString()}</span> / ${skill.xpToNext.toLocaleString()} XP to next level
          </div>
        </div>
        
        ${xpTableHTML}
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Handle close
  const closeBtn = modal.querySelector('.close-skill-details');
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  });
  
  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    }
  });
}

// Generate harvesting XP table
function generateHarvestingXPTable() {
  const harvestingLevel = getHarvestingLevel();
  
  let html = `
    <div class="xp-table">
      <div class="xp-table-title">XP per Harvest (at your level)</div>
      <div class="xp-table-list">
  `;
  
  // Show XP for each strain tier
  const sampleStrains = [
    { name: 'Northern Lights', tier: 'budget', strain: STRAINS.find(s => s.name === 'Northern Lights') },
    { name: 'OG Kush', tier: 'premium', strain: STRAINS.find(s => s.name === 'OG Kush') },
    { name: 'Godfather OG', tier: 'elite', strain: STRAINS.find(s => s.name === 'Godfather OG') }
  ];
  
  sampleStrains.forEach(item => {
    if (!item.strain) return;
    
    // Calculate average yield and XP
    const tile = { watered: false }; // Average without water
    const result = calculateYield(item.strain, tile);
    const avgYield = result.yield;
    const xpGained = result.xp;
    
    // Calculate with water
    const tileWatered = { watered: true };
    const resultWatered = calculateYield(item.strain, tileWatered);
    const wateredXP = resultWatered.xp;
    
    html += `
      <div class="xp-table-item">
        <div>
          <div class="xp-table-item-name">${item.name}</div>
          <div class="xp-table-item-tier">${item.tier} • ~${avgYield.toFixed(1)}g yield</div>
        </div>
        <div class="xp-table-item-xp">
          ${xpGained} XP
          ${wateredXP > xpGained ? `<span style="font-size: 11px; color: #3b82f6;"> (${wateredXP} 💧)</span>` : ''}
        </div>
      </div>
    `;
  });
  
  html += `
      </div>
      <div class="xp-text" style="margin-top: 16px; font-size: 12px;">
        💧 = with watering (+20% yield)
      </div>
    </div>
  `;
  
  return html;
}

// Setup skills screen event listeners
function setupSkillsListeners() {
  // Navigation will be handled by main UI
}

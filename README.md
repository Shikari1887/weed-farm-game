# 🌿 Weed Farm Idle Game

A cannabis farming idle game featuring authentic strains, dynamic market pricing, and realistic cultivation mechanics.

## 📁 Project Structure

```
weed-farm-game/
├── index.html              # Main HTML structure
├── css/
│   └── styles.css          # All styling and animations
├── js/
│   ├── game.js             # Main game initialization
│   ├── state.js            # Game state management & save/load
│   ├── data/
│   │   ├── strains.js      # 39 cannabis strain definitions
│   │   └── tools.js        # Tools and upgrades database
│   ├── grid.js             # Farm grid rendering & tile interactions
│   ├── shop.js             # Shop interface & purchasing
│   ├── inventory.js        # Seed bag management
│   ├── market.js           # Dynamic pricing & stock system
│   └── ui.js               # UI updates & navigation
└── README.md
```

## 🎮 Game Features

### Current Features
- **6x6 Farm Grid** - Scrollable farm with expandable tiles
- **39 Authentic Strains** - Real cannabis varieties across budget, premium, and elite tiers
- **Dynamic Market** - Prices fluctuate based on supply/demand
- **Tools System** - Watering can with refill mechanic (more tools available in shop)
- **Growth Stages** - Visual plant progression from seedling to harvest
- **Inventory System** - Seed bag with selection interface
- **Save/Load System** - Auto-save every 30 seconds

### Strain Tiers
- **Budget Tier** (Levels 1-15): Northern Lights, White Widow, AK-47, Blue Dream, etc.
- **Premium Tier** (Levels 15-40): OG Kush, Girl Scout Cookies, Gelato, etc.
- **Elite Tier** (Levels 40-70): Godfather OG, Runtz, Gary Payton, etc.

### Tools Available
- Manual Watering Can (basic tier)
- Fertilizers (quality boost)
- Irrigation System (auto-water)
- Grow Lamps (speed boost)
- Quality Soil & Premium Nutrients (yield boost)
- Auto-Harvester & Auto-Replant (automation)
- Time Skip consumables

## 🔧 How to Update the Game

### For Claude (AI Assistant)
When updating this modular version:

1. **To modify strains**: Edit `js/data/strains.js`
2. **To modify tools**: Edit `js/data/tools.js`
3. **To change farm mechanics**: Edit `js/grid.js`
4. **To update shop**: Edit `js/shop.js`
5. **To modify UI/styling**: Edit `css/styles.css`
6. **To adjust game state**: Edit `js/state.js`
7. **To tweak market system**: Edit `js/market.js`

This modular structure allows targeted updates without parsing the entire game each time.

### For Developers
1. Clone the repository
2. Open `index.html` in a browser (no build process needed)
3. Edit the relevant module file
4. Refresh the browser to see changes

## 🚀 Deployment

### For Web
Simply upload all files to a web server maintaining the directory structure.

### For Mobile (Capacitor)
```bash
# Install Capacitor
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor
npx cap init

# Add platforms
npx cap add ios
npx cap add android

# Copy web assets
npx cap copy

# Open in native IDE
npx cap open ios
npx cap open android
```

## 📝 Game Design Philosophy

- **Authentic over artificial** - Real strain names and characteristics
- **Organic gameplay** - Natural progression without excessive gamification
- **Mobile-first** - Touch-optimized interface
- **Fast early progression** - Quick unlocks to create engagement
- **Realistic mechanics** - Growth times, market dynamics, tool functionality

## 🎯 Roadmap

### Planned Features
- XP and leveling system
- More automation tools
- Expanded farm grid (beyond 6x6)
- Map screen with multiple locations
- Strain breeding system
- Achievements and milestones
- Additional cultivation mechanics (pH, nutrients, etc.)

## 💾 Save System

Game auto-saves every 30 seconds to localStorage. Data includes:
- Money and XP
- Inventory and tools
- Farm state (plants, growth progress)
- Market prices and stock levels

## 🐛 Known Issues

None currently - please report issues via GitHub Issues.

## 📄 License

[Add your license here]

## 🤝 Contributing

[Add contribution guidelines here]

---

**Note**: This is a modular refactor of the original single-file version for better maintainability and GitHub integration.

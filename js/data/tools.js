// Tools Database
const TOOLS = [
  // MANUAL WATERING (Must refill every 4 uses)
  { 
    id: 1, 
    name: 'Watering Can', 
    description: 'Reduce growth time by 15% (4 uses per fill)',
    cost: 5, 
    effect: 'manual-water',
    value: 0.85,
    level: 1,
    tier: 'basic',
    emoji: '💧',
    uses: Infinity,
    needsRefill: true,
    usesPerFill: 4
  },
  
  // FERTILIZERS
  { 
    id: 2, 
    name: 'Basic Fertilizer', 
    description: 'Increase quality/XP by 25%',
    cost: 100, 
    effect: 'quality',
    value: 1.25,
    level: 3,
    tier: 'basic',
    emoji: '🌾',
    uses: Infinity
  },
  { 
    id: 3, 
    name: 'Premium Fertilizer', 
    description: 'Increase quality/XP by 50%',
    cost: 500, 
    effect: 'quality',
    value: 1.5,
    level: 10,
    tier: 'premium',
    emoji: '⚗️',
    uses: Infinity
  },
  
  // AUTOMATED SYSTEMS
  { 
    id: 4, 
    name: 'Irrigation System', 
    description: 'Auto-water all crops (25% speed boost)',
    cost: 1000, 
    effect: 'auto-water',
    value: 0.75,
    level: 15,
    tier: 'premium',
    emoji: '🚿',
    uses: Infinity
  },
  { 
    id: 5, 
    name: 'Grow Lamp', 
    description: 'Reduce growth time by 40%',
    cost: 1500, 
    effect: 'speed',
    value: 0.6,
    level: 20,
    tier: 'premium',
    emoji: '💡',
    uses: Infinity
  },
  
  // YIELD BOOSTERS
  { 
    id: 6, 
    name: 'Quality Soil', 
    description: 'Increase harvest value by 20%',
    cost: 800, 
    effect: 'yield',
    value: 1.2,
    level: 12,
    tier: 'premium',
    emoji: '🪴',
    uses: Infinity
  },
  { 
    id: 7, 
    name: 'Premium Nutrients', 
    description: 'Increase harvest value by 50%',
    cost: 2000, 
    effect: 'yield',
    value: 1.5,
    level: 25,
    tier: 'elite',
    emoji: '💊',
    uses: Infinity
  },
  
  // ADVANCED AUTOMATION
  { 
    id: 8, 
    name: 'Auto-Harvester', 
    description: 'Automatically harvests ready plants',
    cost: 3500, 
    effect: 'auto-harvest',
    value: true,
    level: 30,
    tier: 'elite',
    emoji: '🤖',
    uses: Infinity
  },
  { 
    id: 9, 
    name: 'Auto-Replant', 
    description: 'Automatically replants same strain',
    cost: 5000, 
    effect: 'auto-replant',
    value: true,
    level: 40,
    tier: 'elite',
    emoji: '🔄',
    uses: Infinity
  },
  
  // INSTANT BOOSTS (Consumables)
  { 
    id: 10, 
    name: 'Time Skip (1hr)', 
    description: 'Instantly advance growth by 1 hour',
    cost: 50, 
    effect: 'instant',
    value: 60 * 60 * 1000,
    level: 1,
    tier: 'consumable',
    emoji: '⭐',
    uses: 1
  },
  { 
    id: 11, 
    name: 'Time Skip (5hr)', 
    description: 'Instantly advance growth by 5 hours',
    cost: 200, 
    effect: 'instant',
    value: 5 * 60 * 60 * 1000,
    level: 15,
    tier: 'consumable',
    emoji: '⏩',
    uses: 1
  },
];

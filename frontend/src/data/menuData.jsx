// Menu data for FOLD restaurant

export const menuItems = {
  sandwiches: [
    {
      id: 1,
      name: "The Charcoal Club",
      description: "Smoked turkey, crispy prosciutto, havarti, charcoal aioli, arugula, pickled red onion on charcoal sourdough",
      price: 16,
      tag: "fan fave",
      emoji: "🥪",
    },
    {
      id: 2,
      name: "Golden Gate Melt",
      description: "Gruyère, caramelized onions, roasted garlic, dijon, fresh thyme on thick-cut brioche",
      price: 14,
      tag: "vegetarian",
      emoji: "🧀",
    },
    {
      id: 3,
      name: "The Tide Pool",
      description: "Wild-caught tuna, seaweed butter, cucumber ribbons, micro herbs, sesame crust on milk bread",
      price: 18,
      tag: "chef's pick",
      emoji: "🐟",
    },
    {
      id: 4,
      name: "Brisket Hour",
      description: "12-hour smoked brisket, horseradish cream, pickled jalapeño, crunchy slaw on a pretzel roll",
      price: 20,
      tag: "bestseller",
      emoji: "🥩",
    },
  ],
  wraps: [
    {
      id: 5,
      name: "Green Goddess",
      description: "Avocado, feta, roasted chickpeas, cucumber, spring mix, herb tahini in a spinach wrap",
      price: 14,
      tag: "vegan",
      emoji: "🥑",
    },
    {
      id: 6,
      name: "Seoul Bowl Wrap",
      description: "Gochujang chicken, pickled daikon, kimchi slaw, scallions, sesame oil in a toasted flour wrap",
      price: 16,
      tag: "spicy",
      emoji: "🌶️",
    },
    {
      id: 7,
      name: "Smoke Signal",
      description: "Pulled smoked jackfruit, chipotle black beans, corn salsa, lime crema, crispy onions",
      price: 15,
      tag: "vegan",
      emoji: "🌮",
    },
    {
      id: 8,
      name: "The Levant",
      description: "Spiced lamb kofta, tzatziki, roasted red pepper, kalamata olive tapenade, fresh mint",
      price: 17,
      tag: "chef's pick",
      emoji: "🌿",
    },
  ],
};

export const tagColors = {
  "fan fave": { bg: "#FFE8CC", text: "#C45E00" },
  vegetarian: { bg: "#D4EDDA", text: "#1A6B35" },
  vegan: { bg: "#D4EDDA", text: "#1A6B35" },
  "chef's pick": { bg: "#E8D5F5", text: "#6B21A8" },
  bestseller: { bg: "#FFEAEA", text: "#C0392B" },
  spicy: { bg: "#FFE4CC", text: "#B84000" },
};

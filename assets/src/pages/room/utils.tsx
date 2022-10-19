const animalEmoji = ["🐶", "🐼", "🐧", "🐛", "🐙", "🦄", "🐷", "🐳", "🦁", "🦀", "🦦", "🐊"];

export const getRandomAnimalEmoji = () => animalEmoji[Math.floor(Math.random() * animalEmoji.length)];

import { sortingQuestions } from './questions';

export function calculateHouse(answers: number[]): string {
  const scores = { gryffindor: 0, slytherin: 0, ravenclaw: 0, hufflepuff: 0 };

  for (let i = 0; i < sortingQuestions.length; i++) {
    const optionIndex = answers[i];
    if (optionIndex === undefined || optionIndex < 0 || optionIndex > 3) continue;
    const option = sortingQuestions[i].options[optionIndex];
    scores.gryffindor += option.weights.gryffindor;
    scores.slytherin += option.weights.slytherin;
    scores.ravenclaw += option.weights.ravenclaw;
    scores.hufflepuff += option.weights.hufflepuff;
  }

  // Add small random bonus (0-2) to each house
  scores.gryffindor += Math.random() * 2;
  scores.slytherin += Math.random() * 2;
  scores.ravenclaw += Math.random() * 2;
  scores.hufflepuff += Math.random() * 2;

  // Return the house with the highest score
  let maxHouse = 'gryffindor';
  let maxScore = scores.gryffindor;

  for (const [house, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      maxHouse = house;
    }
  }

  return maxHouse;
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function randomizeTeams(players, numOfTeams) {
  if (numOfTeams < 2) {
    throw new Error('Number of teams must be at least 2');
  }

  const teams = Array(numOfTeams)
    .fill(null)
    .map(() => []);

  const tiers = {
    tier5: [],
    tier4: [],
    tier3: [],
    tier2: [],
    tier1: [],
  };

  for (let i = 0; i < players.length; i++) {
    const currPlayer = players[i];
    const skillLevel = currPlayer?.user?.skill;

    if (skillLevel >= 8) {
      tiers.tier5.push(currPlayer);
    } else if (skillLevel >= 6 && skillLevel < 8) {
      tiers.tier4.push(currPlayer);
    } else if (skillLevel >= 4 && skillLevel < 6) {
      tiers.tier3.push(currPlayer);
    } else if (skillLevel >= 2 && skillLevel < 4) {
      tiers.tier2.push(currPlayer);
    } else {
      tiers.tier1.push(currPlayer);
    }
  }
  const allTiers = [
    shuffleArray(tiers.tier5),
    shuffleArray(tiers.tier4),
    shuffleArray(tiers.tier3),
    shuffleArray(tiers.tier2),
    shuffleArray(tiers.tier1),
  ];

  let playerIndex = 0;
  for (let tier of allTiers) {
    for (let player of tier) {
      const round = Math.floor(playerIndex / numOfTeams);
      const positionInRound = playerIndex % numOfTeams;
      let teamIndex;
      if (round % 2 === 0) {
        teamIndex = positionInRound;
      } else {
        teamIndex = numOfTeams - 1 - positionInRound;
      }

      teams[teamIndex].push(player);
      playerIndex++;
    }
  }

  return teams;
}

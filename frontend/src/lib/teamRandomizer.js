export function shuffleArray(array) {
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
    tier0: [],
  };

  for (let i = 0; i < players.length; i++) {
    const currPlayer = players[i];
    const skillLevel = currPlayer?.user?.skill;

    if (skillLevel >= 8) {
      tiers.tier5.push(currPlayer);
    } else if (skillLevel == 7) {
      tiers.tier4.push(currPlayer);
    } else if (skillLevel == 6) {
      tiers.tier3.push(currPlayer);
    } else if (skillLevel == 5) {
      tiers.tier2.push(currPlayer);
    } else if (skillLevel == 4) {
      tiers.tier1.push(currPlayer);
    } else {
      tiers.tier0.push(currPlayer);
    }
  }
  const allTiers = [
    shuffleArray(tiers.tier5),
    shuffleArray(tiers.tier4),
    shuffleArray(tiers.tier3),
    shuffleArray(tiers.tier2),
    shuffleArray(tiers.tier1),
    shuffleArray(tiers.tier0),
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

export function randomizeOgTeams(players, numOfTeams) {
  if (numOfTeams < 2) {
    throw new Error('Number of teams must be at least 2');
  }

  const ogPlayers = players.filter((p) => p.user?.ogGroup === true);
  const nonOgPlayers = players.filter((p) => p.user?.ogGroup !== true);

  const idealTeamSize = Math.ceil(players.length / numOfTeams);
  ogPlayers.sort((a, b) => b.user?.skill - a.user?.skill);

  const ogForTwoTeams = ogPlayers.slice(0, idealTeamSize * 2);
  const ogOverflow = ogPlayers.slice(idealTeamSize * 2);

  const ogTeams = randomizeTeams(ogForTwoTeams, 2);

  const remainingPool = [...nonOgPlayers, ...ogOverflow];

  if (numOfTeams > 2) {
    const otherTeams = randomizeTeams(remainingPool, numOfTeams - 2);
    return [...ogTeams, ...otherTeams];
  }

  const shuffledRemaining = shuffleArray(remainingPool);
  for (const player of shuffledRemaining) {
    const smallerTeam = ogTeams[0].length <= ogTeams[1].length ? 0 : 1;
    ogTeams[smallerTeam].push(player);
  }

  return ogTeams;
}

export function fillTeamsRoundRobin(lockedTeams, newPlayers, numOfTeams) {
  if (numOfTeams < 2) {
    throw new Error('Number of teams must be at least 2');
  }

  const teams = lockedTeams.map((team) => [...team]);

  const existingPlayerIds = new Set();
  lockedTeams.forEach((team) => {
    team.forEach((player) => {
      const playerId = player.user?.id || player.userId || player.id;
      if (playerId) {
        existingPlayerIds.add(playerId);
      }
    });
  });

  const playersToAdd = newPlayers.filter((player) => {
    const playerId = player.user?.id || player.userId || player.id;
    return playerId && !existingPlayerIds.has(playerId);
  });

  playersToAdd.forEach((player) => {
    let smallestIndex = 0;
    for (let i = 1; i < teams.length; i++) {
      if (teams[i].length < teams[smallestIndex].length) {
        smallestIndex = i;
      }
    }
    teams[smallestIndex].push(player);
  });
  return teams;
}



const playerToGame = new Map();

function findGameIfExist(player) {
	const game = playerToGame.get(player);
	return game;
}

function addToGame(player, game) {
	playerToGame.set(player, game);
}

function removeFromGameIfExist(player) {
	const game = playerToGame.get(player);
	if (game) {
		playerToGame.delete(player);
	}
}

function shuffle(array) {
	let currentIndex = array.length, temporaryValue, randomIndex;

	// While there remain elements to shuffle...
	while (0 !== currentIndex) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		// And swap it with the current element.
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}

	return array;
}

function textFromOptions(options, selector = value => value) {
	let text = '';
	options.forEach((option, index) => {
		text += `\n${index}. ${selector(option)}`;
	});
	return text;
}

function most(selects) {
	if (selects.length === 1) return selects[0];

	const m = new Map();
	selects.forEach(s => {
		const curr = m.get(s);
		if (curr) {
			m.set(s, curr + 1);
		} else {
			m.set(s, 1);
		}
	})

	let max = 0;
	let maxKey = null;
	let n = 0;

	m.forEach((val, key) => {
		if (max < val) {
			max = val;
			maxKey = key;
			n = 0;
		} else if (max === val) {
			n += 1;
		}
	})

	return n === 0 ? maxKey : null;
}

module.exports = {
	findGameIfExist,
	addToGame,
	removeFromGameIfExist,
	shuffle,
	textFromOptions,
	most
}
const Helper = require('./helper');
const Roles = require('./roles');
const Constants = require('./constants');
const Player = require('./player');

function Game(ms, ownerName) {
	this.messsage = ms;
	this.channel = ms.channel;
	this.owner = ms.author;
	Helper.addToGame(ms.author, this);
	this.players = [new Player(ms.author, ownerName)];
	this.tempPlayers = null;
	this.roles = [];
	this.day = 0;
	this.story = "";
	this.guardianTarget = null;
	this.wolvesTarget = null;
	this.witchTarget = null;
	this.lastNightDies = [];
	this.phase = Constants.gameStages.waiting;
}

Game.prototype.notifyAll = function(text) {
	// end mesage in channel
	this.channel.send(text);
}

Game.prototype.getAlivePlayerList = function() {
	let list = [];
	this.players.forEach((p, i) => {
		if (p.state.alive) {
			list.push(p);
		}
	});
	return list;
}

Game.prototype.newGame = function() {

	this.players.forEach(p => {
		if (Helper.findGameIfExist(p) !== this || this.playerFromDC(p.discord) !== p) {
			console.log('Fuckkkkkkkkkkkkkkkkkkkkkkkkkkkkk!');
		} else {
			console.log(`${p.name} - OK!`);
		}
	});

	this.day = 0;
	this.story = "";
	this.stories = [];
	this.guardianTarget = null;
	this.wolvesTarget = null;
	this.witchTarget = null;
	this.lastNightDies = [];
	this.phase = Constants.gameStages.waiting;

	// Shuffle
	const tempPlayers = [...this.players];
	Helper.shuffle(tempPlayers);

	tempPlayers.forEach((player, index) => {
		const role = this.roles[index];
		player.role = role;
		player.roleState = role.getDefaultState();
		player.sendDM(`Bạn là ${role.name}\n${role.inf}`);
	})

	//
	let notiText = `Trò chơi bắt đầu\nDanh sách người chơi:`;
	let rolesText = '\nDanh sách nhân vật:';
	this.roles.forEach((role, index) => {
		notiText += `\n${this.players[index].name}`;
		rolesText += `\n${role.name}`;
	})
	this.notifyAll(notiText + rolesText);

	this.loop()
		.then(() => {
			this.onEnd();
		});
}

Game.prototype.loop = function() {
	this.day += 1;
	return new Promise(async resolve => {
		await this.night();
		this.morning();
		this.story += `\n*Trời sáng*`;
		console.log(`\n*Trời sáng*`);
		if (this.checkEnd()) {
			resolve();
			return;
		}
		await this.dayF();
		if (this.checkEnd()) {
			resolve();
			return;
		}
		resolve(this.loop());
	})
}

Game.prototype.checkEnd = function() {

	if (this.getAlivePlayerList().length === 0) {
		this.story += '\nTất cả mọi người đều chết';
		return true;
	}

	let numberOfWolves = 0;
	let numberOftargets = 0;
	this.players.forEach(player => {
		if (!player.state.alive) return;
		if (player.role === Roles.werewolf) {
			numberOfWolves += 1;
		} else {
			numberOftargets += 1;
		}
	});

	if (numberOfWolves === 0) {
		this.isHumanWin = true;
		this.story += '\nDân làng thắng';
		return true
	};
	if (numberOftargets <= numberOfWolves) {
		this.isHumanWin = false;
		this.story += '\nSói thắng';
		return true
	}
	return false;
}

Game.prototype.night = function() {
	return new Promise(async resolve => {
		this.story += `\n\nĐêm thứ ${this.day}`;
		console.log(`\n\nĐêm thứ ${this.day}`);

		// Reset
		this.guardianTarget = null;
		this.wolvesTarget = null;
		this.witchTarget = null;
		this.lastNightDies = [];

		// All Sleep
		this.notifyAll('Đêm xuống, tất cả mọi người đi ngủ nào :v');
		this.phase = Constants.gameStages.nightBeforeWolves;

		// Turn traitor to werewolf

		// 
		this.phase = Constants.gameStages.nightWolves;
		const wereWolves = this.getAlivePlayerList().filter(p => p.role === Roles.werewolf);
		wereWolves.forEach(werewolf => {
			werewolf.sendDM(`Bắt đầu họp sói, chat với tui để liên lạc với các sói khác`);
		});

		await Promise.all([
			this.seerProcess(),
			this.guardianProcess(),
			this.hunterProcess(),
			this.wolvesProcess(),
		]);
		console.log(`this.seerProcess(),this.guardianProcess(),this.hunterProcess()`);

		// Call bla bla bla
		await this.witchProcess();
		console.log(`await this.witchProcess();`)

		resolve();
	});
}

Game.prototype.seerProcess = function() {
	return new Promise(r => {
		const seerPlayer = this.players.find(player => (player.role === Roles.seer && player.state.alive));
		if (seerPlayer) {
			const alivePlayers = this.getAlivePlayerList().filter(p => p !== seerPlayer);
			const listText = Helper.textFromOptions(alivePlayers, p => p.name);
			seerPlayer.sendDM(`Chọn 1 người chơi để soi:${listText}`);
			seerPlayer.select(alivePlayers)
				.then(selectedIndex => {
					seerPlayer.sendDM(`${alivePlayers[selectedIndex].name} là ${alivePlayers[selectedIndex].role.name}`);
					this.story += `\n${seerPlayer.getNameAndRole()} đã soi thấy ${alivePlayers[selectedIndex].getNameAndRole()}`;
					console.log(`\n${seerPlayer.getNameAndRole()} đã soi thấy ${alivePlayers[selectedIndex].getNameAndRole()}`);
					r();
				});
		} else {
			r();
		}
	})
}

Game.prototype.guardianProcess = function() {
	return new Promise(r => {
		const guardianPlayer = this.players.find(player => (player.role === Roles.guardian && player.state.alive));
		if (guardianPlayer) {
			const validTargets = this.getAlivePlayerList().filter(p => p !== guardianPlayer.roleState.lastTarget);
			validTargets.push({ name: 'Không bảo vệ ai cả' });
			const listText = Helper.textFromOptions(validTargets, p => p.name);
			guardianPlayer.sendDM(`Chọn 1 người chơi để bảo vệ:${listText}`);
			guardianPlayer.select(validTargets)
				.then(selectedIndex => {

					// Guardian didnt protecc anyone
					if (selectedIndex === validTargets.length - 1) {
						this.story += `\n${guardianPlayer.getNameAndRole()} không bảo vệ ai cả.`;
						console.log(`\n${guardianPlayer.getNameAndRole()} không bảo vệ ai cả.`);
						r();
						return;
					}

					guardianPlayer.roleState.lastTarget = validTargets[selectedIndex];
					this.guardianTarget = validTargets[selectedIndex];
					this.story += `\n${guardianPlayer.getNameAndRole()} chọn bảo vệ ${validTargets[selectedIndex].getNameAndRole()}.`;
					console.log(`\n${guardianPlayer.getNameAndRole()} chọn bảo vệ ${validTargets[selectedIndex].getNameAndRole()}.`);
					r();
				});
		} else {
			r();
		}
	});
}

Game.prototype.hunterProcess = function() {
	return new Promise(r => {
		const hunterPlayer = this.players.find(player => (player.role === Roles.hunter && player.state.alive));
		if (hunterPlayer) {
			const alivePlayers = this.getAlivePlayerList().filter(p => p !== hunterPlayer);
			alivePlayers.push({ name: 'Không nhắm ai' });

			const listText = Helper.textFromOptions(alivePlayers, p => p.name);
			hunterPlayer.sendDM(`Nhắm bắn 1 người:${listText}`);
			hunterPlayer.select(alivePlayers)
				.then(selectedIndex => {

					// hunter didnt aim anyone
					if (selectedIndex === alivePlayers.length - 1) {
						this.story += `\n${hunterPlayer.getNameAndRole()} không nhắm bắn ai cả.`;
						console.log(`\n${hunterPlayer.getNameAndRole()} không nhắm bắn ai cả.`);
						r();
						return;
					}

					this.story += `\n${hunterPlayer.getNameAndRole()} nhắm bắn ${alivePlayers[selectedIndex].getNameAndRole()}.`;
					console.log(`\n${hunterPlayer.getNameAndRole()} nhắm bắn ${alivePlayers[selectedIndex].getNameAndRole()}.`);
					hunterPlayer.roleState.target = alivePlayers[selectedIndex];
					r();
				});
		} else {
			r();
		}
	});
}

Game.prototype.wolvesProcess = function() {
	return new Promise(async r => {
		const wereWolves = this.getAlivePlayerList().filter(p => p.role === Roles.werewolf);
		const targets = this.getAlivePlayerList();
		targets.push({ name: 'Không cắn ai' });

		await new Promise(endTimer => {
			setTimeout(endTimer, 30000);
		});

		Promise.all(
			wereWolves.map(wereWolf => {
				const targetsListText = Helper.textFromOptions(targets, p => p.name);
				wereWolf.sendDM(`Hết thời gian họp sói, lựa chọn 1 người chơi để cắn:${targetsListText}`);
				return wereWolf.select(targets, 30, targets.length - 1);
			})
		).then(selectedIndexes => {

			// Filter out null select
			const mostSelectedIndex = Helper.most(selectedIndexes.filter(select => select !== targets.length - 1));

			if (mostSelectedIndex === null) {
				this.wolvesTarget = null;
				this.story += `\nSói không cắn ai cả`;
				console.log(`Sói không cắn ai cả`);
			} else {
				this.wolvesTarget = targets[mostSelectedIndex];
				this.story += `\nSói chọn cắn ${targets[mostSelectedIndex].getNameAndRole()}`;
				console.log(`\nSói chọn cắn ${targets[mostSelectedIndex].getNameAndRole()}`);
			}

			this.phase = Constants.gameStages.nightAfterWolves;
			r();
		})
	})
}

Game.prototype.witchProcess = function() {
	return new Promise(async r => {
		const witchPlayer = this.players.find(player => (player.role === Roles.witch && player.state.alive));
		if (witchPlayer) {
			if (this.wolvesTarget || this.wolvesTarget !== this.guardianTarget) {

				// If witch still have save ab
				if (!witchPlayer.roleState.didSave) {
					await new Promise(async resolveSave => {
						witchPlayer.sendDM(`Đêm qua ${this.wolvesTarget.name} bị căn, bạn có muốn cứu không?\n0. Có\n1. Không`);
						const selectedIndex = await witchPlayer.select(['Có', 'Không']);
	
						// Witch decide to save
						if (selectedIndex === 0) {
							witchPlayer.roleState.didSave = true;
							this.story += `\n${witchPlayer.getNameAndRole()} cứu ${this.wolvesTarget.getNameAndRole()}`;
							console.log(`\n${witchPlayer.getNameAndRole()} cứu ${this.wolvesTarget.getNameAndRole()}`);
							this.wolvesTarget = null;
						} else {
							this.story += `\n${witchPlayer.getNameAndRole()} **không** cứu ${this.wolvesTarget.getNameAndRole()}`;
							console.log(`\n${witchPlayer.getNameAndRole()} **không** cứu ${this.wolvesTarget.getNameAndRole()}`);
						}
						resolveSave();
					});
				}

				// If witch still have kill ab
				if (!witchPlayer.roleState.didKill) {
					const targets = this.getAlivePlayerList();
					targets.push({ name: 'Không giết ai' });
					const targetsText = Helper.textFromOptions(targets, t => t.name);
					witchPlayer.sendDM(`Bạn có muốn giết ai không?${targetsText}`);
					const selected = await witchPlayer.select(targets, 30, targets.length - 1)

					// If witch decide to kill
					if (selected !== targets.length - 1) {
						this.witchTarget = targets[selected];
						witchPlayer.roleState.didKill = true;
						this.story += `\n${witchPlayer.getNameAndRole()} chọn giết ${targets[selected].getNameAndRole()}`;
						console.log(`\n${witchPlayer.getNameAndRole()} chọn giết ${targets[selected].getNameAndRole()}`);
					}
				}
			}
		}
		r();
	})
}

Game.prototype.dayF = function() {
	return new Promise(r => {
		this.notifyAll(`Dân làng có ~~3 phút~~ *30 giây* để thảo luận`);
		setTimeout(async () => {
			const targets = this.getAlivePlayerList();
			const selects = [...targets];
			selects.push({ name: 'Không treo cổ ai cả' });

			const targetsText = Helper.textFromOptions(selects, t => t.name);
			this.notifyAll(`Hết giờ thảo luận, tất cả dân làng lựa chọn 1 người để treo cổ:${targetsText}`);
			const selectedIndexes = await Promise.all(targets.map(target => {
				target.select(selects, 60, selects.length - 1).then(selected => {
					if (selected !== targets.length - 1) {
						this.notifyAll(`${target.name} vote treo cổ ${targets[selected].name}`);
						this.story += `${target.name} vote treo cổ ${targets[selected].name}`;
						console.log(`${target.name} vote treo cổ ${targets[selected].name}`);
					} else {
						this.notifyAll(`${target.name} vote không treo cổ ai cả`);
						this.story += `${target.name} vote không treo cổ ai cả`;
						console.log(`${target.name} vote không treo cổ ai cả`);
					}
					return selected;
				});
			}));
			const mostSelected = Helper.most(selectedIndexes);

			if (mostSelected === null || mostSelected === selects.length - 1) {
				this.notifyAll(`Không ai bị treo cổ cả, kết thúc ngày`);
				this.story += `\nKhông ai bị treo cổ`;
				console.log(`\nKhông ai bị treo cổ`);
				r();
				return;
			}

			this.story += `\n${selects[mostSelected].getNameAndRole()} bị chọn làm mục tiêu treo cỗ`;
			console.log(`\n${selects[mostSelected].getNameAndRole()} bị chọn làm mục tiêu treo cỗ`);
			
			// vote to kill target
			const target = selects[mostSelected];

			// vote with 0 = no, 1 = yes
			this.notifyAll(`${target.name} bị chọn làm mục tiêu bị treo cỗ\n0. Không treo cổ\n1. gietchetmeno`);
			const votes = await Promise.all(targets.filter(t => t !== target).map(voter => voter.select([0, 1], 30, 0)));
			const mostVote = Helper.most(votes);
			

			// If yes
			if (mostVote === 1) {
				this.killProcess(target, false);
				this.story += `${target.getNameAndRole()} đã bị treo cổ`;
				console.log(`${target.getNameAndRole()} đã bị treo cổ`);
				this.notifyAll(`${target.name} đã bị treo cổ`);
				r();
				return;
			}

			// No
			this.notifyAll(`${target.name} không bị treo cổ`);
			this.story += `${target.getNameAndRole()} không bị treo cổ`;
			console.log(`${target.getNameAndRole()} không bị treo cổ`);
			r();
		}, 30000);
	})
}

Game.prototype.morning = function() {
	// Wolves target
	if (this.wolvesTarget) {
		if (this.wolvesTarget.role !== Roles.traitor) {
			this.lastNightDies.push(this.wolvesTarget);
			this.wolvesTarget.state.alive = false;
		} else {
			this.wolvesTarget.role = Roles.werewolf;
		}
	}

	// Witch target
	if (this.witchTarget) {
		this.lastNightDies.push(this.witchTarget);
		this.witchTarget.state.alive = false;
	}

	// If one or more ppl die 
	if (this.lastNightDies.length > 0) {

		// // If hunter die
		// const hunterInDies = this.lastNightDies.find(d => d.role === Roles.hunter);

		// // if hunter aiming
		// if (hunterInDies.roleState.target) {
		// 	hunterInDies.roleState.target.alive = false;
		// 	this.lastNightDies.push(hunterInDies.roleState.target);
		// }

		let numberOfDies = 0;

		this.lastNightDies.forEach(target => {
			numberOfDies += this.killProcess(target, true);
		});

		// Noti
		let text = `Đêm qua có ${numberOfDies} người chết:`;
		this.lastNightDies.forEach(d => {
			text += `\n${d.name}`;
		});
		this.notifyAll(text);
	} else {
		this.notifyAll(`Đêm qua không có ai chết`);
	}
}

Game.prototype.killProcess = function(victim, canProtect = false) {
	if (!victim.state.alive) return 0;
	if (canProtect && this.guardianTarget === victim) {
		return 0;
	}

	victim.state.alive = false;
	this.story += `\n${victim.getNameAndRole()} đã chết!!`;
	console.log(`\n${victim.getNameAndRole()} đã chết!!`);

	// If hunter is target
	if (victim.role === Roles.hunter) {

		// hunter is aiming
		if (victim.roleState.target) {
			return 1 + this.killProcess(victim.roleState.target);
		}
	}
	return 1;
}

Game.prototype.onEnd = function() {
	// this.notifyAll(`Trò chơi kết thúc!!\nStory:\n${this.story}`);
	this.channel.send(`Trò chơi kết thúc!!\n${this.story}`);
	console.log('game end cmnr roi');
	this.phase = Constants.gameStages.waiting;
}

Game.prototype.add = function(dcUser, name) {
	const player = new Player(dcUser, name);
	
	if (this.players.includes(this.playerFromDC(dcUser))) return;

	this.players.push(player);
	Helper.addToGame(dcUser, this);
	console.log(`Add ${player.name}`);
}

Game.prototype.addRole = function(role) {
	if (this.roles.includes(role) && role !== Roles.werewolf && role !== Roles.villager) return;
	this.roles.push(role);
}

Game.prototype.terminate = function() {
	this.players.forEach(Helper.removeFromGameIfExist);
}

Game.prototype.playerFromDC = function(dcUser) {
	return this.players.find(player => player.discord === dcUser);
}

Game.prototype.notifyWolves = function(ms, player) {
	this.getAlivePlayerList()
	.filter(p => p.role === Roles.werewolf && p !== player)
	.forEach(p => p.sendDM(`${player.getNameAndRole()}: ${ms.content}`));
}

module.exports = Game;
const Discord = require('discord.js');
const client = new Discord.Client();
const Helper = require('./helper');
const Constants = require('./constants');
const Game = require('./game');
const Roles = require('./roles');

client.on('message', ms => {
  const dc = ms.author;
  const game = Helper.findGameIfExist(dc);
  if (game) {

    const player = game.playerFromDC(dc);

    if (player.resolveSelectIfExist(ms.content)) {
      return;
    }

    if (dc === game.owner) {
      ownerCommands(ms, dc, game);
    }

    if (game.phase === Constants.gameStages.nightWolves && ms.channel.type === 'dm') {
      if (player.role === Roles.werewolf) {
        game.notifyWolves(ms, player);
      }
    }
  } else {
    if (ms.content === '*new') {
      new Game(ms);
      ms.reply('Doge xin hân hạnh tài trợ chương trình này');
    }
  }
});

client.login('NjkxODU3MDE5MzE3MjU2MjEy.XnmyjA.8eBOHC0TvT45M9s1twERT6-NPfc');

function ownerCommands(message, discordUser, game) {
  if (message.content.startsWith('*add ')) {

    const mention = message.content.split(' ')[1];
    const username = message.content.split(' ')[2];
    const mentionedUser = getUserFromMention(mention);
    console.log(mentionedUser);
    game.add(mentionedUser, username);
  } else if (message.content.startsWith('*addrole ')) {
    const roleName = message.content.split(' ')[1];
    if (Roles[roleName]) {
      game.addRole(Roles[roleName]);
    }
    else message.reply('Role này đéo tồn tại ')
  } else if (message.content.startsWith('*start')) {
    if (game.players.length !== game.roles.length) {
      message.reply('số người chơi hoặc số role đéo bằng nhau :blobglare~1: ' + 'số người chơi:' + game.players.length + ' số role:' + game.roles.length);
    } else {
      game.newGame();
    }
  } else if (message.content.startsWith('*end')) {
    game.terminate();
  }
}

function getUserFromMention(mention) {
	if (!mention) return;

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return client.users.get(mention);
	}
}
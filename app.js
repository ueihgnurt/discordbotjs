// const Discord = require('discord.js');
// const client = new Discord.Client();
// const Helper = require('./helper');
// const Constants = require('./constants');
// const Game = require('./game');
// const Roles = require('./roles');

// client.on('message', ms => {
//   const dc = ms.author;
//   const game = Helper.findGameIfExist(dc);
//   if (game) {
//     const player = game.playerFromDC(dc);

//     if (player.resolveSelectIfExist(ms.content)) {
//       return;
//     }

//     if (dc === game.owner) {
//       ownerCommands(ms, dc, game);
//     }

//     if (game.phase === Constants.gameStages.nightWolves && ms.channel.type === 'dm') {
//       if (player.role === Roles.werewolf) {
//         game.notifyWolves(ms, player);
//       }
//     }
//   } else {
//     if (ms.content === 'wwnew') {
//       new Game(ms);
//       ms.channel.send('<:doge:692301434187939840> Doge 0.0.2 hân hạnh tài trợ chương trình này');
//     } 
//   }
// });
// client.login('NjkxODU3MDE5MzE3MjU2MjEy.XnsVrg.22_khA-pH-pY0IYklH2Rc29vgCM');
// function ownerCommands(message, discordUser, game) {
//   if (message.content=== 'wwsign') {
//     message.channel.send('Đăng ký bằng cách react <:dogehaha:639540853978693632> vào đây').then((message) =>{ 
//       const filter = (reaction, user) => {
//         return ['dogehaha'].includes(reaction.emoji.name) && user.id === message.author.id;
//       };
//       reactors = []
//       message.awaitReactions(filter,{ max: 1, time: 60000, errors: ['time'] })
//       .then(collected => {
//           reactors.push(collected.first());
//         }).catch((reactors) => {
//           message.channel.send('hết thời gian đăng ký')
//           message.channel.send('danh sách người chơi:')
//           message.reactions.map((reaction) => {
//             reaction.users.map((user )=> {
//               message.channel.send('<@'+user.id+'>' )
//               game.add(user,user.username)
//           }) 
//           })
//         })
//       // const emoji = ':white_check_mark:'
      
      
//     })
//     // const mention = message.content.split(' ')[1];
//     // const username = message.content.split(' ')[2];
//     // const mentionedUser = getUserFromMention(mention);
//     // console.log(mentionedUser);
//     // message.channel.send('đã add <@'+mentionedUser.id+'> vào list')
//     // game.add(mentionedUser, username);
//   } else if (message.content.startsWith('wwrole ')) {
//     const roleName = message.content.split(' ')[1];
//     if (Roles[roleName]) {
//       game.addRole(Roles[roleName]);
//     }
//   } else if (message.content.startsWith('wwstart')) {
//     if (game.players.length !== game.roles.length) {
//       message.reply('Óc chó phát thẻ không bằng số người chơi số người chơi hiện tại là ' + game.players.length + ' số thẻ là ' + game.roles.length);
//     } else {
//       game.newGame();
//     }
//   } else if (message.content.startsWith('wwend')) {
//     game.terminate();
//   }
// }

// function getUserFromMention(mention) {
// 	if (!mention) return;
// 	if (mention.startsWith('<@') && mention.endsWith('>')) {
// 		mention = mention.slice(2, -1);
// 		if (mention.startsWith('!')) {
// 			mention = mention.slice(1);
// 		}
// 		return client.users.get(mention);
// 	}
// }
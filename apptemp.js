const Discord = require('discord.js');
const client = new Discord.Client();
const Helper = require('./helper');
var fs = require('fs');
const Constants = require('./constants');
const Game = require('./game');
const Roles = require('./roles');
const Doge = new Discord.Client();
Doge.login('NjkxODU3MDE5MzE3MjU2MjEy.XoX8oQ.cATdAxgCmFIUdRgn0HuhuqDxF_8');
client.login('NjkxODU3MDE5MzE3MjU2MjEy.XoX8oQ.cATdAxgCmFIUdRgn0HuhuqDxF_8');
Doge.on('message',ms => {
    // let rawdata = fs.readFileSync('MemeMaterials.json')
    // let meme = JSON.parse(rawdata);
    // console.log(meme)
    if(ms.content.toLowerCase().startsWith("vàng") && (ms.content.endsWith("khẩu súng") || ms.content.endsWith("AK")))
    {
        ms.channel.send("Hàng hụi đây,bắng chết nó đi bạn <:AK47:692359318292660255>");
    }
    else if(ms.content.toLowerCase() === 'rish là gì?'){
        ms.channel.send({file: "https://cdn.discordapp.com/attachments/368071236325998592/623146226262474775/image0.jpg"});
    }
    else if(ms.content.toLowerCase() === 'rét từng nói'){
        ms.channel.send({file: "https://media.discordapp.net/attachments/523690044419080207/694797663484248104/image0.png"});
    }
    else if(ms.content.toLowerCase().includes('làm gì giờ')){
        ms.channel.send({file: "https://media.discordapp.net/attachments/523690044419080207/694796999324729364/Screenshot_20200324-1729472.png"});
    }
})
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
      if (ms.content === 'wwnew') {
        new Game(ms);
        ms.channel.send('<:doge:692301434187939840> Doge 0.0.2 hân hạnh tài trợ chương trình này');
      } 
    }
  });
function ownerCommands(message, discordUser, game) {
    if (message.content=== 'wwsign') {
      message.channel.send('Đăng ký bằng cách react <:dogehaha:639540853978693632> vào đây').then((message) =>{ 
        const filter = (reaction, user) => {
          return ['dogehaha'].includes(reaction.emoji.name) && user.id === message.author.id;
        };
        message.awaitReactions(filter,{ max: 1, time: 6000, errors: ['time'] })
        .then(collected => {
            reactors.push(collected.first());
          }).catch(() => {
            message.channel.send('hết thời gian đăng ký')
            message.channel.send('danh sách người chơi:')
            message.reactions.map((reaction) => {
              if(reaction._emoji.name == 'dogehaha')
                reaction.users.map((user)=> {
                    message.channel.send('<@'+user.id+'>' )
                    game.add(user,user.username)
                })
            })
            if(game.players.length === 0){message.channel.send('nobody <:dogesad:694790683193770056>')
            game.terminate()}
          })
      })
    } else if (message.content.startsWith('wwrole ')) {
      const roleName = message.content.split(' ')[1];
      if (Roles[roleName]) {
        game.addRole(Roles[roleName]);
      }
    } else if (message.content.startsWith('wwstart')) {
      if (game.players.length !== game.roles.length) {
        message.reply('Óc chó phát thẻ không bằng số người chơi số người chơi hiện tại là ' + game.players.length + ' số thẻ là ' + game.roles.length);
      } else {
        game.newGame();
      }
    } else if (message.content.startsWith('wwend')) {
      game.terminate();
    }
  }
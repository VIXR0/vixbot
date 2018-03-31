//bot.js

const Discord = require("discord.js");
const prefix = ".";
const completemsg = "Thank you for verifying. Your role in Vixro's Lounge has been updated to Member. Feel free to look around and check out the rules!"
const shortcode = (n) => {
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
	let text = ''
	for (var i = 0; i < n + 1; i++) text += possible.charAt(Math.floor(Math.random() * possible.length))
	return text;
}
const token = shortcode(8)

const bot = new Discord.Client({disableEveryone: true});
bot.commands = new Discord.Collection();

var dice = [
	"**You rolled**\n🎲",
	"**You rolled**\n🎲 🎲",
	"**You rolled**\n🎲 🎲 🎲",
	"**You rolled**\n🎲 🎲 🎲 🎲",
	"**You rolled**\n🎲 🎲 🎲 🎲 🎲",
	"**You rolled**\n🎲 🎲 🎲 🎲 🎲 🎲"
]

bot.on("ready", async () => {
	console.log(`Bot is online! Username: ${bot.user.username}`);
	bot.user.setActivity('', { type: 'LISTENING' });
});

bot.on("message", async message => {
	if(message.author.bot) return;
	if(message.channel.type === "dm") return;

	let messageArray = message.content.split(" ");
	let command = messageArray [0];
	args = messageArray.slice(1);

	if(!command.startsWith(prefix)) return;

	let cmd = bot.commands.get(command.slice(prefix.length));
	if(cmd) cmd.run(bot, message, args);

	if(command === `${prefix}userinfo`) {
		let embed = new Discord.RichEmbed()
			.setFooter(`Info requested by ${message.author.username}`)
			.setTitle("This is the specified user's info")
			.setThumbnail(message.author.avatarURL)
			.setColor("#9f13f6")
			.addField("Username", `${message.author.username}#${message.author.discriminator}`)
			.addField("ID", message.author.id)
			.addField("Account Created", message.author.createdAt);

		message.channel.send(embed);
	}

	if(command === `${prefix}mute`) {
		if(!message.member.hasPermission("KICK_MEMBERS")) return message.channel.send ("You do not have the right permissions!");

		let toMute = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
		if(!toMute) return message.channel.send("You must specify a user!");

		if(toMute.id === message.author.id) return message.channel.send("You cannot mute yourself!");
		if(toMute.highestRole.position >= message.member.highestRole.position) return message.channel.send("You cannot mute a member who has the same role/higher role than you!");

		let role = message.guild.roles.find(r => r.name === "VixBot Muted");
		if(!role) {
			try{
				role = await message.guild.createRole({
					name: "VixBot Muted",
					color: "#000000",
					permissions: []
				});

				message.guild.channels.forEach(async (channel, id) => {
					await channel.overwritePermissions(role, {
						SEND_MESSAGES: false,
						ADD_REACTIONS: false
					});
				});
			} catch(e) {
				console.log(e.stack);
			}
		}

		if(toMute.roles.has(role.id)) return message.channel.send("This user is already muted!");

		await toMute.addRole(role);
		message.channel.send(`${toMute.user.username} has been muted!`);
	}

	if(command === `${prefix}unmute`) {
		if(!message.member.hasPermission("KICK_MEMBERS")) return message.channel.send ("You do not have the right permissions!");

		let toMute = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
		if(!toMute) return message.channel.send("You must specify a user!");

		let role = message.guild.roles.find(r => r.name === "VixBot Muted");

		if(!role || !toMute.roles.has(role.id)) return message.channel.send("This user is not muted!");

		await toMute.removeRole(role);
		message.channel.send(`${toMute.user.username} has been unmuted!`);
	}

	if(command === `${prefix}ping`) {

		message.channel.send(`${bot.ping}ms :stopwatch:`);
	}

	if(command === `${prefix}status`) {

		message.channel.send(`Bot has been online since ${bot.readyAt}`)
	}

	if(command === `${prefix}serverinfo`) {

		message.delete()
		let embed = new Discord.RichEmbed()
			.setFooter(`Info requested by ${message.author.username}`)
			.setTitle("Server Information")
			.setThumbnail(message.guild.iconURL)
			.setColor("#9f13f6")
			.addField("Created", `${message.guild.createdAt}`)
			.addField("ID", message.guild.id)
			.addField("Total Members", message.guild.memberCount)
			.addField("Server Owner", message.guild.owner)
			.addField("AFK Channel", message.guild.afkChannel)

		message.channel.send(embed);
	}

	if(command === `${prefix}help`) {
		let embed = new Discord.RichEmbed()
			.setFooter(`Info requested by ${message.author.username}`)
			.setTitle("Command List")
			.setThumbnail(bot.iconURL)
			.setColor("#9f13f6")
			.addField("userinfo", "Shows user information about the current user", "true")
			.addField("serverinfo", "Shows server information about the current server", "true")
			.addField("mute", ".mute {user} | Mute a user", "true")
			.addField("unmute", ".unmute {user} | Unmute a user", "true")
			.addField("warn", ".warn {user} | Warn a user", "true")
			.addField("ping", "The bot's ping to the discord servers", "true")
			.addField("status", "Bot uptime", "true")
			.addField("dice", "Rolls a dice", "true")

		message.channel.send("I have sent the help docs to your DM's!");
		message.author.send(embed);
	}

	if(command === `${prefix}warn`) {

		if(!message.member.hasPermission("KICK_MEMBERS")) return message.channel.send("You do not have the right permissions!");

				let toWarn = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
				if (!toWarn) return message.channel.send("You must specify a user!");

				if (toWarn.id === message.author.id) return message.channel.send("You cannot warn yourself!");
				if (toWarn.highestRole.position >= message.member.highestRole.position) return message.channel.send("You cannot mute a member who has the same/higher role than you!");

				let sendpm = message.guild.member(message.mentions.users.first());

				await sendpm.send(`You have been warned in ${message.guild.name}`);
				message.channel.send(`${toWarn.user.username}#${toWarn.user.discriminator} has been warned`);
	}

	if(command === `${prefix}dice`) {
		message.channel.send(dice[Math.floor(Math.random() * dice.length)]);
	}
});

bot.on('guildMemberAdd', member => {
	if (member.user.bot || member.guild.id !== '429524438455943169') return
	const welcome = `Welcome to Vixro's Lounge! To gain full access to the server, you must prove you are human. To do so, please reply to this DM with the following token: \`\`\` \nTOKEN-${token}\n \`\`\` Please note that this is CaSe-SeNsItIvE`
	member.send(welcome)
	member.user.token = token
	const channel = member.guild.channels.find('name', 'member-log');
	if (!channel) return;
	channel.send(`Welcome to Vixro's Lounge, ${member}! Please check your DM's to verify your account!`);
});

const verifymsg = `TOKEN-${token}`

bot.on('message', (message) => {
	if (message.author.bot || !message.author.token || message.channel.type !== `dm`) return
	if (message.content !== (verifymsg.replace(`${token}`, message.author.token))) return
	message.channel.send({
		embed: {
			color: 0x00ff00,
			description: completemsg,
			timestamp: new Date(),
			footer: {
				text: `Verification Successful`
			}
		}
	})
	bot.guilds.get('429524438455943169').member(message.author).addRole('429526043150254080')
		.then(console.log(`TOKEN: ${message.author.token} :: Role Member added to user ${message.author.username}#${message.author.discriminator}`))
		.catch(console.error)
});

bot.login(process.env.BOT_TOKEN);

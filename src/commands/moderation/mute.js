const Discord = require('discord.js');
const muteSchema = require('../../schemas/mute-schema');
require('dotenv').config();

const reasons = {
	SPAMMING: 5,
	ADVERTISING: 24,
	MISBEHAVING: 10,
};

module.exports = {
	name: 'mute',
	category: 'moderation',
	aliases : [],
	description: 'Mutes a user',
	// eslint-disable-next-line no-unused-vars
	async execute(client, msg, args) {

		const { guild, author: staff, member } = msg;
		const prefix = process.env.prefix;
		const tag = `<@${member.id}>`;

		if(member.hasPermission('ADMINISTRATOR') ||
            member.hasPermission('MUTE_MEMBERS')
		) {

			if (args.length !== 2) {
				msg.reply(`Correct syntax: ${guild.commandPrefix || prefix}mute <@Target> <Reason>`);
				return;
			}

			const target = msg.mentions.users.first();
			if(!target) {
				msg.reply('Please specify someone to mute!!');
				return;
			}

			const reason = args[1].toUpperCase();
			if(!reasons[reason]) {
				let validReasons = '';
				for (const key in reasons) {
					console.log(typeof (key), typeof (reasons[key]));
					validReasons += `${key}: ${reasons[key]}hr \n`;
				}
				validReasons = validReasons.substr(0, validReasons.length - 2);
				msg.reply(`Unknows reason, please use one of the following reasons: \n${validReasons}`);
				return;
			}

			try{
				const previousMutes = await muteSchema.find({
					userId: target.id,
				});

				const currentlyMuted = previousMutes.filter(mute => {
					return mute.current === true;
				});

				if(currentlyMuted.length) {
					msg.reply('That user is already muted');
					return;
				}

				const duration = reasons[reason] * (previousMutes.length + 1);

				const expires = new Date();
				expires.setHours(expires.getHours() + duration);

				const mutedRole = guild.roles.cache.find(role => {
					return role.name === 'Muted';
				});
				if(!mutedRole) {
				// todo : need to create muted role automatically if its not present
					msg.reply('Could not find a "Muted" role');
					return;
				}

				const targetMember = (await guild.members.fetch(target.id));
				await targetMember.roles.add(mutedRole);

				await new muteSchema({
					userId: target.id,
					guildId: guild.id,
					reason,
					staffId: staff.id,
					staffTag: staff.tag,
					expires,
					current: true,
				}).save();

				msg.reply(`You muted <@${target.id}> for "${reason}". They
					will be unmuted in ${duration} hours.`);

			}
			catch(error) {
				console.log(error);
				msg.reply('Bot is missing permission!! Please check whether the bot is above Muted role and the specified member');
			}
		}
		else {
		// msg.channel.send(`${tag} You do not have permission to use this commmand`);
			const embed = new Discord.MessageEmbed()
				.setColor('RED')
				.setDescription(`❌ ${tag} You do not have permission to use this commmand!!`);
			msg.channel.send(embed);
		}

	},

};
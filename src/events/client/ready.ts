import { ActivityType, Events } from 'discord.js'
import NobleApp from '../../utils/ClientSingleton'
import Logger from '../../utils/Logger'

const ready = {
	name: Events.ClientReady,
	once: true,
	isClientEvent: true,
	isPlayerEvent: false,
	async execute() {
		const app = NobleApp.get()
		const client = app.client
		if (!client.user) return //impossible but typescript...

		// add db verification (maybe bot are not anymore in some guild or users left)
		await client.guilds.cache.forEach(async guild => {
			let usersRecovered = 0
			if (guild.id === process.env.DEV_GUILD_ID) {
				guild.commands.set(app.commands.map(cmd => cmd.data.toJSON()))
				Logger.command(' - ' + guild.name + ' (dev guild) : commands loaded')
			}
			app.guildsState.set(guild.id, 'PENDING')
			const dbGuild = await app.db.guild.findUnique({
				where: { id: guild.id },
				include: { users: true },
			})
			const guildMembers = await guild.members.fetch()

			//if guild is in db
			if (dbGuild) {
				app.guildsState.set(guild.id, 'ACTIVE')
			} else {
				//create guild in db
				await app.db.guild.create({
					data: {
						durationLimit: new Date(1000 * 3),
						id: guild.id,
						name: guild.name,
						ownerId: guild.ownerId,
					},
				})
				// add members in db

				app.guildsState.set(guild.id, 'ACTIVE')
			}
			for (const guildMember of guildMembers) {
				const member = guildMember[1]
				await app.db.nobleUser.upsert({
					create: {
						id: member.user.id,
						name: member.user.username,
						guilds: { connect: { id: guild.id } },
					},
					update: { guilds: { connect: { id: guild.id } } },
					where: { id: member.user.id },
				})
				usersRecovered++
			}
			Logger.info(' - ' + guild.name + ' restauré avec ' + usersRecovered + ' utilisateurs')
		})

		Logger.client(` - Connecté en tant que ${client.user.tag}! avec l'id : ${client.user.id}`)
		client.user.setActivity('Un épisode de GTO', { type: ActivityType.Watching })

		// recover of app.guildsState
	},
}

export default ready

import { Events, Guild } from 'discord.js'
import NobleApp from '../../utils/ClientSingleton'
import Logger from '../../utils/Logger'

const event = {
	name: Events.GuildCreate,
	once: false,
	isClientEvent: true,
	isPlayerEvent: false,
	async execute(guild: Guild) {
		Logger.client(
			` - J'ai rejoins le serveur ${guild.name}! id du serveur : ${guild.id}. Je transmet à la DB.`
		)
		const app = NobleApp.get()

		Logger.database('Initialize request...')
		app.guildsState.set(guild.id, 'PENDING')

		try {
			await app.db.guild.upsert({
				create: {
					id: guild.id,
					name: guild.name,
					ownerId: guild.ownerId,
					durationLimit: new Date(5 * 1000),
				},
				update: {
					id: guild.id,
					name: guild.name,
				},
				where: { id: guild.id },
			})

			const members = await guild.members.fetch()

			for (const guildMember of members) {
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
			}
			Logger.database(members.size + ' users are connected to ' + guild.name)
			app.guildsState.set(guild.id, 'ACTIVE')
		} catch (error) {
			app.guildsState.set(guild.id, 'INACTIVE')
			return console.error(error)
		}
	},
}

export default event

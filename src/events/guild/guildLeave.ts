import { Events, Guild } from 'discord.js'
import NobleApp from '../../utils/ClientSingleton'
import Logger from '../../utils/Logger'

const event = {
	name: Events.GuildDelete,
	once: false,
	isClientEvent: true,
	isPlayerEvent: false,
	async execute(guild: Guild) {
		const app = NobleApp.get()
		// remove guild from db
		// delete all files of this guild
		// update users
		await app.db.guild.delete({ where: { id: guild.id } })
		app.guildsState.set(guild.id, 'INACTIVE')
		Logger.client(
			` - J'ai quitté le serveur ${guild.name}! id du serveur : ${guild.id}. Le serveur est marqué comme inactif!`
		)
	},
}

export default event

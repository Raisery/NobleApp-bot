import { ChatInputCommandInteraction, Events, Interaction } from 'discord.js'
import NobleApp from '../../utils/ClientSingleton'

const interaction = {
	name: Events.InteractionCreate,
	once: false,
	isClientEvent: true,
	isPlayerEvent: false,
	async execute(interaction: Interaction) {
		const app = NobleApp.get()
		if (interaction.isChatInputCommand()) {
			const cmd = app.commands.get(interaction.commandName)
			if (cmd) cmd.execute(interaction as ChatInputCommandInteraction)
		}
	},
}

export default interaction

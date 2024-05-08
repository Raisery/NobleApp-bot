import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js'

export default interface NobleCommand {
	data: SlashCommandBuilder
	// eslint-disable-next-line
	execute: (interaction: ChatInputCommandInteraction) => void
}

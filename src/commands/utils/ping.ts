import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js'
import NobleCommand from '../../types/NobleCommand'

const ping = {
	data: new SlashCommandBuilder().setName('ping').setDescription('Affiche la latence du bot'),
	execute: async (interaction: ChatInputCommandInteraction) => {
		if (!interaction.client.user || !interaction.client.readyTimestamp) return
		const embed = new EmbedBuilder()
			.setTitle('📊 Ping 📊')
			.setThumbnail(interaction.client.user.displayAvatarURL())
			.addFields(
				{
					name: 'Latence',
					value: `\`${interaction.client.ws.ping}ms\``,
					inline: false,
				},
				{
					name: 'Dernier restart',
					value: `<t:${Math.floor(interaction.client.readyTimestamp / 1000)}:R>`,
					inline: false,
				}
			)
			.setTimestamp()
			.setFooter({
				text: interaction.user.username,
				iconURL: interaction.user.displayAvatarURL(),
			})
		await interaction.reply({ embeds: [embed], fetchReply: true })
	},
} as NobleCommand

export default ping

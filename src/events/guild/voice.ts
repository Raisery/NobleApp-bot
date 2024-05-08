import { Events, VoiceState } from 'discord.js'
import NobleApp from '../../utils/ClientSingleton'
import path from 'path'
import { createAudioResource, joinVoiceChannel } from '@discordjs/voice'
import Logger from '../../utils/Logger'
import { EventType } from '../../lib/definitions'
const storagePath = path.join(process.cwd(), '../Storage/')

const voice = {
	name: Events.VoiceStateUpdate,
	once: false,
	isClientEvent: true,
	isPlayerEvent: false,
	async execute(oldState: VoiceState, newState: VoiceState) {
		const app = NobleApp.get()
		if (app.guildsState.get(oldState.guild.id) !== 'ACTIVE') return
		if (!oldState.member || !newState.member)
			return Logger.info('VoiceStateUpdate : There is no member in states')
		const guildEvents = await app.db.guildVoiceEvent.findMany({
			where: {
				guildId: oldState.guild.id,
			},
		})
		const userEvents = await app.db.userVoiceEvent.findMany({
			where: {
				userId: oldState.member?.user.id,
				guildId: oldState.guild.id,
			},
		})
		if (!guildEvents) Logger.info('There is no events for ' + oldState.guild.name)
		if (!userEvents) Logger.info('There is no adverts for ' + oldState.member?.user.username)
		const connectionSong = userEvents.find(event => event.type === EventType.CONNECTION)
		const deconnectionSong = userEvents.find(event => event.type === EventType.DECONNECTION)
		const onpenStreamSong = userEvents.find(event => event.type === EventType.OPEN_STREAM)
		const closeStreamSong = userEvents.find(event => event.type === EventType.CLOSE_STREAM)

		switch (getEventTriggered(oldState, newState)) {
			case 'BOT':
				return
			case 'CONNECTION':
				if (!connectionSong) return
				playSong(connectionSong, newState)
				Logger.event(' - CONNECTION : ' + newState.member.user.username)
				return
			case 'DISCONNECTION':
				if (!deconnectionSong) return
				playSong(deconnectionSong, newState)
				return
			case 'SWITCH':
				return
			case 'STREAM_ON':
				if (!onpenStreamSong) return
				playSong(onpenStreamSong, newState)
				return
			case 'STREAM_OFF':
				if (!closeStreamSong) return
				playSong(closeStreamSong, newState)
				return
		}
	},
}

export default voice

function getEventTriggered(o: VoiceState, n: VoiceState) {
	if (n.member?.user.bot) return 'BOT'
	if (n.channelId == null) return 'DISCONNECTION'
	if (n.channelId != o.channelId && o.channelId == null) return 'CONNECTION'
	if (n.channelId != o.channelId && o.channelId != null) return 'SWITCH'
	if (n.streaming != o.streaming && o.streaming == false) return 'STREAM_ON'
	if (n.streaming != o.streaming && o.streaming == true) return 'STREAM_OFF'
	else return null
}

function playSong(
	song: {
		id: number
		type: string
		userId: string
		songId: number
		guildId: string
		isActive: boolean
	},
	n: VoiceState
) {
	const songPath = path.join(storagePath, song.songId + '.mp3')
	const app = NobleApp.get()
	if (!n.channelId) return
	const connection = joinVoiceChannel({
		channelId: n.channelId,
		guildId: n.guild.id,
		adapterCreator: n.guild.voiceAdapterCreator,
	})
	const resource = createAudioResource(songPath, {
		inlineVolume: true,
	})
	resource.volume?.setVolume(0.15)
	app.subscription = connection.subscribe(app.player)
	app.player.play(resource)

	console.log(songPath)
}

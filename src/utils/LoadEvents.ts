import path from 'path'
import NobleApp from './ClientSingleton'
import Logger from './Logger'
import fs from 'fs'
import { Events } from 'discord.js'
import NobleEvent from '../types/NobleEvent'
import { AudioPlayerStatus } from '@discordjs/voice'

export default async function LoadEvents(app: NobleApp) {
	Logger.event(' - Looking for events files ...')
	const folderPath = path.join(process.cwd(), 'src/events')
	const eventFolders = fs.readdirSync(folderPath)
	const eventsFilesPath = []
	for (const folder of eventFolders) {
		const eventsPath = path.join(folderPath, folder)
		const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts'))
		for (const file of eventFiles) {
			const filePath = path.join(eventsPath, file)
			eventsFilesPath.push(filePath)
		}
	}
	Logger.event(' - ' + eventsFilesPath.length + ' events found. Trying to load them... ')
	let loaded = 0
	for (const filePath of eventsFilesPath) {
		try {
			const event = (await import(filePath)).default as NobleEvent
			Logger.event(' - Loading : ' + event.name + ' ...')

			if (event.once) {
				if (event.isClientEvent && isACorrectDiscordEvent(event.name)) {
					app.client.once(event.name, (...args: Parameters<typeof event.execute>) =>
						event.execute(...args)
					)
					loaded++
				} else if (event.isPlayerEvent && isACorrectPlayerEvent(event.name)) {
					app.player.once(event.name, (...args: Parameters<typeof event.execute>) =>
						event.execute(...args)
					)
					loaded++
				} else {
					Logger.event('- FAILED')
				}
			} else if (!event.once) {
				if (event.isClientEvent && isACorrectDiscordEvent(event.name)) {
					app.client.on(event.name, (...args: Parameters<typeof event.execute>) =>
						event.execute(...args)
					)
					loaded++
				} else if (event.isPlayerEvent && isACorrectPlayerEvent(event.name)) {
					app.player.on(
						event.name as AudioPlayerStatus,
						(...args: Parameters<typeof event.execute>) => {
							console.log('TRIGGER')
							console.log(...args)
							event.execute(...args)
						}
					)
					loaded++
				} else {
					Logger.event('- FAILED')
				}
			}
		} catch (error) {
			Logger.error('Error : Cannot load this event.', error as Promise<Error>)
		}
	}
	Logger.event(' - ' + loaded + '/' + eventsFilesPath.length + ' events loaded')
}

function isACorrectDiscordEvent(event: string) {
	// eslint-disable-next-line
	return (<any>Object).values(Events).includes(event)
}

function isACorrectPlayerEvent(event: string) {
	// eslint-disable-next-line
	return (<any>Object).values(AudioPlayerStatus).includes(event)
}

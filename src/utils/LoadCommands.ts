import { Collection } from 'discord.js'
import NobleCommand from '../types/NobleCommand'
import path from 'path'
import fs from 'fs'
import Logger from './Logger'

export default async function LoadCommands(commands: Collection<string, NobleCommand>) {
	Logger.command(' - Looking for commands files ...')
	const folderPath = path.join(process.cwd(), 'src/commands')
	const commandFolders = fs.readdirSync(folderPath)
	const commandsFilesPath = []
	for (const folder of commandFolders) {
		const commandsPath = path.join(folderPath, folder)
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'))
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file)
			commandsFilesPath.push(filePath)
		}
	}
	Logger.command(' - ' + commandsFilesPath.length + ' commands found. Trying to load them... ')
	let loaded = 0
	for (const filePath of commandsFilesPath) {
		try {
			const command = (await import(filePath)).default as NobleCommand
			Logger.command(' - Loading : ' + command.data.name + ' ...')
			commands.set(command.data.name, command)
			loaded++
		} catch (error) {
			Logger.error('Cannot load cmd in ' + filePath + ' \nInvalid File !')
		}
	}
	Logger.command(' - ' + loaded + '/' + commandsFilesPath.length + ' commands loaded')
}

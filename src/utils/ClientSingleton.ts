import { Client, Collection, GatewayIntentBits } from 'discord.js'
import Logger from './Logger'
import {
	AudioPlayer,
	AudioPlayerStatus,
	PlayerSubscription,
	createAudioPlayer,
} from '@discordjs/voice'
import NobleCommand from '../types/NobleCommand'
import LoadCommands from './LoadCommands'
import LoadEvents from './LoadEvents'
import prisma from '../lib/prisma'

/**
 * The Singleton class defines the `getInstance` method that lets clients access
 * the unique singleton instance.
 */
export default class NobleApp {
	private static instance: NobleApp

	public client: Client
	public commands: Collection<string, NobleCommand>
	public subscriptions: Collection<string, PlayerSubscription | undefined>
	public subscription: PlayerSubscription | undefined
	public player: AudioPlayer
	public guildsState: Collection<string, 'PENDING' | 'ACTIVE' | 'INACTIVE'>
	public db: typeof prisma
	/**
	 * The Singleton's constructor should always be private to prevent direct
	 * construction calls with the `new` operator.
	 */
	public constructor() {
		this.client = new Client({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.GuildVoiceStates,
				GatewayIntentBits.DirectMessages,
				GatewayIntentBits.DirectMessageReactions,
			],
		})
		this.db = prisma
		this.guildsState = new Collection<string, 'PENDING' | 'ACTIVE' | 'INACTIVE'>()
		this.commands = new Collection<string, NobleCommand>()
		this.subscriptions = new Collection<string, PlayerSubscription | undefined>()
		this.player = createAudioPlayer()
		this.player.on(AudioPlayerStatus.Idle, () => {
			if (this.subscription) this.subscription.connection.destroy()
		})
		LoadCommands(this.commands)
		LoadEvents(this)
	}

	/**
	 * The static method that controls the access to the singleton instance.
	 *
	 * This implementation let you subclass the Singleton class while keeping
	 * just one instance of each subclass around.
	 */
	public static get(): NobleApp {
		if (!NobleApp.instance) {
			NobleApp.instance = new NobleApp()
		}

		return NobleApp.instance
	}

	/**
	 * Finally, any singleton should define some business logic, which can be
	 * executed on its instance.
	 */
	public start() {
		const token = process.env.BOT_TOKEN as string
		if (token)
			try {
				this.client.login(token)
			} catch (error) {
				Logger.error('Cannot connect :', error as Promise<Error>)
			}
		else
			Logger.error('Invalid bot token !', {
				error: 'BOT_TOKEN is invalid or not present in .env file',
			})
	}
}

import 'dotenv/config'
import Logger from './utils/Logger'
import NobleClient from './utils/ClientSingleton'

const app = NobleClient.get()

process.on('exit', code => {
	Logger.client(`Le processus s'est arrêté avec le code: ${code}`)
})
process.on('uncaughtException', (err, origin) => {
	Logger.error(`UNCAUGHT_EXCEPTION: ${err}`, `Origine: ${origin}`)
})
process.on('unhandledRejection', (reason, promise) => {
	Logger.warn(`UNHANDLED_REJECTION: ${reason}`, promise)
})
process.on('warning', (...args) => Logger.warn(...args))

app.start()

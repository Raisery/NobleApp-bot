import chalk, { ChalkFunction } from 'chalk'
import dayjs from 'dayjs'

const format = '{tstamp} {tag} {txt}\n'

function error(content: string, promise = {}) {
	write(content, chalk.bgRed.white, 'ERROR', true)
	console.log(promise)
}

function warn(content: string | Error, promise = {}) {
	write(content, chalk.bgYellow.black, 'WARN', false)
	console.log(promise)
}

function typo(content: string) {
	write(content, chalk.bgCyan.black, 'TYPO', false)
}

function command(content: string) {
	write(content, chalk.bgMagenta.black, 'COMMAND', false)
}

function event(content: string) {
	write(content, chalk.bgGreen.black, 'EVENT', false)
}

function client(content: string) {
	write(content, chalk.bgBlue.black, 'CLIENT', false)
}

function info(content: string) {
	write(content, chalk.bgWhite.black, 'INFO', false)
}

function database(content: string) {
	write(content, chalk.bgRgb(100, 28, 122).white, 'DATABASE', false)
}

function write(content: string | Error, chalkTag: ChalkFunction, tag: string, error = false) {
	const timestamp = `[${dayjs().format('DD/MM - HH:mm:ss')}]`
	const logTag = `[${tag}]`
	const stream = error ? process.stderr : process.stdout

	const item = format
		.replace('{tstamp}', chalk.gray(timestamp))
		.replace('{tag}', chalkTag(logTag))
		.replace('{txt}', chalk.white(content))
	stream.write(item)
}
const Logger = { error, warn, typo, event, command, client, info, database }
export default Logger

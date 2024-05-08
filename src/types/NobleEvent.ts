export default interface NobleEvent {
	name: string
	once: boolean
	isClientEvent: boolean
	isPlayerEvent: boolean
	// eslint-disable-next-line
	execute: (params: any) => void
}

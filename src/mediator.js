const channels = {}

export default {
	subscribe(channel, cb) {
		if(!channels[channel]) {
			channels[channel] = []
		}

		channels[channel].push(cb)
	},

	publish(channel, data) {
		if(!channels[channel]) { return }
		
		channels[channel].forEach(cb => {
			cb(data)
		})
	}
}
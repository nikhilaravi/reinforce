import helpers from './helpers/helpers'
import nodes from './nodes'

let current = []

// what goes into state? on what basis should we have the agent learn?
// how well their messages performed. 
// what everyone else has been saying (up to 3 cycles deep)
// maybe for now return random numbers for state

export default {
	init() {
		helpers.bindAll(this, [ "collectMessages", "emitMessages", "cycle" ])
	},

	cycle() {
		this.collectMessages()
		this.emitMessages()

		current.forEach(d => console.log(d))

		current = []
	},

	collectMessages() {
		nodes.forEach(n => current.push(Object.assign(
			n.getMessage(), { id: uuid.v4() })))
	},

	emitMessages() {
		nodes.forEach(n => n.sendMessages(current))
	}
}

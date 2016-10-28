import helpers from './helpers/helpers'
import nodes from './nodes'

let current = []

// messages each have an id, an orientation, and a user id associated, and a retweet id (if it is a retweet)

// maybe the way it should work is, this component could reach out and collect messages from others. also collect their ids

// then it sends these messages out 

// each node subscribes to the message state

// when a node hears a message from a user it's following, it records it (nodes record 3 cycles deep)

// on the next cycle, nodes can retweet out something they agree with from the previous cycle
// unless they were the originator

// what goes into state?
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

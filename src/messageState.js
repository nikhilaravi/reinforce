import helpers from './helpers/helpers'

const nodes = []

let SID = null, current = []

// messages each have an id, an orientation, and a user id associated, and a retweet id (if it is a retweet)

// maybe the way it should work is, this component could reach out and collect messages from others. also collect their ids

// then it sends these messages out 

// each node subscribes to the message state, passing it an array of ids it is following

// when a node hears a message from a user it's following, it records it (nodes record 3 cycles deep)

// on the next cycle, nodes can retweet out something they agree with from the previous cycle
// unless they were the originator

export default {
	init() {
		helpers.bindAll(this, [ "collectMessages", "cycle" ])

		SID = setInterval(this.cycle, 2000)
	},

	cycle() {
		this.collectMessages()

		current.forEach(d => console.log(d))

		current = []
	},

	subscribe(node) {
		nodes.push(node)
	},

	collectMessages() {
		nodes.forEach(n => current.push(n.getMessage()))
	}
}
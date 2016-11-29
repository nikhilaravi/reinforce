import helpers from './helpers/helpers'
import { Nodes } from './nodes'

const maxCyclesInMemory = 5
let memory = {}, current = []

const updateMessageReach = (id, followersCount, retweet) => {
	if(typeof memory[id] === 'undefined' && !retweet) {
		memory[id] = {
			reach: 0,
			cycles: 0
		}
	}

	if(typeof memory[id] !== 'undefined') {
		if(memory[id].cycles > maxCyclesInMemory) {
			delete memory[id]
		} else {
			memory[id].reach += followersCount
			memory[id].cycles++			
		}			
	}
}

export default {
	init() {
		helpers.bindAll(this, [ "collectMessages", "emitMessages", "cycle" ])
	},

	cycle() {
		this.collectMessages()
		this.emitMessages()

		current = []
	},

	collectMessages() {
		for(let i=0; i<Nodes.length; i++) {
			let message = Object.assign(
				Nodes[i].getMessage(), {
					id: uuid.v4()
				})

			current.push(message)

			updateMessageReach(message.id, Nodes[i].followedBy.length, !!message.retweetID)
		}
	},

	emitMessages() {
		for(let i=0; i<Nodes.length; i++) {
			Nodes[i].sendMessages(current)
		}
	},

	getMessageReach(id) {
		return memory[id].reach
	}
}

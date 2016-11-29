import helpers from './helpers/helpers'
import { Nodes } from './nodes'

const maxCyclesInMemory = 5
let memory = {}, current = []

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
			current.push(Object.assign(
				Nodes[i].getMessage(), {
					id: uuid.v4()
				}))
		}
	},

	emitMessages() {
		for(let i=0; i<Nodes.length; i++) {
			Nodes[i].sendMessages(current)
		}
	},

	updateMessageReach(id, followersCount, retweet) {
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
	},

	getMessageReach(id) {
		return memory[id].reach
	}
}

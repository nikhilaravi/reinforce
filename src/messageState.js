import helpers from './helpers/helpers'
import { Nodes } from './nodes'
import { maxCyclesInMemory } from './config'

let memory = {}, current = []

export let cycleIndex = 0

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
		helpers.bindAll(this, [ "collectMessages", "cycle" ])
	},

	cycle() {
		this.collectMessages()

		for(let i=0; i<Nodes.length; i++) {
			Nodes[i].sendMessages(current)
			Nodes[i].cycle()
		}

		current = []

		cycleIndex++
	},

	collectMessages() {
		for(let i=0; i<Nodes.length; i++) {
			let message = Nodes[i].getMessage()

			current.push(message)

			updateMessageReach(message.id, Nodes[i].followedBy.length, message.retweetID)
		}
	},

	getMessageReach(id) {
		return memory[id].reach
	}
}

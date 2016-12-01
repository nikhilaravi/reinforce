import helpers from './helpers/helpers'
import { Nodes } from './nodes'
import { maxCyclesInMemory } from './config'

let messagePassingRecord = {},
	memory = {}, 
	current = []

const updateMessagePassingRecord = ({ user, retweet }) => {
	if(!retweet) { return }

	if(typeof messagePassingRecord[user][retweet.user] === 'undefined') {
		messagePassingRecord[user][retweet.user] = 0
	}

	messagePassingRecord[user][retweet.user]++
}

const updateMessageReach = (id, followersCount, retweet) => {
	if(typeof memory[id] === 'undefined' && !retweet) {
		memory[id] = {
			actual: 0,
			potential: 0,
			pending: 0,
			cycles: 0
		}
	}

	if(typeof memory[id] !== 'undefined') {
		if(memory[id].cycles > maxCyclesInMemory) {
			delete memory[id]
		} else {
			memory[id].pending += followersCount
			memory[id].actual++
		}			
	}
}

export default {
	cycleIndex: 0,

	init() {
		helpers.bindAll(this, [ "collectMessages", "cycle" ])

		for(let i=0; i<Nodes.length; i++) {
			messagePassingRecord[Nodes[i].id] = {}
		}
	},

	cycle() {
		Object.keys(memory).forEach(k => {
			const entry = memory[k]
			entry.cycles++
			entry.potential += entry.pending
			entry.pending = 0
		})

		this.collectMessages()

		for(let i=0; i<Nodes.length; i++) {
			Nodes[i].sendMessages(current)
			Nodes[i].cycle()
		}

		current = []

		this.cycleIndex++
	},

	collectMessages() {
		for(let i=0; i<Nodes.length; i++) {
			let messages = Nodes[i].getMessage()

			for(let j=0; j<messages.length; j++) {
				let message = messages[j]
				current.push(message)

				updateMessageReach(message.retweet ? message.retweet.id : message.id, Nodes[i].followedBy.length, message.retweet)

				updateMessagePassingRecord(message)
			}
		}
	},

	getMessageReach(id) {
		const entry = memory[id]
		return Math.log(entry.actual) / Math.log(Math.max(0.0001, entry.potential))
	},

	getRetweetCount(userA, userB) {
		return messagePassingRecord[userA][userB]
	}
}

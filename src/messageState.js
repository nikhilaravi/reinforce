import helpers from './helpers/helpers'
import { Nodes } from './nodes'
import mediator from './mediator'

let current = []

export default {
	init() {
		helpers.bindAll(this, [ "collectMessages", "emitMessages", "cycle" ])
	},

	cycle() {
		this.collectMessages()
		this.emitMessages()

		// current.forEach(d => console.log(d))

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
		mediator.publish("newMessages", current)

		for(let i=0; i<Nodes.length; i++) {
			Nodes[i].sendMessages(current)
		}
	}
}

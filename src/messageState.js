import helpers from './helpers/helpers'
import { Nodes } from './nodes'

let current = []

/* 
what goes into state? on what basis should we have the agent learn?
what everyone else has been saying (up to 3 cycles deep)
we want the agent to learn that if everyone else is saying something, then the agent should also say it. otherwise, don't say it. (should only know their local topology, right?)

what about reward? 
page rank. (how well their messages performed)

for puckworld, state was where all the pieces were on the board, and reward was how good that state was. 
*/

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
		Nodes.forEach(n => current.push(Object.assign(
			n.getMessage(), { id: uuid.v4() })))
	},

	emitMessages() {
		Nodes.forEach(n => n.sendMessages(current))
	}
}

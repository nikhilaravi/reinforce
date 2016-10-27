import helpers from './helpers/helpers'

export default class Node {
	constructor(opts) {
		this.id = opts.id
		this.username = opts.username
		this.belief = opts.belief

		const env = {
			getNumStates: () => 1,
			getMaxNumActions: () => 3 // political, neural, nothing
		}

		const spec = { alpha: 0.01 }

		this.agent = new RL.DQNAgent(env, spec)
	}

	emitMessage() {
		console.log(this.belief)
	}

	init() {
		helpers.bindAll(this, [ "emitMessage" ])

		this.SID = setInterval(this.emitMessage, 1000)
	}
}
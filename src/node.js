import helpers from './helpers/helpers'
import messageState from './messageState'

export default class Node {
	constructor(opts) {
		this.id = opts.id
		this.username = opts.username
		this.belief = opts.belief

		this._following = []
		this.lastCycle = []

		const env = {
			getNumStates: () => 1,
			getMaxNumActions: () => 3 // political, neural, nothing
		}

		const spec = { alpha: 0.01 }

		this.agent = new RL.DQNAgent(env, spec)
	}

	set following(newFollowing) {
		this._following = newFollowing
	}

	get following() {
		return this._following
	}

	getMessage() {
		let message = this.belief
		if(Math.random() < 0.5) {
			message = ""
		}
		
		return {
			message,
			user: this.id
		}		
	}

	init() {
		messageState.subscribe(this)

		helpers.bindAll(this, [ "getMessage" ])
	}
}
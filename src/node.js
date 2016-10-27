import helpers from './helpers/helpers'
import messageState from './messageState'

export default class Node {
	constructor(opts) {
		this.id = opts.id
		this.username = opts.username
		this.belief = opts.belief

		this._following = []
		this.memory = [[]]

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
		let orientation = "", retweetID = null

		// this first randomness will be the part that we learn
		if(Math.random() < 0.5) { 
			orientation = this.belief 
			if(Math.random() < 0.5) {
				const matchingMessages = this.memory.reduce(helpers.flatten)
					.filter(msg => msg.orientation === this.belief)

				if(matchingMessages.length) {
					retweetID = matchingMessages[Math.round(Math.random() * (matchingMessages.length - 1))].id
				}
			}
		}
		
		return {
			orientation,
			retweetID,
			user: this.id
		}	
	}

	sendMessages(messages) {
		if(this.memory.length > 3) {
			this.memory.shift()
		}

		this.memory.push(messages.filter(msg =>
			this._following.includes(msg.user)))
	}

	init() {
		messageState.subscribe(this)

		helpers.bindAll(this, [ "getMessage", "sendMessages" ])
	}
}

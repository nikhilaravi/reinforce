import helpers from './helpers/helpers'
const { flatten, sampleArray, createDictByProp, bindAll } = helpers
import messageState from './messageState'
import { values } from 'underscore'

const cyclesInMemory = 3

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
		const totalMemory = this.memory.reduce(flatten)

		const byBeliefs = createDictByProp(
			totalMemory.filter(msg => 
				msg.orientation !== this.belief && !!msg.orientation), 'orientation')

		const strongCounterOrientation = values(byBeliefs).find(d => d.length > 3)

		if(strongCounterOrientation) {
			// change your belief to match the strong counter orientation
			this.belief = strongCounterOrientation[0].orientation

			// now follow someone randomly from the strong counter orientation group
			const newCounterUsers = strongCounterOrientation.map(d => d.user).filter(d => !this._following.includes(d))
			if(newCounterUsers.length) {
				this._following.push(sampleArray(newCounterUsers))
			}
		}

		// unfollow anyone who has been political for the last 3 rounds
		if(values(byBeliefs).length) {
			const messagesByUser = createDictByProp(values(byBeliefs).reduce(flatten), 'user')
			const overpoliticalUsers = Object.keys(messagesByUser).filter(k =>
				messagesByUser[k].length === cyclesInMemory)

			if(overpoliticalUsers.length) {
				this._following.splice(
					this._following.findIndex(d => 
						d === sampleArray(overpoliticalUsers)), 1)
			}
		}

		// this first randomness will be the part that we learn
		if(Math.random() < 0.5) { 
			orientation = this.belief 
			if(Math.random() < 0.5) {
				const matchingMessages = totalMemory
					.filter(msg => msg.orientation === this.belief)

				if(matchingMessages.length) {
					retweetID = sampleArray(matchingMessages).id
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
		if(this.memory.length > cyclesInMemory) {
			this.memory.shift()
		}

		this.memory.push(messages.filter(msg =>
			this._following.includes(msg.user)))
	}

	init() {
		messageState.subscribe(this)

		bindAll(this, [ "getMessage", "sendMessages" ])
	}
}

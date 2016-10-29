import helpers from './helpers/helpers'
const { flatten, sampleArray, createDictByProp, bindAll } = helpers
import { values } from 'underscore'
import nodes from './nodes'

const cyclesInMemory = 3

export default class Node {
	constructor(opts) {
		this.id = opts.id
		this.username = opts.username
		this.belief = opts.belief

		this._following = []
		this.memory = [[]]

		this.agent = new RL.DQNAgent(this, {
	    update: 'qlearn', 
	    gamma: 0.9, // discount factor, [0, 1)
	    epsilon: 0.2, // initial epsilon for epsilon-greedy policy, [0, 1)
	    alpha: 0.01, // value function learning rate
	    experience_add_every: 10, // number of time steps before we add another experience to replay memory
	    experience_size: 5000, // size of experience replay memory
	    learning_steps_per_iteration: 20,
	    tderror_clamp: 1.0, // for robustness
	    num_hidden_units: 100 // number of neurons in hidden layer
	  })
	}

	set following(newFollowing) {
		this._following = newFollowing
	}

	get following() {
		return this._following
	}

	getNumStates() { 
		return 1
	}

	getMaxNumActions() {
		return 3
	}

	getState() {
		return [ Math.random() ]
	}

	sampleNextState() {
		return {
			s: [],
			r: Math.random()
		}
	}

	getMessage() {
		let orientation = "", retweetID = null

		const state = this.getState()
		const action = this.agent.act(state)
		const { r } = this.sampleNextState(action)
		this.agent.learn(r)

		// this first randomness will be the part that we learn
		if(Math.random() < 0.5) { 
			orientation = this.belief 
			if(Math.random() < 0.5) {
				const matchingMessages = this.memory.reduce(flatten)
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

		this.adjustFollowing()
	}

	adjustFollowing() {
		const byBeliefs = createDictByProp(this.memory.reduce(flatten), 'orientation')
		const agreementCount = byBeliefs[this.belief] ? byBeliefs[this.belief].length : 0.0001 // prevent div by 0

		const strongCounterOrientation = Object.keys(byBeliefs)
			.filter(d => d !== this.belief && !!d)
			.map(k => byBeliefs[k] )
			.find(d => d.length / agreementCount > 1.5)

		if(strongCounterOrientation) {
			// change your belief to match the strong counter orientation
			this.belief = strongCounterOrientation[0].orientation

			// now follow someone randomly from the strong counter orientation group
			const availableFollowees = nodes.filter(n =>
				n.belief === this.belief && !this._following.includes(n.id))
			if(availableFollowees.length) {
				this._following.push(sampleArray(availableFollowees).id)
			}
		}

		// unfollow anyone who has been political for the last 3 rounds
		if(values(byBeliefs).length) {
			const messagesByUser = createDictByProp(values(byBeliefs).reduce(flatten), 'user')
			const overpoliticalUsers = Object.keys(messagesByUser)
				.filter(k => messagesByUser[k].length === cyclesInMemory)

			if(overpoliticalUsers.length) {
				this._following.splice(
					this._following.findIndex(d => 
						d === sampleArray(overpoliticalUsers)), 1)
			}
		}
	}

	init() {
		bindAll(this, [ "getMessage", "sendMessages", "adjustFollowing" ])
	}
}

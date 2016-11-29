import helpers from './helpers/helpers'
const { flatten, sampleArray, createDictByProp, bindAll } = helpers
import { values } from 'underscore'
import { Nodes, getReach } from './nodes'
import { beliefs, maxCyclesInMemory } from './config'

const cyclesInMemory = 3

export default class Node {
	constructor(opts) {
		this.id = opts.id
		this.index = opts.index
		this.username = opts.username
		this.belief = opts.belief
		this.trumporhillary = opts.trumporhillary

		this._following = []
		this._lastFollowing = []
		this._followedBy = []
		this.memory = [[]]
		this.ownMessages = {}
		this._rewards = []

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

	set followedBy(newFollowedBy) { this._followedBy = newFollowedBy }

	get followedBy() { return this._followedBy }

	set following(newFollowing) { this._following = newFollowing }

	get following() { return this._following }

	set lastFollowing(newLastFollowing) { this._lastFollowing = newLastFollowing }

	get lastFollowing() { return this._lastFollowing }

	getNumStates() { return beliefs.length }

	getMaxNumActions() { return beliefs.length }

	getState() { // evolve state here
		let counts = beliefs.reduce((acc, curr) => {
			acc[curr] = 0
			return acc
		}, {})

		for(let i=0; i<this._following.length; i++) {
			counts[this._following[i].belief]++
		}

		return values(counts)
	}

	getReward() { // total reach
		return Math.random()
	}

	getMessage() {
		const message = { 
			orientation: this.belief, 
			retweetID: null,
			user: this.id, id: uuid.v4() 
		}

		if(Math.random() < 0.5) {
			const matchingMessages = this.memory.reduce(flatten)
				.filter(msg => msg.orientation === this.belief)

			if(matchingMessages.length) {
				message.retweetID = sampleArray(matchingMessages).id
			}
		}

		if(!!message.retweetID) {
			this.ownMessages[message.id] = 0
		}

		return message
	}

	sendMessages(messages) {
		if(this.memory.length > cyclesInMemory) { this.memory.shift() }

		const filteredMessages = []
		for(let i=0; i<messages.length; i++) {
			if(this._following.find(d => d.id === messages[i].user)) {
				filteredMessages.push(messages[i])
			}
		}

		this.memory.push(filteredMessages)
	}

	cycle() {
		Object.keys(this.ownMessages).forEach(k => {
			this.ownMessages[k]++
		})
	}

	setNextAction() {
		const state = this.getState(),
			action = this.agent.act(state),
			r = this.getReward()

		this._rewards.push(r) // save the reward to memory

		this.agent.learn(r)

		this.nextAction = action
	}

	adjustFollowing() {
		const byBeliefs = createDictByProp(this.memory.reduce(flatten), 'orientation'),
			agreementCount = byBeliefs[this.belief] ? byBeliefs[this.belief].length : 0.0001,
			strongCounterOrientation = Object.keys(byBeliefs)
				.filter(d => d !== this.belief && !!d)
				.map(k => byBeliefs[k] )
				.find(d => d.length / agreementCount > 1.5)

		this._lastFollowing = this._following.slice()

		if(strongCounterOrientation) {
			// change your belief to match the strong counter orientation
			this.belief = strongCounterOrientation[0].orientation

			// now follow someone randomly from the strong counter orientation group
			const availableFollowees = Nodes.filter(n =>
				n.belief === this.belief && !this._following.includes(n.id))
			if(availableFollowees.length) {
				this._following.push(sampleArray(availableFollowees))
			}
		}

		// unfollow anyone who has been political for the last 3 rounds
		if(values(byBeliefs).length) {
			const messagesByUser = createDictByProp(values(byBeliefs).reduce(flatten), 'user'),
				overpoliticalUsers = Object.keys(messagesByUser)
					.filter(k => messagesByUser[k].length === cyclesInMemory)

			if(overpoliticalUsers.length) {
				this._following.splice(
					this._following.findIndex(d => d.id === sampleArray(overpoliticalUsers)), 1)
			}
		}

		this.setNextAction()
	}

	init() {
		bindAll(this, [ "cycle", "getMessage", "sendMessages", "adjustFollowing" ])
	}
}

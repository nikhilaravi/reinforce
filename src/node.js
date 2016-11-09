import helpers from './helpers/helpers'
const { flatten, sampleArray, createDictByProp, bindAll } = helpers
import { values } from 'underscore'
import { Nodes, getReach } from './nodes'

const cyclesInMemory = 3

export default class Node {
	constructor(opts) {
		this.id = opts.id
		this.username = opts.username
		this.belief = opts.byBeliefs

		this._following = []
		this._trustScores = []
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

	set following(newFollowing) { this._following = newFollowing }

	get following() { return this._following }

	getNumStates() { return this._following.length}

	getMaxNumActions() { return 4 }

	getState() { // evolve state here
		var neighborIdeologies = []
		this._following.forEach(n => {
			neighborIdeologies.push(n.belief)
		})

		return neighborIdeologies
	}

	getReward() { // total reach
		return getReach(this)
	}

	getMessage() {
		let orientation = "", retweetID = null

		if(this.nextAction === 1) { 
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
			orientation, retweetID, user: this.id
		}	
	}

	sendMessages(messages) {
		if(this.memory.length > cyclesInMemory) { this.memory.shift() }

		const filteredMessages = []
		for(let i=0; i<messages.length; i++) {
			if(this._following.indexOf(messages[i].user) > -1) {
				filteredMessages.push(messages[i])
			}
		}

		this.memory.push(filteredMessages)
	}

	setNextAction() {
		const state = this.getState(),
			action = this.agent.act(state),
			r = this.getReward()

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

		if(strongCounterOrientation) {
			// change your belief to match the strong counter orientation
			this.belief = strongCounterOrientation[0].orientation

			// now follow someone randomly from the strong counter orientation group
			const availableFollowees = Nodes.filter(n =>
				n.belief === this.belief && !this._following.includes(n.id))
			if(availableFollowees.length) {
				this._following.push(sampleArray(availableFollowees).id)
			}
		}

		// unfollow anyone who has been political for the last 3 rounds
		if(values(byBeliefs).length) {
			const messagesByUser = createDictByProp(values(byBeliefs).reduce(flatten), 'user'),
				overpoliticalUsers = Object.keys(messagesByUser)
					.filter(k => messagesByUser[k].length === cyclesInMemory)

			if(overpoliticalUsers.length) {
				this._following.splice(
					this._following.findIndex(d => d === sampleArray(overpoliticalUsers)), 1)
			}
		}

		this.setNextAction()
	}

	init() {
		bindAll(this, [ "getMessage", "sendMessages", "adjustFollowing" ])
	}

	// Randomly assign trust scores for each node
	initializeTrustScores() {

		var totalTrust = 0;
		var trustVals = [];
		// console.log("num following: " + this._following.length)
		this._following.forEach(n => {
			var thisTrustScore = Math.random() * this._following.length
			trustVals.push({"node":n, "score":thisTrustScore})
			totalTrust += thisTrustScore
		})

		totalTrust = parseFloat(totalTrust)

		if (totalTrust == 0)
			totalTrust = 1

		trustVals.forEach(trustData => {
			// console.log('non-normalized trust score: ' + trustData.score)
			this._trustScores.push({"node":trustData.node, "score":trustData.score/totalTrust})
			// console.log(JSON.stringify({"node":trustData.node, "score":trustData.score/totalTrust}))
		})

	}
}

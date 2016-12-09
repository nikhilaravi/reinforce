import helpers from './helpers/helpers'
const { flatten, sampleArray, createDictByProp, bindAll } = helpers
import { values } from 'underscore'
import { Nodes } from './nodes'
import { beliefs, maxCyclesInMemory, minFolloweeSize } from './config'
import messageState from './messageState'

const EPS = 0.00001

export default class Node {
	constructor(opts) {
		this.id = opts.id
		this.index = opts.index
		this.username = opts.username
		this.belief = opts.belief
		this.trumporhillary = opts.trumporhillary
		this.desiredDiversity = opts.desiredDiversity

		this._following = []
		this._lastFollowing = []
		this._followedBy = []
		this.lastReceivedMessages = []
		this.learningMessage = null
		this.outgoingMessages = []
		this._rewards = []
		this.nextAction = null
		this.retweeted = []

		// this.maxMSE = beliefs.reduce((acc, curr) =>
		// 	acc + Math.pow(-(1 / beliefs.length), 2), 0) / beliefs.length

		this.cycleInterval = Math.round(Math.random() * maxCyclesInMemory)

		// this.agent = new RL.DQNAgent(this, {
	 //    update: 'qlearn',
	 //    gamma: 0.9, // discount factor, [0, 1)
	 //    epsilon: 0.2, // initial epsilon for epsilon-greedy policy, [0, 1)
	 //    alpha: 0.01, // value function learning rate
	 //    experience_add_every: 10, // number of time steps before we add another experience to replay memory
	 //    experience_size: 5000, // size of experience replay memory
	 //    learning_steps_per_iteration: 20,
	 //    tderror_clamp: 1.0, // for robustness
	 //    num_hidden_units: 100 // number of neurons in hidden layer
	 //  })
	}

	set followedBy(newFollowedBy) { this._followedBy = newFollowedBy }

	get followedBy() { return this._followedBy }

	set following(newFollowing) { this._following = newFollowing }

	get following() { return this._following }

	set lastFollowing(newLastFollowing) { this._lastFollowing = newLastFollowing }

	get lastFollowing() { return this._lastFollowing }

	getNumStates() { return beliefs.length }

	getMaxNumActions() { return beliefs.length }

	getState() {
		let counts = beliefs.reduce((acc, curr) => {
			acc[curr] = 0
			return acc
		}, {})

		for(let i=0; i<this._following.length; i++) {
			counts[this._following[i].belief]++
		}

		const sum = values(counts).reduce((acc, curr) => acc + curr, 0)

		if(sum > 0) {
			return (sum - counts[this.belief]) / sum
		}
		return 0
	}

	getReward() { // total reach
		if(this.learningMessage && this.learningMessage[1] >= maxCyclesInMemory) {
			return messageState.getMessageReach(this.learningMessage[0])
		}
		return null
	}

	getDiversity() {
		const mse = this.getState().reduce((acc, curr) =>
			acc + Math.pow(((curr / Math.max(EPS, this._following.length)) - (1 / beliefs.length)), 2), 0) / beliefs.length // means squared error

		return 1 - (mse / this.maxMSE)
	}

	getMessage() {
		this.outgoingMessages = []

		const originalTweet = this.getOriginalTweet()
		const retweet = this.getRetweet()

		if(originalTweet) {
			this.learningMessage = [originalTweet.id, 0]
			this.outgoingMessages.push(originalTweet)
		}

		if(retweet) {
			this.outgoingMessages.push(retweet)
		}

		return this.outgoingMessages
	}

	getOriginalTweet() {
		if(messageState.cycleIndex % maxCyclesInMemory === this.cycleInterval) {
			return {
				user: this.id, id: uuid.v4(),
				orientation: this.belief,
				retweet: null				
			}
		}
		return null
	}

	getRetweet() {
		let message = null
		if(this.lastReceivedMessages.length) {
			const diversity = this.getDiversity()

			const messageBreakdown = beliefs.reduce((acc, curr) => {
				acc[curr] = {
					messages: [],
					count: 0,
					threshold: 0
				}

				return acc
			}, {})

			const keys = Object.keys(messageBreakdown)

			for(let i=0; i<this.lastReceivedMessages.length; i++) {
				let message = this.lastReceivedMessages[i]
				messageBreakdown[message.orientation].messages.push(message)
				messageBreakdown[message.orientation].count++
			}

			keys.forEach(k => {
				if(k !== this.belief) {
					messageBreakdown[k].count *= diversity
				}
			})

			const modifiedTotal = keys.reduce((acc, curr) => acc + messageBreakdown[curr].count, 0)

			if(modifiedTotal > 0) { // could be 0 if you have a perfectly homogeneous environment but you don't agree with anyone in it 
				keys.forEach(k => {
					messageBreakdown[k].threshold = messageBreakdown[k].count / modifiedTotal
				})

				let sampledBelief = Math.random(), cumulativeThreshold = 0
				for(let i=0; i<keys.length; i++) {
					cumulativeThreshold += messageBreakdown[keys[i]].threshold
					if(sampledBelief < cumulativeThreshold) {
						sampledBelief = keys[i]
						break
					}
				}

				const notYetRetweeted = []
				for(let i=0; i<messageBreakdown[sampledBelief].messages.length; i++) {
					let message = messageBreakdown[sampledBelief].messages[i]
					if(this.retweeted.indexOf(message.id) === -1) {
						notYetRetweeted.push(message)
					}
				}

				if(notYetRetweeted.length) {
					const { id, user, orientation } = sampleArray(notYetRetweeted)

					message = {
						user: this.id, id: uuid.v4(),
						orientation,
						retweet: { id, user }						
					}

					this.retweeted.push(id)					
				}
			}
		}
		return message
	}

	sendMessages(messages) {
		this.lastReceivedMessages = []
		for(let i=0; i<messages.length; i++) {
			if(this._following.find(d => d.id === messages[i].user)) {
				this.lastReceivedMessages.push(messages[i])
			}
		}
	}

	cycle() {
		if(this.learningMessage) {
			this.learningMessage[1] = this.learningMessage[1] + 1
		}
	}

	adjustFollowing() {
		const state = this.getState()
		if(state > this.desiredDiversity) return

		if(this._following.length > minFolloweeSize) {
			const choppingBlock = []
			for(let i=0; i<this._following.length; i++) {
				let followee = this._following[i]
				if(followee.belief === this.belief) {
					choppingBlock.push(followee.id)
				}
			}
			this._following.splice(
				this._following.findIndex(d => d.id === sampleArray(choppingBlock)), 1)
		}

		const otherBeliefs = beliefs.filter(b => b !== this.belief)
		const newBelief = sampleArray(otherBeliefs)
		const newAction = beliefs.findIndex(b => b === newBelief)
		const followingIDs = this._following.map(n => n.id)

		const followingMyFollowees = []
		for(let i=0; i<this._following.length; i++) {
			const following = this._following[i].following
			for(let j=0; j<following.length; j++) {
				const id = following[j].id
				if(followingMyFollowees.indexOf(id) === -1) {
					followingMyFollowees.push(id)
				}
			}
		}
		
		const availableFollowees = Nodes.filter(n =>
			n.belief === beliefs[newAction] && followingIDs.indexOf(n.id) === -1 && followingMyFollowees.indexOf(n.id) > -1)

		if(availableFollowees.length) {
			this._following.push(sampleArray(availableFollowees))
		}
	}

	init() {
		bindAll(this, [ "cycle", "getMessage", "sendMessages", "adjustFollowing" ])
	}
}

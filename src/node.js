import helpers from './helpers/helpers'
const { flatten, sampleArray, createDictByProp, bindAll } = helpers
import { values } from 'underscore'
import { Nodes } from './nodes'
import { maxCyclesInMemory, minFolloweeSize } from './config'
import messageState from './messageState'

const EPS = 0.00001

export default class Node {
	constructor(opts) {
		this.id = opts.id
		this.beliefs = opts.beliefs
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

		this.cycleInterval = Math.round(Math.random() * maxCyclesInMemory)
	}

	set followedBy(newFollowedBy) { this._followedBy = newFollowedBy }

	get followedBy() { return this._followedBy }

	set following(newFollowing) { this._following = newFollowing }

	get following() { return this._following }

	set lastFollowing(newLastFollowing) { this._lastFollowing = newLastFollowing }

	get lastFollowing() { return this._lastFollowing }

	getState() {
		let counts = this.beliefs.reduce((acc, curr) => {
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
			acc + Math.pow(((curr / Math.max(EPS, this._following.length)) - (1 / this.beliefs.length)), 2), 0) / this.beliefs.length // means squared error

		return 1 - (mse / this.maxMSE)
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

		const otherBeliefs = this.beliefs.filter(b => b !== this.belief)
		const newBelief = sampleArray(otherBeliefs)
		const newAction = this.beliefs.findIndex(b => b === newBelief)
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
			n.belief === this.beliefs[newAction] && followingIDs.indexOf(n.id) === -1 && followingMyFollowees.indexOf(n.id) > -1)

		if(availableFollowees.length) {
			this._following.push(sampleArray(availableFollowees))
		}
	}

	init() {
		bindAll(this, [ "cycle", "adjustFollowing" ])
	}
}

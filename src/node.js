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
		this.desiredDiversity = opts.desiredDiversity || 0
		this.diversityOverride = null

		this._newlyFollowing = []
		this._newlyNotFollowing = []
		this._following = []
		this._initialFollowing = []
		this._lastFollowing = []
		this._followedBy = []
		this.lastReceivedMessages = []
		this.learningMessage = null
		this.outgoingMessages = []
		this._rewards = []
		this.nextAction = null
		this.retweeted = []
	}

	set followedBy(newFollowedBy) { this._followedBy = newFollowedBy }

	get followedBy() { return this._followedBy }

	set following(newFollowing) { this._following = newFollowing }

	get following() { return this._following }

	set lastFollowing(newLastFollowing) { this._lastFollowing = newLastFollowing }

	get lastFollowing() { return this._lastFollowing }

	getSimilarityOfInitialAndCurrFollowingSets(){

		let intersectionSet = new Set()
	    let unionSet = new Set()
	    for(let i = 0; i < this.initialFollowing.length; i++){
	    	unionSet.add(this.initialFollowing[i].id)
	      if(this.lastFollowing.indexOf(this.initialFollowing[i]) > -1){
	        intersectionSet.add(this.initialFollowing[i].id)
	      }
	    }

	    for(let i = 0; i < this.lastFollowing.length; i++){
	    	unionSet.add(this.lastFollowing[i].id)
	    }

	    return [intersectionSet.size, unionSet.size]
	}

	setDiversity() {
		let counts = this.beliefs.reduce((acc, curr) => {
			acc[curr] = 0
			return acc
		}, {})

		for(let i=0; i<this._following.length; i++) {
			counts[this._following[i].belief]++
		}

		const sum = values(counts).reduce((acc, curr) => acc + curr, 0)

		if(sum > 0) {
			this.diversity = (sum - counts[this.belief]) / sum
		} else {
			this.diversity = 0
		}
	}

	getReward() { // total reach
		if(this.learningMessage && this.learningMessage[1] >= maxCyclesInMemory) {
			return messageState.getMessageReach(this.learningMessage[0])
		}
		return null
	}

	cycle() {
		if(this.learningMessage) {
			this.learningMessage[1] = this.learningMessage[1] + 1
		}
	}

	adjustFollowing() {
		this.setDiversity()
		const target = this.diversityOverride === null ? this.desiredDiversity : this.diversityOverride

		if(this.diversity > target) return

		if(this._following.length > minFolloweeSize && this.maintainConnectionsNumber !== false) {
			const choppingBlock = []
			for(let i=0; i<this._following.length; i++) {
				let followee = this._following[i]
				if(followee.belief === this.belief) {
					choppingBlock.push(followee.id)
				}
			}
			
			const unfollowIndex = this._following.findIndex(d => d.id === sampleArray(choppingBlock))

			if(unfollowIndex > -1) {
				if(this.considerFollowsMutual) {
					for(let i=0; i<Nodes.length; i++) {
						let node = Nodes[i]
						if(node.id === this.following[unfollowIndex].id) {
							let matchingIndex = node.following.map(f => f.id).indexOf(this.id)
							if(matchingIndex > -1) {
								node.following.splice(matchingIndex, 1)
							}
							break
						}
					}					
				}

				this._following.splice(unfollowIndex, 1)				
			}
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
				if(this.allowThirdDegree) {
					const nestedFollowing = following[j].following
					for(let k=0; k<nestedFollowing.length; k++) {
						const nestedID = nestedFollowing[k].id
						if(followingMyFollowees.indexOf(nestedID) === -1) {
							followingMyFollowees.push(nestedID)
						}
					}					
				}
			}
		}

		const availableFollowees = Nodes.filter(n =>
			n.belief === this.beliefs[newAction] && 
			followingIDs.indexOf(n.id) === -1 && 
			(this.allowOutsideNetwork ? true : followingMyFollowees.indexOf(n.id) > -1))

		if(availableFollowees.length) {
			const newFollowee = sampleArray(availableFollowees)
			this._following.push(newFollowee)

			if(this.considerFollowsMutual) {
				if(newFollowee.following.map(n => n.id).indexOf(this.id) === -1) {
					newFollowee.following = newFollowee.following.concat(this)
				}				
			}
		}
	}

	init() {
		bindAll(this, [ "cycle", "adjustFollowing" ])
	}
}

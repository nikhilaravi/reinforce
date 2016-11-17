import helpers from './helpers/helpers'
const { flatten, sampleArray, createDictByProp, bindAll } = helpers
import { values } from 'underscore'
import { Nodes, getReach } from './nodes'

const cyclesInMemory = 3

export default class Node {
	constructor(opts) {
		this.id = opts.id
		this.username = opts.username
		this.belief = opts.belief
		this.trumporhillary = opts.trumporhillary
		this.civility = Math.random() // Random civility level

		this._following = []
		this._followingNodes = []
		this._lastFollowing = []
		this._followedBy = []
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

	set followedBy(newFollowedBy) { this._followedBy = newFollowedBy }

	get followedBy() { return this._followedBy }

	set following(newFollowing) { this._following = newFollowing }

	get following() { return this._following }

	set lastFollowing(newLastFollowing) { this._lastFollowing = newLastFollowing }

	get lastFollowing() { return this._lastFollowing }

	getNumStates() { 
		return this._followingNodes.length * 2 
	}

	getMaxNumActions() {

		return 4
	}

	getState() { // evolve state here

		// Initialization
		if (!this.currState){
			this.currState = []
			for (let i = 0; i < this._followingNodes.length * 2; i += 2){
				this.currState.push(0)
			}
		}

		for (let i = 0; i < this._followingNodes.length * 2; i += 2){

			let currNeighbor = this._followingNodes[i/2]

			this.currState[i] = currNeighbor.civility
			this.currState[i+1] = currNeighbor.trumporhillary
		}

		return this.currState
	}

	getReward() {

		let civility = []
		let diversity = []

		for (let i = 0; i < this._following.length * 2; i += 2){
			
			civility.push(this.currState[i])
			diversity.push(this.currState[i+1])

		}

		civility = 1 - Math.abs(this.civility - helpers.mean(civility))
		diversity = 1 - Math.abs(0.5 - helpers.mean(diversity))

		let reward = civility + diversity

		if (this.id === 0) {
			console.log(reward)
		}

		return reward
	}

	chooseActions() {

		// First, decide which node we would stop following if we were to stop

		if (this.nextAction == 0){
			this.civility = Math.min(this.civility + 0.05, 1)
			this.trumporhillary = 1 - this.trumporhillary
		}

		if (this.nextAction == 1){
			this.civility = Math.max(this.civility - 0.05, 0)
			this.trumporhillary = 1 - this.trumporhillary
		}

		if (this.nextAction == 2){
			this.civility = Math.min(this.civility + 0.05, 1)
			console.log('HIHIHI')
		}

		if (this.nextAction == 3){
			this.civility = Math.max(this.civility - 0.05, 0)
		}

		// OLD CODE from random simulation
		// let orientation = "", retweetID = null

		// if(this.nextAction === 1) { 
		// 	orientation = this.belief 
		// 	if(Math.random() < 0.5) {
		// 		const matchingMessages = this.memory.reduce(flatten)
		// 			.filter(msg => msg.orientation === this.belief)

		// 		if(matchingMessages.length) {
		// 			retweetID = sampleArray(matchingMessages).id
		// 		}
		// 	}
		// }
		
		// return {
		// 	orientation, retweetID, user: this.id
		// }	
	}

	// sendMessages(messages) {
	// 	if(this.memory.length > cyclesInMemory) { this.memory.shift() }

	// 	const filteredMessages = []
	// 	for(let i=0; i<messages.length; i++) {
	// 		if(this._following.indexOf(messages[i].user) > -1) {
	// 			filteredMessages.push(messages[i])
	// 		}
	// 	}

	// 	this.memory.push(filteredMessages)
	// }

	setNextAction() {
		const state = this.getState(),
			action = this.agent.act(state),
			r = this.getReward()

		this.agent.learn(r)

		this.nextAction = action
	}

	adjustFollowing() {

		// Find the node we have the least and most shared neighbors with
		let worstScoringNodeIndex = -1
		let worstScoringNode = null
		let worstScore = 1000

		let bestScoringNodeIndex = -1
		let bestScoringNode = null
		let bestScore = 0

		for (let i = 0; i < this._followingNodes.length; i++){
			
			let currNeighbor = this._followingNodes[i]
			let currScore = 0

			for (let j = 0; j < currNeighbor._followingNodes.length; j++){

				// Compute shared number of neighbors
				if (this._following.indexOf(currNeighbor._followingNodes[j].id) != -1){
					currScore += 1
				}

			}

			// Compute fraction of neighbors also shared by neighbor
			currScore /= parseFloat(this._followingNodes.length)

			if (currScore < worstScore){
				worstScore = currScore
				worstScoringNode = currNeighbor
				worstScoringNodeIndex = i
			}

			if (currScore > bestScore){
				bestScore = currScore
				bestScoringNode = currNeighbor
				bestScoringNodeIndex = i
			}
		}

		// Select the first neighbor of our highest-scoring neighbor that isn't also our neighbor
		let newNeighbor = null
		for (let i = 0; i < bestScoringNode._followingNodes.length; i++){
			if (this._following.indexOf(bestScoringNode._followingNodes[i].id) == -1 && bestScoringNode._followingNodes[i].id != this.id){
				newNeighbor = bestScoringNode._followingNodes[i]
			}
		}

		if (newNeighbor){

			// If there is a non-shared neighbor, replace 
			let followingIndex = this._following.indexOf(worstScoringNode.id)
			this._following[followingIndex] = newNeighbor.id
			this._followingNodes[worstScoringNodeIndex] = newNeighbor
		}

		// const byBeliefs = createDictByProp(this.memory.reduce(flatten), 'orientation'),
		// 	agreementCount = byBeliefs[this.belief] ? byBeliefs[this.belief].length : 0.0001,
		// 	strongCounterOrientation = Object.keys(byBeliefs)
		// 		.filter(d => d !== this.belief && !!d)
		// 		.map(k => byBeliefs[k] )
		// 		.find(d => d.length / agreementCount > 1.5)

		// this._lastFollowing = this._following.slice()

		// if(strongCounterOrientation) {
		// 	// change your belief to match the strong counter orientation
		// 	this.belief = strongCounterOrientation[0].orientation

		// 	// now follow someone randomly from the strong counter orientation group
		// 	const availableFollowees = Nodes.filter(n =>
		// 		n.belief === this.belief && !this._following.includes(n.id))
		// 	if(availableFollowees.length) {
		// 		this._following.push(sampleArray(availableFollowees).id)
		// 	}
		// }

		// // unfollow anyone who has been political for the last 3 rounds
		// if(values(byBeliefs).length) {
		// 	const messagesByUser = createDictByProp(values(byBeliefs).reduce(flatten), 'user'),
		// 		overpoliticalUsers = Object.keys(messagesByUser)
		// 			.filter(k => messagesByUser[k].length === cyclesInMemory)

		// 	if(overpoliticalUsers.length) {
		// 		this._following.splice(
		// 			this._following.findIndex(d => d === sampleArray(overpoliticalUsers)), 1)
		// 	}
		// }

		this.setNextAction()
	}

	init() {
		// bindAll(this, [ "getMessage", "sendMessages", "adjustFollowing" ])
		bindAll(this, [ "chooseActions", "adjustFollowing" ])
	}
}

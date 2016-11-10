import helpers from './helpers/helpers'
const { flatten, sampleArray, createDictByProp, bindAll } = helpers
import { values } from 'underscore'
import { Nodes, getReach, getNodeForId } from './nodes'

const cyclesInMemory = 3

export default class Node {
	constructor(opts) {
		this.id = opts.id
		this.username = opts.username
		this.belief = opts.byBeliefs

		this._following = []
		this._trustScores = []
		this.lastTweet = null

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
		let neighborIdeologies = []
		this._following.forEach(n => {
			let currIdeology
			if(n.lastTweet)
				currIdeology = n.lastTweet.orientation
			else
				currIdeology = n.belief

			neighborIdeologies.push(currIdeology)
		})

		return neighborIdeologies
	}

	getReward() {
		// Cycle through neighbors and compute trusted retweet score
		let trustRetweetScore = 0
		this._trustScores.forEach(d => {
			if(d.node.lastTweet.retweet && d.node.lastTweet.retweet.id == this.id){
				trustRetweetScore += d.score
			}
		})
		console.log(trustRetweetScore)
		return trustRetweetScore
	}

	sampleMention(probs) {
		let ind = helpers.sampleArrayWeighted(probs)
		return this._trustScores[ind].node
	}

	getProbsArray() {
		let probs = []
		let cumSum = 0
		this._trustScores.forEach(d => {
			cumSum += d.score
			probs.push(cumSum)
		})

		return probs
	}

	getOrientation(selectedNeighbor) {

		let orientation = ""

		if (selectedNeighbor.lastTweet)
			orientation = selectedNeighbor.lastTweet.orientation
		else
			orientation = this.belief

		return orientation
	}

	getMessage() {

		// Sample the orientation of this tweet from the beliefs of neighbors, weighted by trust

		let probs = this.getProbsArray()

		let ind = helpers.sampleArrayWeighted(probs)
		let selectedNeighbor = this._trustScores[ind].node

		// console.log(JSON.stringify(selectedNeighbor))

		let orientation = this.getOrientation(selectedNeighbor)

		this.lastTweet = {"retweet":null, "orientation": orientation, "mention":null}

		// Actions:
		// 0 => New tweet and mention
		// 1 => New tweet and no mention
		// 2 => Retweet and mention
		// 3 => Retweet and no mention
		if(this.nextAction === 0) {

			// With 50% probability, mention the same person that the person you are retweeting mentioned
			// With the other 50% probability,
			if (selectedNeighbor.lastTweet.mention){
				if(Math.random() < 0.5) {
					this.lastTweet.mention = selectedNeighbor.lastTweet.mention
				}
				else{
					this.lastTweet.mention = this.sampleMention(probs)
				}
			}

			else{
					this.lastTweet.mention = this.sampleMention(probs)
			}
		}
		
		else if(this.nextAction === 1) { 
			// Do nothing - lastTweet is already configured to handle this
		}

		else if(this.nextAction === 2) { 

			this.lastTweet.retweet = selectedNeighbor
			this.lastTweet.orientation = this.getOrientation(selectedNeighbor)

			// With 50% probability, mention the same person that the person you are retweeting mentioned
			// With the other 50% probability,
			if (selectedNeighbor.lastTweet.mention){
				if(Math.random() < 0.5) {
					this.lastTweet.mention = selectedNeighbor.lastTweet.mention
				}
				else{
					this.lastTweet.mention = this.sampleMention(probs)
				}
			}

			else{
					this.lastTweet.mention = this.sampleMention(probs)
			}
		}

		else {
			this.lastTweet.retweet = selectedNeighbor
			this.lastTweet.orientation = this.getOrientation(selectedNeighbor)
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
		
		// Randomly sample a new person to follow based on one of the mentions 

		let probs = this.getProbsArray()

		let ind = helpers.sampleArrayWeighted(probs)
		let selectedNeighbor = this._trustScores[ind]

		let lastMentionedByNeighbor = selectedNeighbor.node.lastTweet.mention

		if (lastMentionedByNeighbor) {

			// Sort array so we know which node to stop following
			this._trustScores.sort(function (a, b) {
			  if (a.score > b.score) {
			    return 1;
			  }
			  if (a.score < b.score) {
			    return -1;
			  }
			  return 0;
			});

			// Compute a new trust score - i.e., average of trust for sampled neighbor and lowest-trusted person
			let newScore = (this._trustScores[0].score + selectedNeighbor.score) / 2.0
			
			// Stop following the person you currently trust the least and start following new person
			for(let i = 0; i < this._trustScores.length; i++){
				if (this._following[i].id === this._trustScores[i].node.id) {
					this._following.splice(i, 1)
					break
				}
			}
			this._following.push(lastMentionedByNeighbor)

			this._trustScores.shift()
			this._trustScores.push({"node":lastMentionedByNeighbor, "score":newScore})

			// Re-normalize trust scores
			let totalTrust = 0
			this._trustScores.forEach(d => {
				totalTrust += d.score
			})

			totalTrust = parseFloat(totalTrust)
			let updatedTrustScores = []
			this._trustScores.forEach(d => {
				updatedTrustScores.push({"node": d.node, "score": d.score / totalTrust})
			})

			this._trustScores = updatedTrustScores
		}

		this.setNextAction()
	}

	init() {
		bindAll(this, [ "getMessage", "sendMessages", "adjustFollowing" ])
	}

	initFollowerNodes() {

		let followingNodes = []
		this._following.forEach(n => {
			let node = getNodeForId(n)
			followingNodes.push(node)
		})
		this._following = followingNodes
	}

	// Randomly assign trust scores for each node
	// TODO(nabeel): initialize trust based on number of shared connections 
	initializeTrustScores() {

		let totalTrust = 0;
		let trustVals = [];
		this._following.forEach(n => {
			let thisTrustScore = Math.random() * this._following.length
			trustVals.push({"nodeId":n, "score":thisTrustScore})
			totalTrust += thisTrustScore
		})

		totalTrust = parseFloat(totalTrust)

		if (totalTrust == 0)
			totalTrust = 1

		trustVals.forEach(trustData => {
			this._trustScores.push({"node":trustData.nodeId, "score":trustData.score/totalTrust})
		})

	}
}

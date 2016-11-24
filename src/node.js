import helpers from './helpers/helpers'
const { flatten, sampleArray, createDictByProp, bindAll } = helpers
import { values } from 'underscore'
import { Nodes, getReach } from './nodes'

// optimising for knowlegde in the network
// STATE -> state of the wrold, its local topology, the distribution of messages of each orientation intis followers and followees, the nodes current propensity to be exposed to new content
// state - space - local network (array of nodes and beliefs of all followers and another array of followees) - so the state dimension is 2 (2, 2 dim arrays)
// ACTION - function of state - one of {retweet something against own belief, retweet something with the same belief, follow someone with a different belief, follow someone with the same belief, change propensity to be exposed to new ideas}
// each action affects one of the elements of the state either either directly or through the reward function i.e. following a new person changes the newtork topolgy,
// retweeting someone changes their page rank, changing propensity to new ideas changes the probabiity of retweeting/following someime with the new


// reward - distribution of beliefs in the newtork.

// add epsilon for action selection - avoid greedy q learning - select action with some element of randomness in initial learning period
// decay epsilon over time to reduce exploration

// questions
// do nodes converge to the same policy
// how long does it take to converge to an optimum polict


// ideas
// update the global state representation - to record the path of a message over time.

// how to model how deep a message travels in the network

// network routing - the q value of each state action pair is the value of the 	time taken to transmit a packet bound for node d by way of the curren't node's neighbour y (time spent in queue)
// - i.e. time reaminig for packet to reach destination

//


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

	getNumStates() { return 1 }

	getMaxNumActions() {
		// 6 different actions
		// follow same belief, follow different belief, retweet same belief, retweet different belief, increase propensity, decrease propensity, do nothing
		// maybe start by not including propensity and then introducing this later.
		return 5
	}

	getState() { // evolve state here
		// updatee this to be just the beliefs
		return [this._followedBy, this._following, this.trumporhillary]
		// update this to two arrays of objects of this.following and this.follwed_by and their corresponding beliefs and a number between 0 and 1 which is the node's current propensity for diverse info
	}

	getDiversityScore(belief_distribution) {
		var keys = Object.keys(belief_distribution)
		var belief_counts = keys.reduce((acc, curr, index) => {
			acc[curr] = belief_distribution[curr].length
			return acc
		}, [0,0])
		// console.log('BELIEF distribution', belief_counts)
		var mean_followers_per_belief = belief_counts.reduce(function(a, b) { return a + b; })/belief_counts.length;
		var difference_from_mean = belief_counts.map(count => Math.pow((count-mean_followers_per_belief),2));
		var sum_sqrt_distance = Math.pow((difference_from_mean.reduce(function(a, b) { return a + b; })),0.5);
		return 1/sum_sqrt_distance
	}

	getReward() { // total reach
		// 5 belief states 0, 1, 2, 3, 4

		// reward based distribution of beliefs in the list of people you are following
		// - change in the distribution of people in the network - if equal to unequal, negative reward
		// unequal to more equal, more positive reward.
		let reward
		var belief_distribution = createDictByProp(this._following, 'belief');
		var diversity_score = this.getDiversityScore(belief_distribution)
		reward = diversity_score
		if (this._lastFollowing !== undefined){
			var previous_belief_distribution = createDictByProp(this._lastFollowing, 'belief');
			var previous_diversity_score = this.getDiversityScore(previous_belief_distribution)
			reward = diversity_score - previous_diversity_score
		}
		return 5000*reward
	}

	// in each cycle a node will either remain silent or retweet a message


	// rename this to sample next state - figure out how the state will change based on the selected action - update this.following/this.followers
	// the effect of the action is also affected by the propensity to be exposed to new ideas.
	// if action is to update propensity increase by random amount? or proportional to current propensity

	findAvailableFollowees(belief, same) {
		var following_IDs = this._following.map(n => n.id)
		let availableFolloweesWithBelief
		if (same) {
			availableFolloweesWithBelief = Nodes.filter(n =>
				n.trumporhillary === belief && !following_IDs.includes(n.id))
		} else {
			availableFolloweesWithBelief = Nodes.filter(n =>
				n.trumporhillary !== belief && !following_IDs.includes(n.id))
		}
		return availableFolloweesWithBelief
	}

	followNewNode(belief, same) {
		// belief is a number 0 or 1, same is either True or False

		this._lastFollowing = this._following.slice()

		var availableFolloweesWithBelief = this.findAvailableFollowees(belief, same)

		if (availableFolloweesWithBelief.length) {
			var newFollowee = sampleArray(availableFolloweesWithBelief)
			var newNodeObj = {id: newFollowee.id, belief: newFollowee.trumporhillary}
			this._following.push(newNodeObj)
		}
	}

	unfollowNode(belief, same) {
		this._lastFollowing = this._following.slice()
		var following_IDs = this._following.map(n => n.id)
		var availableFolloweesWithBelief = this.findAvailableFollowees(belief, same)

		if (availableFolloweesWithBelief.length) {
			var nodeToUnFollow = sampleArray(availableFolloweesWithBelief)
			var nodeIndex = following_IDs.findIndex(d => d === nodeToUnFollow.id)
			this._following.splice(nodeIndex, 1)
		}
	}

	sampleNextState(action) {

		// belief is defined to be either trump or hilary
		if(action === 0) {
			// follow a new node with the same belief
			this.followNewNode(this.trumporhillary, true)
		}
		else if(action === 1) {
			// follow a new node with a different belief
			this.followNewNode(this.trumporhillary, false)
		}
		else if(action === 2) {
			// unfollow a node with the same belief
			this.unfollowNode(this.trumporhillary, true)
		}
		else if(action === 3) {
			// unfollow a node with a different belief
			this.unfollowNode(this.trumporhillary, false)
		}
		else if(action === 4) {
			// change it's belief
			if (this.trumporhillary === 1) {
				this.trumporhillary = 0
			} else {
				this.trumporhillary = 1
			}
		}
		else if(action === 5) {
			// do nothing
			console.log('Doing nothing')
		}
		// calcualte next state and reward based on the action taken from the current state
		var reward = this.getReward()
		this._rewards.push(reward)
		if (this.id === 12) {
			console.log('NODE', this.id, 'belief', this.trumporhillary, 'action', action, 'Reward', reward)
		}
		var nextStateAndReward = {nextState: this.getState(), r: reward}
		return nextStateAndReward;

    // // if not retweet action then no message is sent
		// let orientation = "", retweetID = null
		//
		// if(this.nextAction === 1) {
		// 	orientation = this.belief
		//
    //   // with 0.5 probability randomly select a tweet from one of the people the node is following with the same orientation as the node
    //   // retweet the message
		//
		// 	if(Math.random() < 0.5) {
		// 		const matchingMessages = this.memory.reduce(flatten)
		// 			.filter(msg => msg.orientation === this.belief)
		//
    //     // if a message of the correct orientation is found retweet it
		// 		if(matchingMessages.length) {
		// 			retweetID = sampleArray(matchingMessages).id
		// 		}
		// 	}
		// }
		//
		// return {
		// 	orientation, retweetID, user: this.id
		// }
	}

	// invoked with the messages of all the modes in the network in the current cycle
	recieveMessages(messages) {

    // update the memory
		if(this.memory.length > cyclesInMemory) { this.memory.shift() }

		const filteredMessages = []

    // iterate through all the messages from all the nodes in the network
		for(let i=0; i<messages.length; i++) {
      // filter the messages for the messages of all the nodes followed by the current node
			if(this._following.indexOf(messages[i].user) > -1) {
				filteredMessages.push(messages[i])
			}
		}

    // save the array of messages of the nodes followed by the current node in the current cycle
		this.memory.push(filteredMessages)
	}

	setNextAction() {

		const state = this.getState(),
			action = this.agent.act(state), // the action is a number in the range(getMaxNumActions())
			obs = this.sampleNextState(action), // determines the next state based on the current state and action - observes the reward from taking this action
			reward = obs.r

    // instruct the agent to learn based on the current reward
		this.agent.learn(reward)
	}

  // update followers of a node
	adjustFollowing() {

    // create a dictionary of the beliefs of all the nodes followed by the current node
    // the belief is determined from the messages from the past three cycles

    // the number of messages in agreement with this node and the n
		const byBeliefs = createDictByProp(this.memory.reduce(flatten), 'orientation'),
			agreementCount = byBeliefs[this.belief] ? byBeliefs[this.belief].length : 0.0001,
			strongCounterOrientation = Object.keys(byBeliefs)
				.filter(d => d !== this.belief && !!d) // filter for counter beliefs (but don't count undeclared beliefs (i.e. empty string))
				.map(k => byBeliefs[k] ) // return arrays of messages with the counter belief
				.find(d => d.length / agreementCount > 1.5) // check the ratio of agreement to disagreement in the node's immediate following connections

    // the ratio of agreementCount to disagreementCount could be interesting to plot
    // console.log('beliefs', byBeliefs, agreementCount, strongCounterOrientation)

    // update lastFollowing to the current following list
		this._lastFollowing = this._following.slice()
		var following_IDs = this._following.map(n => n.id)

		if(strongCounterOrientation) {
			// if enough people disaggree - change your belief to match the strong counter orientation
			this.belief = strongCounterOrientation[0].orientation
			// now follow someone randomly from the strong counter orientation group
			const availableFollowees = Nodes.filter(n =>
				n.belief === this.belief && !following_IDs.includes(n.id))
			if(availableFollowees.length) {
				var newFollowee = sampleArray(availableFollowees)
				var newNodeObj = {id: newFollowee.id, belief: newFollowee.trumporhillary}
				this._following.push(newNodeObj)
			}
		}

		// unfollow anyone who has been political for the last 3 rounds
		if(values(byBeliefs).length) {
			const messagesByUser = createDictByProp(values(byBeliefs).reduce(flatten), 'user'),
				overpoliticalUsers = Object.keys(messagesByUser)
					.filter(k => messagesByUser[k].length === cyclesInMemory)

			if(overpoliticalUsers.length) {
				this._following.splice(
					following_IDs.findIndex(d => d === sampleArray(overpoliticalUsers)), 1)
			}
		}

    // initiate the next cycle of the agent's behaviour
		this.setNextAction()
	}

	init() {
		bindAll(this, [ "sampleNextState", "recieveMessages", "adjustFollowing" , "findAvailableFollowees", "unfollowNode", "followNewNode", "getReward"])
	}
}

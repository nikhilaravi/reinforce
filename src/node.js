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

		this._following = []
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

	getNumStates() { return 1 }

	getMaxNumActions() { return 2 }

	getState() { // evolve state here
		return [ Math.random() ]
	}

	getReward() { // total reach
		return getReach(this)
	}

	// in each cycle a node will either remain silent or retweet a message
	getMessage() {
    // if not retweet action then no message is sent
		let orientation = "", retweetID = null

		if(this.nextAction === 1) {
			orientation = this.belief

      // with 0.5 probability randomly select a tweet from one of the people the node is following with the same orientation as the node
      // retweet the message

			if(Math.random() < 0.5) {
				const matchingMessages = this.memory.reduce(flatten)
					.filter(msg => msg.orientation === this.belief)

        // if a message of the correct orientation is found retweet it
				if(matchingMessages.length) {
					retweetID = sampleArray(matchingMessages).id
				}
			}
		}

		return {
			orientation, retweetID, user: this.id
		}
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

    // the state is a random number between 0 and 1
    // the action is a number in the range(getMaxNumActions())
		const state = this.getState(),
			action = this.agent.act(state),
			r = this.getReward()

    // instruct the agent to learn based on the current reward
		this.agent.learn(r)

		this.nextAction = action
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
    console.log('beliefs', byBeliefs, agreementCount, strongCounterOrientation)

    // update lastFollowing to the current following list
		this._lastFollowing = this._following.slice()

		if(strongCounterOrientation) {
			// if enough people disaggree - change your belief to match the strong counter orientation
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

    // initiate the next cycle of the agent's behaviour
		this.setNextAction()
	}

	init() {
		bindAll(this, [ "getMessage", "sendMessages", "adjustFollowing" ])
	}
}

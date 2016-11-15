import helpers from './helpers/helpers'
const { sampleArray } = helpers
import { beliefs } from './config'
import Node from './node'
import { users } from './fixedData'
import { scaleLinear } from 'd3-scale'
import mediator from './mediator'
import { difference } from 'underscore'

// array of node objects
export let Nodes

export const getReach = node => {
	return Math.random()
}

// input - an array of node objects from the sample dat
export const initializeNodes = seedData => {
	// create an instance of the node class for each node
	Nodes = seedData.map((d, i) =>
		new Node({
			belief: sampleArray(beliefs),
			id: d.node_id,
			index: i,
			username: i,
			trumporhillary: d.trumporhillary
		}))
}

// creates a dictionary with keys as node ids and values as arrays of ids of all its follower nodes
// the dictionary is used to update each node's followedBy property

export const initializeFollowings = () => {
	// each object references another object
	// key: node.id
	// value: array of objects
	const record = {}

	for(let i=0; i<Nodes.length; i++) {
		let node = Nodes[i]

		if(typeof record[node.id] === 'undefined') {
			record[node.id] = []
		}

		for(let j=0; j<node.following.length; j++) {
			let target = node.following[j]
			if(typeof record[target] === 'undefined') {
				record[target] = []
			}
			// belief is one of conservative, liberal, green,
			var nodeObj = {id: node.id, belief: node.belief}
			record[target].push(nodeObj)
		}
	}

// update each node object with the array of its follower node ids
	for(let i=0; i<Nodes.length; i++) {
		Nodes[i].followedBy = record[Nodes[i].id]
		// updateMinMaxFollowedBy(Nodes[i].followedBy.length)
	}
}

// keep track of the min/max follower lengths when updating
const updateMinMaxFollowedBy = length => {
	if(length > maxFollowedByLength) {
		maxFollowedByLength = length
	}
	if(length < minFollowedByLength) {
		minFollowedByLength = length

	}
}

//
export const setFollowedBy = node => {
	// update the followers of a node by comparing to the previous iteration of followers
	const toRemove = difference(node.lastFollowing, node.following),
		toAdd = difference(node.following, node.lastFollowing)

	// iterate through the nodes to unfollow
	for(let i=0; i<toRemove.length; i++) {

		// find the node to unfollow from the global node list
		let match = Nodes.find(d => d.id === toRemove[i])

		// find the index of the given node from the node to unfollow's followedBy list
		let index = match.followedBy.map(n => n.id).indexOf(node.id)

		// update the followedBy list of the node to unfollow to remove the given node
		match.followedBy = match.followedBy.slice(0, index).concat(match.followedBy.slice(index + 1))

		// update the minimum and maximum lengths
		updateMinMaxFollowedBy(match.followedBy.length)

	}

	// iterate through the new nodes to follow
	for(let i=0; i<toAdd.length; i++) {

		// find the node to follow
		let match = Nodes.find(d => d.id === toAdd[i])

		// add the given node to the list of followers of the new node
		var newFollower = {id: node.id, belief: node.belief}
		match.followedBy = match.followedBy.concat(newFollower)

		//update the min max follower length
		updateMinMaxFollowedBy(match.followedBy.length)

	}
}

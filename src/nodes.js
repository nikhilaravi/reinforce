import helpers from './helpers/helpers'
const { sampleArray } = helpers
import { beliefs } from './config'
import Node from './node'
import { users } from './fixedData'
import { scaleLinear } from 'd3-scale'
import mediator from './mediator'
import { difference } from 'underscore'

export let Nodes

export let maxFollowedByLength = 0

export let minFollowedByLength = Infinity

export const getReach = node => {
	return Math.random()
}

export const initializeNodes = seedData => {
	Nodes = seedData.map((d, i) =>
		new Node({
			belief: sampleArray(beliefs),
			id: d.node_id,
			username: i
		}))
}

export const initializeFollowings = () => {
	const record = {}

	for(let i=0; i<Nodes.length; i++) {
		let node = Nodes[i]
		for(let j=0; j<node.following.length; j++) {
			let target = node.following[j]
			if(typeof record[target] === 'undefined') {
				record[target] = []
			}
			record[target].push(node.id)
		}
	}

	for(let i=0; i<Nodes.length; i++) {
		Nodes[i].followedBy = record[Nodes[i].id]
		updateMinMaxFollowedBy(Nodes[i].followedBy.length)
	}
}

const updateMinMaxFollowedBy = length => {
	if(length > maxFollowedByLength) {
		maxFollowedByLength = length
	}
	if(length < minFollowedByLength) {
		minFollowedByLength = length
	}
}

export const setFollowedBy = node => {
	const toRemove = difference(node.lastFollowing, node.following), 
		toAdd = difference(node.following, node.lastFollowing)

	for(let i=0; i<toRemove.length; i++) {
		let match = Nodes[toRemove[i]]
		match.followedBy = match.followedBy.splice(match.followedBy.indexOf(node.id), 1)
		updateMinMaxFollowedBy(match.followedBy.length)
	}

	for(let i=0; i<toAdd.length; i++) {
		let match = Nodes[toAdd[i]]
		match.followedBy = match.followedBy.concat(node.id)
		updateMinMaxFollowedBy(match.followedBy.length)
	}
}

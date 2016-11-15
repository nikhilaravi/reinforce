import helpers from './helpers/helpers'
const { sampleArray } = helpers
import { beliefs } from './config'
import Node from './node'
import { users } from './fixedData'
import { scaleLinear } from 'd3-scale'
import mediator from './mediator'
import { difference } from 'underscore'

export let Nodes

export const getReach = node => {
	return Math.random()
}

export const initializeNodes = seedData => {
	Nodes = seedData.map((d, i) =>
		new Node({
			belief: sampleArray(beliefs),
			id: d.node_id,
			index: i,
			username: i,
			trumporhillary: d.trumporhillary
		}))
}

export const initializeFollowings = () => {
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
			record[target].push(node.id)
		}
	}

	for(let i=0; i<Nodes.length; i++) {
		Nodes[i].followedBy = record[Nodes[i].id]
	}
}

export const setFollowedBy = node => {
	const toRemove = difference(node.lastFollowing, node.following), 
		toAdd = difference(node.following, node.lastFollowing)

	for(let i=0; i<toRemove.length; i++) {
		let match = Nodes.find(d => d.id === toRemove[i])
		let index = match.followedBy.indexOf(node.id)
		match.followedBy = match.followedBy.slice(0, index).concat(match.followedBy.slice(index + 1))
	}

	for(let i=0; i<toAdd.length; i++) {
		let match = Nodes.find(d => d.id === toAdd[i])
		match.followedBy = match.followedBy.concat(node.id)
	}
}

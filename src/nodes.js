import helpers from './helpers/helpers'
const { sampleArray } = helpers
import Node from './node'
import { users } from './fixedData'
import { scaleLinear } from 'd3-scale'
import mediator from './mediator'
import { difference, debounce } from 'underscore'

export let newConnectionsCounts = []
export let brokenConnectionsCounts = []
export let Nodes

export const initializeNodes = (seedData, beliefs) => {
	Nodes = seedData.map((d, i) => {
		let belief = d.trumporhillary
		if(belief === 0) {
			belief = beliefs[0]
		} else if(belief === 1 || belief === 2 || belief === 5) {
			belief = beliefs[1]
		} else {
			belief = beliefs[2]
		}

		return new Node({
			belief,
			beliefs,
			id: d.node_id,
			index: i,
			username: i
		})
	})
}

export const cycle = () => {
	if(newConnectionsCounts.length > 3 && newConnectionsCounts[newConnectionsCounts.length - 1] === 0 && newConnectionsCounts[newConnectionsCounts.length - 2] === 0) {
		mediator.publish("converged")
	}
	newConnectionsCounts.push(0)
	brokenConnectionsCounts.push(0)
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
	const toRemove = [], toAdd = []

	// checking if ones currently being followed were followed previously - if not then they need to be added
	for(let i=0; i<node.following.length; i++) {
		let wasFollowing = false
		let thisNode = node.following[i]
		for(let j=0; j<node.lastFollowing.length; j++) {
			if(node.lastFollowing[j].id === thisNode.id) {
				wasFollowing = true
				break
			}
		}

		if(!wasFollowing) {
			toAdd.push(thisNode)
		}
	}

	// checking if ones followed previously are still being followed -  if not then they need to be removed
	for(let i=0; i<node.lastFollowing.length; i++) {
		let isFollowing = false
		let thisNode = node.lastFollowing[i]
		for(let j=0; j<node.following.length; j++) {
			if(node.following[j].id === thisNode.id) {
				isFollowing = true
				break
			}
		}

		if(!isFollowing) {
			toRemove.push(thisNode)
		}
	}

	// update followedBy list for nodes no longer being followed
	for(let i=0; i<toRemove.length; i++) {
		let match = Nodes.find(d => d.id === toRemove[i].id)
		let index = match.followedBy.indexOf(node.id)
		match.followedBy = match.followedBy.slice(0, index).concat(match.followedBy.slice(index + 1))
	}

	// add to followedBy list for nodes newly followed
	for(let i=0; i<toAdd.length; i++) {
		let match = Nodes.find(d => d.id === toAdd[i].id)
		match.followedBy = match.followedBy.concat(node.id)
	}

	node.newlyFollowing = toAdd
	node.newlyNotFollowing = toRemove
	if(toAdd.length !== node.following.length) {
		newConnectionsCounts[newConnectionsCounts.length - 1] += toAdd.length
		brokenConnectionsCounts[brokenConnectionsCounts.length - 1] += toRemove.length
	}

	if(toAdd.length || toRemove.length) {
		node.lastFollowing = node.following.slice()
	}
}

setTimeout(() => {
	mediator.subscribe("selectDataset", () => {
		Nodes = []
		newConnectionsCounts = []
		brokenConnectionsCounts = []
	})
}, 0)

const updateDiversity = val => {
	Nodes.forEach(n => {
		n.desiredDiversity = val
	})
}

mediator.subscribe("updateDiversity", debounce(updateDiversity, 100))

mediator.subscribe("editFriends", d => {
	Nodes.forEach(n => {
		n.allowOutsideNetwork = d
	})
})

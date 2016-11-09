import helpers from './helpers/helpers'
const { sampleArray } = helpers
import { beliefs } from './config'
import Node from './node'
import { users } from './fixedData'
import { scaleLinear } from 'd3-scale'
import mediator from './mediator'

export const initializeNodes = seedData => {
	Nodes = seedData.map((d, i) =>
		new Node({
			belief: sampleArray(beliefs),
			id: i,
			username: i
		}))
}

export let Nodes

export const getReach = node => {
	return Math.random()
}
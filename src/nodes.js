import helpers from './helpers/helpers'
const { sampleArray } = helpers
import { beliefs } from './config'
import Node from './node'
import { users } from './fixedData'
import PageRank from 'pagerank-js'
import { scaleLinear } from 'd3-scale'
import mediator from './mediator'

// PageRank params
const linkProb = 0.85 //high numbers are more stable
const tolerance = 0.0001 //sensitivity for accuracy of convergence. 

const rewardScale = scaleLinear().range([-2, 1])

let rank = []

mediator.subscribe("newMessages", data => {
	PageRank(Nodes.map(n => n.following), linkProb, tolerance, (err, res) => {
		rewardScale.domain([
			Math.min(...res), Math.max(...res)
		])

		rank = res.map(rewardScale)
	})
})

export const Nodes = users.map((username, i) =>
  new Node({
    belief: sampleArray(beliefs),
    id: i,
    username 
  }))

export const getReach = node => {
	// assuming everyone retweets, how many people would be reached?
	return rank[node.id]
}
import helpers from './helpers/helpers'
const { sampleArray } = helpers
import { beliefs } from './config'
import Node from './node'
import { users } from './fixedData'

export const Nodes = users.map((username, i) =>
  new Node({
    belief: sampleArray(beliefs),
    id: (i + 1),
    username 
  }))

export const getReach = node => {
	return Math.random()
}
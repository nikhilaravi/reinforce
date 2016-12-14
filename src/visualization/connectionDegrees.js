import { scaleLinear, scaleLog } from 'd3-scale'
import { line, curveCardinal } from 'd3-shape'
import { select } from 'd3-selection'
import VisualizationBase from './visualizationBase'
import helpers from '../helpers/helpers'
const { dictToArray } = helpers

export class FollowerDegrees extends VisualizationBase {
  constructor(svg, width, height, testName) {
		super(svg, width, height, testName)
    this.history = []
  }
  update(Nodes) {
    var follower_counts_dict = dictToArray(create_count_dict(Nodes, 'followedBy'), true) // an array of arrays of the form [[num_followers, num_nodes], [num_followers, num_nodes]] etc
    this.history.push(follower_counts_dict)
  }
  clear() {
    this.history = []
  }
}

export class FollowingDegrees extends VisualizationBase {
  constructor(svg, width, height, testName) {
		super(svg, width, height, testName)
    this.history = []
  }
  update(Nodes) {
    var following_counts_dict = dictToArray(create_count_dict(Nodes, 'following'), true) // an array of arrays of the form [[num_following, num_nodes], [num_following, num_nodes]] etc
    this.history.push(follower_counts_dict)
  }
  clear() {
    this.history = []
  }
}

function create_count_dict(Nodes, prop) {
  return Nodes.reduce((dict, node) => {
    var followers = node[prop].length;
    if (dict.hasOwnProperty(followers)) {
      dict[followers] += 1
    } else {
      dict[followers] = 1
    }
    return dict
  }, {})
}

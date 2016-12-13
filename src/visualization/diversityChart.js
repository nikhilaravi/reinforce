import { scaleLinear, scaleLog } from 'd3-scale'
import { line, curveCardinal } from 'd3-shape'
import { select } from 'd3-selection'
import VisualizationBase from './visualizationBase'
import helpers from '../helpers/helpers'
const { dictToArray } = helpers

export class DiversityHistogram extends VisualizationBase {
  constructor(svg, width, height, testName) {
		super(svg, width, height, testName)
    
    this.start = []
    this.current = []
  }

  setup() {

  }

  update(Nodes) {
    var diversity_distribution = dictToArray(calculateDistribution(Nodes, 'diversity'), true)
    // diversity_distribution is an array of arrays of the form: [[diversity_score, num_nodes], [diversity_score, num_nodes], [diversity_score, num_nodes]]
    // the scores are in random order i.e. not in order of increasing/decreasing scores

    if(!this.start.length) {
      this.start = diversity_distribution
    }

    this.current = diversity_distribution
  }

  clear() {
    this.start = []
    this.current = []
  }
}

export class BeliefBarChart extends VisualizationBase {
  constructor(svg, width, height, testName) {
		super(svg, width, height, testName)
    this.history = []
  }
  update(Nodes) {
    var diversity_counts = dictToArray(calculateDistribution(Nodes, 'belief'))
    // diversity_counts is an array of arrays of the form: [['conservative', num_nodes], ['liberal', num_nodes]] etc for the different beliefs in the network
    this.history.push(diversity_counts)
  }
  clear() {
    this.history = []
  }
}

// create dict based on a property of the node
function calculateDistribution(Nodes, prop) {
  return Nodes.reduce((dict, node) => {
    var belief = node[prop];
    if (dict.hasOwnProperty(belief)) {
      dict[belief] += 1
    } else {
      dict[belief] = 1
    }
    return dict
  }, {})
}

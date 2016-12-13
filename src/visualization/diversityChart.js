import { scaleLinear, scaleLog } from 'd3-scale'
import { line, curveCardinal } from 'd3-shape'
import { select } from 'd3-selection'
import { range } from 'd3-array'
import VisualizationBase from './visualizationBase'
import helpers from '../helpers/helpers'
const { dictToArray } = helpers
import { initialDiversity, currentDiversity } from '../nodes'

export class DiversityHistogram extends VisualizationBase {
  constructor(svg, width, height, testName) {
		super(svg, width, height, testName)

    this.xIncrements = 20

    this.xScale = scaleLinear()
      .domain([0, 1])
      .range([0, width])
  }

  setup() {
    super.setup()

    this.xAxis.attr("y1", this.height).attr("y2", this.height)

    const xAxisLabels = this.xAxisLabelsGroup.selectAll("text")
      .data(range(this.xIncrements).map((d, i) => i * (1/this.xIncrements)).concat(1))

    xAxisLabels.enter().append("text").text(d => d.toFixed(2))
      .attr("x", this.xScale)
      .attr("y", this.height + 10)
  }

  update(Nodes) {
    // diversity_distribution is an array of arrays of the form: [[diversity_score, num_nodes], [diversity_score, num_nodes], [diversity_score, num_nodes]]
    // the scores are in random order i.e. not in order of increasing/decreasing scores

    console.log(initialDiversity, currentDiversity)
  }

  clear() {

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



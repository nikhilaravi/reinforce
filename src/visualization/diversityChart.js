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

    this.xIncrements = 10

    this.yScale = scaleLinear()
      .domain([0, 100]) // should dynamically update
      .range([0, height])
      .clamp(true)

    this.xScale = scaleLinear()
      .domain([0, 1])
      .range([0, width])

    this.lineGenerator = line()
      .x(d => this.xScale(+d[0]))
      .y(d => this.height - this.yScale(d[1]))
  }

  setup() {
    super.setup()

    this.xAxis.attr("y1", this.height).attr("y2", this.height)

    const xAxisLabels = this.xAxisLabelsGroup.selectAll("text")
      .data(range(this.xIncrements).map((d, i) => i * (1/this.xIncrements)).concat(1))

    xAxisLabels.enter().append("text").text(d => d.toFixed(2))
      .attr("x", this.xScale)
      .attr("y", this.height + 10)

    this.initialDiversityPath = this.svg.append("path").attr("class", "initial")

    this.currentDiversityPath = this.svg.append("path").attr("class", "current")
  }

  update(Nodes) {
    // diversity_distribution is an array of arrays of the form: [[diversity_score, num_nodes], [diversity_score, num_nodes], [diversity_score, num_nodes]]

    const initialDiversityArray = dictToArray(initialDiversity)
    const currentDiversityArray = dictToArray(currentDiversity)
    const yMax = Math.max(...initialDiversityArray.map(d => d[1]).concat(currentDiversityArray.map(d => d[1])))

    this.yScale.domain([0, yMax])

    this.yAxisMax.text(yMax)

    this.initialDiversityPath.data([ initialDiversityArray ])
      .attr("d", d => {
        return `${this.lineGenerator(d)} L${this.width},${this.height} L0,${this.height}Z`
      })

    this.currentDiversityPath.data([ currentDiversityArray ])
      .attr("d", this.lineGenerator)
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



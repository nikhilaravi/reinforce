import { scaleLinear, scaleLog } from 'd3-scale'
import { line, curveCardinal } from 'd3-shape'
import { select } from 'd3-selection'
import { range } from 'd3-array'
import VisualizationBase from './visualizationBase'
import helpers from '../helpers/helpers'
const { dictToArray } = helpers
import { initialFollowerDegrees, currentFollowerDegrees } from '../nodes'

export class FollowerDegrees extends VisualizationBase {
  constructor(svg, width, height, testName) {
		super(svg, width, height, testName)
    this.history = []

    this.xIncrements = 10

    this.yScale = scaleLinear()
      .domain([0, 100]) // should dynamically update
      .range([0, height])
      .clamp(true)

    this.xScale = scaleLinear()
      .domain([0, 1])
      .range([0, width])
      .clamp(true)

    this.lineGenerator = line()
      .x(d => this.xScale(isNaN(d[0]) ? 0 : +d[0]))
      .y(d => this.height - this.yScale(d[1]))
  }

  setup() {
    super.setup()

    this.xAxis.attr("y1", this.height).attr("y2", this.height)

    this.initialFollowerDegreesPath = this.svg.append("path").attr("class", "initial")

    this.currentFollowerDegreesPath = this.svg.append("path").attr("class", "current")
  }

  update(Nodes) {
    const initialFollowerDegreesArray = dictToArray(initialFollowerDegrees)
    const currentFollowerDegreesArray = dictToArray(currentFollowerDegrees)

    const yMax = Math.max(...initialFollowerDegreesArray.map(d => d[1]).concat(currentFollowerDegreesArray.map(d => d[1])))

    const xMax = Math.max(...initialFollowerDegreesArray.map(d => d[0]).concat(currentFollowerDegreesArray.map(d => d[0])))

    this.yScale.domain([0, yMax])
    this.xScale.domain([0, xMax])

    this.yAxisMax.text(yMax)

    this.initialFollowerDegreesPath.data([ initialFollowerDegreesArray ])
      .attr("d", d => {
        return `${this.lineGenerator(d)} L${this.xScale(initialFollowerDegreesArray[initialFollowerDegreesArray.length - 1][0])},${this.height} L0,${this.height}Z`
      })

    this.currentFollowerDegreesPath.data([ currentFollowerDegreesArray ])
      .attr("d", this.lineGenerator)

    const xAxisLabels = this.xAxisLabelsGroup.selectAll("text")
      .data(currentFollowerDegreesArray)

    xAxisLabels.exit().remove()

    xAxisLabels.enter().append("text")
    
    xAxisLabels.text(d => d[0])
      .attr("x", d => this.xScale(d[0]))
      .attr("y", this.height + 10)
  }
}

// export class FollowingDegrees extends VisualizationBase {
//   constructor(svg, width, height, testName) {
// 		super(svg, width, height, testName)
//     this.history = []
//   }
//   update(Nodes) {
//     var following_counts_dict = dictToArray(create_count_dict(Nodes, 'following'), true) // an array of arrays of the form [[num_following, num_nodes], [num_following, num_nodes]] etc
//     this.history.push(follower_counts_dict)
//   }
//   clear() {
//     this.history = []
//   }
// }

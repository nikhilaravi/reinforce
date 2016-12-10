import { scaleLinear, scaleLog } from 'd3-scale'
import { line, curveCardinal } from 'd3-shape'
import { select } from 'd3-selection'
import { newConnectionsCounts, brokenConnectionsCounts } from '../nodes'

import VisualizationBase from './visualizationBase'

class ConvergenceTimeseries extends VisualizationBase {
	constructor(svg, width, height) {
		super(svg, width, height)

		this.xScale = scaleLinear()
			.domain([0, Math.round(width / 15)])
			.range([0, width])

		this.yScale = scaleLinear()
			.domain([0, 100]) // this should be some reasonable estimate, and it needs to update as the chart draws itself
			.range([0, height / 2])
			.clamp(true)

		this.addedLineGenerator = line()
			.x((d, i) => this.xScale(i))
			.y(d => this.height / 2 - this.yScale(d))

		this.removedLineGenerator = line()
			.x((d, i) => this.xScale(i))
			.y(d => this.height / 2 + this.yScale(d))

		this.setup()
	}

	setup() {
		this.xAxis = this.svg.append("line")
		this.xAxis.attr("x1", 0)
			.attr("x2", this.width)
			.attr("y1", this.height * 0.5)
			.attr("y2", this.height * 0.5)

		this.addedPath = this.svg.append("path").attr("class", "added")

		this.removedPath = this.svg.append("path").attr("class", "removed")
	}

	update() {
		this.yScale.domain([0, Math.max(newConnectionsCounts[0], brokenConnectionsCounts[0])])

		this.addedPath
			.data([ newConnectionsCounts ])
			.attr("d", this.addedLineGenerator)

		this.removedPath
			.data([ brokenConnectionsCounts ])
			.attr("d", this.removedLineGenerator)
	}
}

export default ConvergenceTimeseries
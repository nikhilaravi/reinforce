import { scaleLinear, scaleLog } from 'd3-scale'
import { line, curveCardinal } from 'd3-shape'
import { select } from 'd3-selection'
import { newConnectionsCounts, brokenConnectionsCounts } from '../nodes'

import VisualizationBase from './visualizationBase'

class ConvergenceTimeseries extends VisualizationBase {
	constructor(svg, width, height, testName) {
		super(svg, width, height, testName)

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
	}

	setup() {
		super.setup()

		this.yAxisMax.text("0 - New connections made")
		this.yAxisMin.text("0 - Old connections lost")

		this.addedPath = this.svg.append("path").attr("class", "added")

		this.removedPath = this.svg.append("path").attr("class", "removed")
	}

	update() {
		const maxVal = Math.max(newConnectionsCounts[0], brokenConnectionsCounts[0])

		if(isNaN(maxVal)) return

		super.update(newConnectionsCounts)

		this.yAxisMax.text(maxVal + " - New connections made")
		this.yAxisMin.text(maxVal + " - Old connections lost")

		this.yScale.domain([0, maxVal])

		this.addedPath
			.data([ newConnectionsCounts ])
			.attr("d", this.addedLineGenerator)

		this.removedPath
			.data([ brokenConnectionsCounts ])
			.attr("d", this.removedLineGenerator)
	}

	converged() {
		const rectSize = 15

		this.svg.insert("rect", ':first-child')
			.attr("class", "convergence-marker")
			.attr("x", () => this.xScale(newConnectionsCounts.length - 1) - rectSize / 2)
			.attr("y", this.height / 2 + rectSize)
			.attr("width", rectSize)
			.attr("height", 1)
	}
}

export default ConvergenceTimeseries

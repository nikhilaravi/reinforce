import { scaleLinear, scaleLog } from 'd3-scale'
import { line, curveCardinal } from 'd3-shape'
import { select } from 'd3-selection'
import { newConnectionsCounts, brokenConnectionsCounts } from '../nodes'

import VisualizationBase from './visualizationBase'

class ConvergenceTimeseries extends VisualizationBase {
	constructor(svg, width, height, testName) {
		super(svg, width, height, testName)

		this.xScale = scaleLinear()
			.domain([0, Math.round(width / 25)])
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
		this.svg.append("text").attr("class", "y-above-description")
			.text("New connections made").attr("x", 10).attr("y", 0)

		this.svg.append("text").attr("class", "y-above-description")
			.text("Old connections lost").attr("x", 10).attr("y", this.height)

		this.xAxis = this.svg.append("line")
		this.xAxis.attr("x1", 0)
			.attr("x2", this.width)
			.attr("y1", this.height * 0.5)
			.attr("y2", this.height * 0.5)

		this.yAxisMax = this.svg.append("text")
			.attr("class", "y-max-label")
			.attr("x", -5).attr("y", 0)

		this.yAxisMin = this.svg.append("text")
			.attr("class", "y-min-label")
			.attr("x", -5).attr("y", this.height)

		this.xAxisLabelsGroup = this.svg.append("g").attr('class', 'x-axis-labels')

		this.addedPath = this.svg.append("path").attr("class", "added")

		this.removedPath = this.svg.append("path").attr("class", "removed")
	}

	update() {
		const maxVal = Math.max(newConnectionsCounts[0], brokenConnectionsCounts[0])

		if(isNaN(maxVal)) return

		this.yAxisMax.text(maxVal)
		this.yAxisMin.text(maxVal)

		const xAxisLabels = this.xAxisLabelsGroup.selectAll("text")
			.data(newConnectionsCounts)

		xAxisLabels.enter().append("text")
		xAxisLabels.exit().remove()
		
		xAxisLabels.text((d, i) => i + 1)
			.attr("x", (d, i) => this.xScale(i + 1))
			.attr("y", this.height / 2)

		this.yScale.domain([0, maxVal])

		this.addedPath
			.data([ newConnectionsCounts ])
			.attr("d", this.addedLineGenerator)

		this.removedPath
			.data([ brokenConnectionsCounts ])
			.attr("d", this.removedLineGenerator)
	}
}

export default ConvergenceTimeseries
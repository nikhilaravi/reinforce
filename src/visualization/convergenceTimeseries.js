import { scaleLinear } from 'd3-scale'
import { line, curveCardinal } from 'd3-shape'
import { select } from 'd3-selection'

import VisualizationBase from './visualizationBase'

class ConvergenceTimeseries extends VisualizationBase {
	constructor(svg, width, height) {
		super()

		this.svg = svg
		this.width = width
		this.height = height

		this.xScale = scaleLinear()
			.domain([0, Math.round(width / 15)])
			.range([0, width])

		this.yScale = scaleLinear()
			.domain([0, 100]) // this should be some reasonable estimate, and it needs to update as the chart draws itself
			.range([0, height / 2])

		this.lineGenerator = line()
			.curve(curveCardinal)
			.x((d, i) => x(i))
			.y(d => height - this.yScale(d.count))

		this.setup()
	}

	setup() {
		this.xAxis = this.svg.append("line")
		this.xAxis.attr("x1", 0)
			.attr("x2", this.width)
			.attr("y1", this.height * (2/3))
			.attr("y2", this.height * (2/3))
	}

	update() {
		console.log("lol")


	}
}

export default ConvergenceTimeseries
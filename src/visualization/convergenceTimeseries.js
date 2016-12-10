import { scaleLinear } from 'd3-scale'
import { line, curveCardinal } from 'd3-shape'
import { select } from 'd3-selection'

import VisualizationBase from './visualizationBase'

class ConvergenceTimeseries extends VisualizationBase {
	constructor(svg, width, height) {
		super()

		console.log("constructing")
		this.xScale = scaleLinear()
			.range([0, width])
	}

	update() {
		console.log("lol")


	}
}

export default ConvergenceTimeseries
import VisualizationBase from './visualizationBase'

class ConvergenceTimeseries extends VisualizationBase {
	constructor(visDOM) {
		super()
		const svg = visDOM.select("svg")

		svg.attr("width", 1000).attr("height", 400)

		console.log("constructing")
	}
}

export default ConvergenceTimeseries
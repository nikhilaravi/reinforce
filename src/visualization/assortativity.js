import { scaleLinear, scaleLog } from 'd3-scale'
import { line, curveCardinal } from 'd3-shape'
import { select } from 'd3-selection'
import { assortativity } from '../nodes'
import VisualizationBase from './visualizationBase'

class AssortativityChart extends VisualizationBase {
	constructor(svg, width, height, testName) {
		super(svg, width, height, testName)

		this.yScale = scaleLinear()
			.domain([-1, 1]) // this should be some reasonable estimate, and it needs to update as the chart draws itself
			.range([0, height])
			.clamp(true)

		this.addedLineGenerator = line()
			.x((d, i) => this.xScale(i))
			.y(d => this.height - this.yScale(d))
	}

	setup() {
		super.setup()

		this.yAxisMax.text("1")
		this.yAxisMin.text("-1")

		this.addedPath = this.svg.append("path").attr("class", "added")
	}

	update(Nodes) {
		super.update(assortativity)

		this.addedPath
			.data([ assortativity ])
			.attr("d", this.addedLineGenerator)
	}

	converged() {
		const rectSize = 15

		this.svg.insert("rect", ':first-child')
			.attr("class", "convergence-marker")
			.attr("x", () => this.xScale(assortativity.length - 1) - rectSize / 2)
			.attr("y", this.height / 2 + rectSize)
			.attr("width", rectSize)
			.attr("height", 1)
	}
}

export default AssortativityChart

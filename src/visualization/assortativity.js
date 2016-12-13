import { scaleLinear, scaleLog } from 'd3-scale'
import { line, curveCardinal } from 'd3-shape'
import { select } from 'd3-selection'
import { assortativity } from '../nodes'
import VisualizationBase from './visualizationBase'

class AssortativityChart extends VisualizationBase {
	constructor(svg, width, height, testName) {
		super(svg, width, height, testName)
		this.xScale = scaleLinear()
			.domain([0, Math.round(width / 25)])
			.range([0, width])

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

		this.xAxis = this.svg.append("line")
		this.xAxis.attr("x1", 0)
			.attr("x2", this.width)
			.attr("y1", this.height * 0.5)
			.attr("y2", this.height * 0.5)

		this.yAxisMax = this.svg.append("text")
			.attr("class", "y-max-label")
			.attr("x", -5).attr("y", 0).text('1')

		this.yAxisMin = this.svg.append("text")
			.attr("class", "y-min-label")
			.attr("x", -5).attr("y", this.height).text('-1')

		this.addedPath = this.svg.append("path").attr("class", "added")

		this.xAxisLabelsGroup = this.svg.append("g").attr('class', 'x-axis-labels')
	}

	update(Nodes) {
		const xAxisLabels = this.xAxisLabelsGroup.selectAll("text")
			.data(assortativity)

		xAxisLabels.enter().append("text")
		xAxisLabels.exit().remove()

		xAxisLabels.text((d, i) => i + 1)
			.attr("x", (d, i) => this.xScale(i + 1))
			.attr("y", this.height / 2 + 10)

		this.addedPath
			.data([ assortativity ])
			.attr("d", (d,i) => {
				return this.addedLineGenerator(d,i)
			})
	}

	clear() {
		this.svg.node().innerHTML = ""
		this.history = []
	}

	converged() {
		const rectSize = 15

		this.svg.insert("rect", ':first-child')
			.attr("class", "convergence-marker")
			.attr("x", () => this.xScale(this.history.length - 1) - rectSize / 2)
			.attr("y", this.height / 2 + rectSize)
			.attr("width", rectSize)
			.attr("height", 1)
	}
}

export default AssortativityChart

import { scaleLinear, scaleLog } from 'd3-scale'

class Visualization {
  constructor(svg, width, height, testName) {
  	this.svg = svg
  	this.width = width
  	this.height = height
  	this.testName = testName

  	this.xScale = scaleLinear()
  		.domain([0, Math.round(width / 25)])
  		.range([0, width])
  }

  setup() {
  	this.svg.attr("data-test-name", this.testName)

  	this.xAxis = this.svg.append("line")
  	this.xAxis.attr("x1", 0)
  		.attr("x2", this.width)
  		.attr("y1", this.height * 0.5)
  		.attr("y2", this.height * 0.5)

  	this.yAxisMax = this.svg.append("text")
  		.attr("class", "y-max-label")
  		.attr("x", 0).attr("y", 0)

  	this.yAxisMin = this.svg.append("text")
  		.attr("class", "y-min-label")
  		.attr("x", 0).attr("y", this.height)

  	this.xAxisLabelsGroup = this.svg.append("g").attr('class', 'x-axis-labels')
  }

  update(arr) {
  	const xAxisLabels = this.xAxisLabelsGroup.selectAll("text")
  		.data(arr.slice(0, arr.length - 1))

  	xAxisLabels.exit().remove()

  	xAxisLabels.enter().append("text").text((d, i) => i + 1)
  		.attr("x", (d, i) => this.xScale(i + 1))
  		.attr("y", this.height / 2 + 10)

  	this.svg.attr("width", Math.max(this.width, this.xScale(arr.length)))

  	this.xAxis.attr("x2", Math.max(this.width, this.xScale(arr.length)))
  }

  clear() {
  	this.svg.node().innerHTML = ""
  }
}

export default Visualization
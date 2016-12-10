class Visualization {
  constructor(svg, width, height, testName) {
  	this.svg = svg
  	this.width = width
  	this.height = height

  	this.svg.attr("data-test-name", testName)
  }
}

export default Visualization
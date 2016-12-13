class Visualization {
  constructor(svg, width, height, testName) {
  	this.svg = svg
  	this.width = width
  	this.height = height
  	this.testName = testName
  }

  setup() {
  	this.svg.attr("data-test-name", this.testName)
  }
}

export default Visualization
import { scaleLinear, scaleLog } from 'd3-scale'
import { line, curveCardinal } from 'd3-shape'
import { select } from 'd3-selection'
import uniq from 'uniq'
import VisualizationBase from './visualizationBase'

class AssortativityChart extends VisualizationBase {
	constructor(svg, width, height, testName) {
		super(svg, width, height, testName)
		this.history = []
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
		this.history.push(calculateAssortativity(Nodes))

		const xAxisLabels = this.xAxisLabelsGroup.selectAll("text")
			.data(this.history)

		xAxisLabels.enter().append("text")
		xAxisLabels.exit().remove()

		xAxisLabels.text((d, i) => i + 1)
			.attr("x", (d, i) => this.xScale(i + 1))
			.attr("y", this.height / 2 + 10)

		this.addedPath
			.data([this.history])
			.attr("d", (d,i) => {
				return this.addedLineGenerator(d,i)
			})
	}

	clear() {
		this.svg.node().innerHTML = ""
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

function calculateAssortativity(Nodes) {

		// unique types
		var types = uniq(Nodes.map(n => n.belief))
		// fraction of edges that connect a vertex of type i to another of type j
		var n_types = types.length
		var e_ij = []

		// use to calcualte the fraction
		var total_edges = Nodes.reduce((sum, n) => { sum += n.following.length; return sum }, 0);

		// iterate through the types
		for (var i=0; i<n_types; i++) {
			var type_i = types[i];
			var nodes_type_i = Nodes.filter(n => n.belief === type_i);
			// iterate through all other types
			e_ij.push([])
			for (var j=0; j<n_types; j++) {
				var type_j = types[j];
				var edges_type_j = 0;

				// iterate through all nodes of type i
				for (var n=0; n<nodes_type_i.length; n++) {

					// find all nodes being followed of the type_j
					var followings = nodes_type_i[n].following;
					var followings_type_j = followings.filter(n => n.belief === type_j);
					edges_type_j += followings_type_j.length;
				}

				e_ij[i][j] = edges_type_j/total_edges
			}
		}

		// a_i = sum out over all j
		var a_i = []
		for (var i=0; i<n_types; i++) {
			var a_i_j = e_ij[i].reduce((sum, elem) => {
				sum +=elem;
				return sum;
			}, 0);
			a_i.push(a_i_j)
		}

		// b_j sum out over all i
		var b_j = []
		for (var j=0; j<n_types; j++) {
			var b_j_i = 0
			for (var i=0; i<n_types; i++) {
				b_j_i += e_ij[i][j]
			}
			b_j.push(b_j_i)
		}

		var sum_e_ii = 0

		for (var i=0; i<n_types; i++) {
			sum_e_ii += e_ij[i][i]
		}

		var sum_prod_a_ij_b_ij= 0

		for (var i=0; i<n_types; i++) {
			sum_prod_a_ij_b_ij += a_i[i]*b_j[i]
		}

		// Positive values of r indicate a correlation between nodes of similar degree, while negative values indicate relationships between nodes of different degree
		var assortativity = (sum_e_ii - sum_prod_a_ij_b_ij)/(1-sum_prod_a_ij_b_ij)

		return assortativity
		// console.log('assortativity', assortativity)
}

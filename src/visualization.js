import { scaleLinear } from 'd3-scale'
import { line, curveCardinal } from 'd3-shape'
import { select } from 'd3-selection'
import { cycleDur, width, height } from './config'
import ConvergenceTimeseries from './visualization/convergenceTimeseries'
import mediator from './mediator'
import AssortativityChart from './visualization/assortativity.js'
import { DiversityHistogram, BeliefBarChart } from './visualization/diversityChart.js'
import { FollowerDegrees, FollowingDegrees } from './visualization/connectionDegrees.js'
import { Nodes } from './nodes.js'

const charts = { ConvergenceTimeseries, AssortativityChart, BeliefBarChart, DiversityHistogram, FollowerDegrees, FollowingDegrees }

let updateSID = null, activeChart = 'ConvergenceTimeseries'

const visDOM = select("#visualization")

const svg = visDOM.select("svg")

const svgWidth = svg.node().parentNode.getBoundingClientRect().width
const svgHeight = Math.min(height / 6, 200)
svg.attr("width", svgWidth).attr("height", svgHeight)

Object.keys(charts).forEach(c => {
	charts[c] = new charts[c](svg, svgWidth, svgHeight, c)
})

mediator.subscribe("selectDataset", () => {
	selectOption(activeChart)
	window.clearInterval(updateSID)
	svg.attr("data-converged", false)

	console.log('dataset selected initing chart')

	charts[activeChart].clear()
	charts[activeChart].setup()

	updateSID = setInterval(() => {
		charts[activeChart].update(Nodes)
	}, cycleDur)
})

mediator.subscribe("converged", () => {
	window.clearInterval(updateSID)
	charts[activeChart].converged()
	svg.attr("data-converged", true)
})

const selectOption = d => {
	console.log('selecting options', d)
	activeChart = d
	document.querySelector(".select-visualization .current").textContent = d

	Array.prototype.forEach.call(document.querySelectorAll(".select-visualization .option"), el => {
		el.classList.remove("active")
	});

	document.querySelector(".select-visualization [data-chart=" + d + "]").classList.add("active")
};

let dropdownOpen = false

const toggleDropdown = () => {
	if(dropdownOpen) {
		closeDropdown()
	} else {
		openDropdown()
	}
}

const closeDropdown = () => {
	dropdownOpen = false
	document.querySelector(".select-visualization").classList.remove("open")
}

const openDropdown = () => {
	dropdownOpen = true
	document.querySelector(".select-visualization").classList.add("open")
}

document.addEventListener("click", e => {
	if(e.target.closest(".select-visualization")) {

		// when an item in the dropdown is selected set the item
		selectOption(e.target.innerHTML)

		toggleDropdown()
		e.preventDefault()
		e.stopPropagation()
	} else {
		closeDropdown()
	}
})

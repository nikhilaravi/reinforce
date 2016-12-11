import { scaleLinear } from 'd3-scale'
import { line, curveCardinal } from 'd3-shape'
import { select } from 'd3-selection'
import { cycleDur, width, height } from './config'
import ConvergenceTimeseries from './visualization/convergenceTimeseries'
import mediator from './mediator'

const charts = {
	ConvergenceTimeseries
}

let updateSID = null

const activeChart = 'ConvergenceTimeseries'

const visDOM = select("#visualization")

const svg = visDOM.select("svg")

const svgWidth = svg.node().parentNode.getBoundingClientRect().width - 100
const svgHeight = Math.min(height / 6, 200)
svg.attr("width", svgWidth).attr("height", svgHeight)

Object.keys(charts).forEach(c => {
	charts[c] = new charts[c](svg, svgWidth, svgHeight, c)
})

mediator.subscribe("selectDataset", () => {
	window.clearInterval(updateSID)
	svg.attr("data-converged", false)
	
	charts[activeChart].clear()
	charts[activeChart].setup()

	updateSID = setInterval(() => {
		charts[activeChart].update()
	}, cycleDur)
})

mediator.subscribe("converged", () => {
	window.clearInterval(updateSID)
	charts[activeChart].converged()
	svg.attr("data-converged", true)
})

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
		toggleDropdown()
		e.preventDefault()
		e.stopPropagation()
	} else {
		closeDropdown()
	}
})
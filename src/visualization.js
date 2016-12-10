import { scaleLinear } from 'd3-scale'
import { line, curveCardinal } from 'd3-shape'
import { select } from 'd3-selection'
import { cycleDur } from './config'
import ConvergenceTimeseries from './visualization/convergenceTimeseries'

const charts = {
	ConvergenceTimeseries
}

const activeChart = 'ConvergenceTimeseries'

const visDOM = select("#visualization")

Object.keys(charts).forEach(c => {
	charts[c] = new charts[c](visDOM)
})

setInterval(() => {
	charts[activeChart].update()
}, cycleDur)

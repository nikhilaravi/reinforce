import ConvergenceTimeseries from './visualization/convergenceTimeseries'

import { scaleLinear } from 'd3-scale'
import { line, curveCardinal } from 'd3-shape'
import { select } from 'd3-selection'

const charts = {
	ConvergenceTimeseries
}

const visDOM = select("#visualization")

Object.keys(charts).forEach(c => {
	charts[c] = new charts[c](visDOM)
})

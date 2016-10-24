import helpers from './helpers/helpers'
import { beliefs } from './config'
import { scaleOrdinal, schemeCategory10 } from 'd3-scale'
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force'
import { select, selectAll, event } from 'd3-selection'
import { drag as d3drag } from 'd3-drag'

const nodes = [
  {"id": 1, "name": "server 1"},
  {"id": 2, "name": "server 2"},
  {"id": 3, "name": "server 3"},
  {"id": 4, "name": "server 4"},
  {"id": 5, "name": "server 5"},
  {"id": 6, "name": "server 6"},
  {"id": 7, "name": "server 7"},
  {"id": 8, "name": "server 8"},
  {"id": 9, "name": "server 9"}
]

const links = [
  {source: 1, target: 2},
  {source: 1, target: 3},
  {source: 1, target: 4},
  {source: 2, target: 5},
  {source: 2, target: 6},
  {source: 3, target: 7},
  {source: 5, target: 8},
  {source: 6, target: 9},
]

let node, link,
  index = 10,
  width = 960,
  height = 600

const svg = select("svg").attr("width", width)
  .attr("height", height)

const ticked = () => {
  link.attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y)

  node.attr("transform", d =>
    `translate(${d.x},${d.y})`)
}

const simulation = forceSimulation()
  .force("link", forceLink().id(d => d.id))
  .force("charge", forceManyBody())
  .force("center", forceCenter(width / 2, height / 2))
  .on("tick", ticked)

const dragStarted = d => {
  if(!event.active) {
    simulation.alphaTarget(0.3).restart()
  }
}

const dragged = d => {
  d.fx = event.x
  d.fy = event.y
}

const dragEnded = d => {
  if(!event.active) {
    simulation.alphaTarget(0)
  }
  d.fx = undefined
  d.fy = undefined
}

const click = d => {
  const target = { id: index, name: "server " + index }
  nodes.push(target)
  links.push({ source: d, target })
  index++
  update()
}

const drag = d3drag().on("start", dragStarted)
  .on("drag", dragged)
  .on("end", dragEnded)

const update = () => {
  link = svg.selectAll(".link").data(links, d => d.target.id)

  const linkEnter = link.enter().append("line")
    .attr("class", "link")

  link = linkEnter.merge(link)

  node = svg.selectAll(".node")
    .data(nodes, d => d.id)

  const nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .on("click", click)
    .call(drag)

  nodeEnter.append("circle").attr("r", 2.5)

  nodeEnter.append("title")
    .text(d => d.id)

  nodeEnter.append("text")
    .attr("dy", 3)
    .text(d => d.name)

  node = nodeEnter.merge(node)

  simulation.nodes(nodes)

  simulation.force("link").links(links)
}

update()

















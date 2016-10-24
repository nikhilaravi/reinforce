import helpers from './helpers/helpers'
import { beliefs } from './config'
import { scaleOrdinal, schemeCategory10 } from 'd3-scale'
import { forceSimulation } from 'd3-force'
import { select, selectAll } from 'd3-selection'

const addNode = id => {
  nodes.push({ id })
  update()
}

const removeNode = id => {
  let i = 0
  const n = findNode(id)
  while(i < links.length) {
    if((links[i]['source'] === n) || (links[i]['target'] === n)) {
      links.splice(i, 1)
    }
    else i++
  }
  nodes.splice(findNodeIndex(id), 1)
  update()
}

const removeLink = (source, target) => {
  for(let i=0; i<links.length; i++) {
    if(links[i].source.id === source && links[i].target.id === target) {
      links.splice(i, 1)
      break
    }
  }
  update()
}

const removeAllLinks = () => {
  links.splice(0, links.length)
  update()
}

const removeAllNodes = () => {
  nodes.splice(0, links.length)
  update()
}

const addLink = (source, target, value) => {
  links.push({
    source: findNode(source),
    target: findNode(target),
    value
  })
}

const findNode = id => nodes.find(d => d.id === id)

const findNodeIndex = id => nodes.findIndex(d => d.id === id)

const w = 960, h = 450

const color = scaleOrdinal(schemeCategory10)

const viz = select("body").append("svg:svg")
  .attr("width", w).attr("height", h)
  .attr("id", "svg")
  .append("svg:g")

const force = forceSimulation()

const nodes = force.nodes()
const links = force.links()

const update = () => {
  const vizLinks = viz.selectAll("line")
    .data(links, d => d.source.id + '-' + d.target.id)

  vizLinks.enter().append("line")
    .attr("id", d => d.source.id + '-' + d.target.id)
    .attr("stroke-width", d => d.value / 10)
    .attr("class", "link")

  vizLinks.append("title")
    .text(d => d.value)

  vizLinks.exit().remove()

  const vizNodes = viz.selectAll("g.node")
    .data(nodes, d => d.id)

  vizNodesEnter = vizNodes.enter().append("g")
    .attr("class", "node")
    .call(force.drag)

  vizNodesEnter.append("svg:circle")
    .attr("r", 12)
    .attr("id", d => "Node;" + d.id)
    .attr("class", "nodeStrokeClass")
    .attr("fill", d => color(d.id))

  vizNodesEnter.append("svg:text")
    .attr("class", "textClass")
    .attr("x", 14)
    .attr("y", ".31em")
    .text(d => d.id)

  vizNodes.exit().remove()

  force.on("tick", () => {
    vizNodes.attr("transform", d => `translate(${d.x},${d.y})`)

    vizLinks.attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y)

    force.gravity(.01)
      .chage(-8000)
      .friction(0)
      .linkDistance(d => d.value * 10)
      .size([w, h])
      .start()
  })

  update()
}

const drawGraph = () => {
  ['Sophia', 'Daniel', 'Ryan', 'Lila', 'Suzie', 'Riley', 'Grace', 'Dylan', 'Mason', 'Emma', 'Alex'].forEach(addNode)

  [['Alex', 'Ryan', '20'],
  ['Sophia', 'Ryan', '20'],
  ['Daniel', 'Ryan', '20'],
  ['Ryan', 'Lila', '30'],
  ['Lila', 'Suzie', '20'],
  ['Suzie', 'Riley', '10'],
  ['Suzie', 'Grace', '30'],
  ['Grace', 'Dylan', '10'],
  ['Dylan', 'Mason', '20'],
  ['Dylan', 'Emma', '20'],
  ['Emma', 'Mason', '10']].forEach(d => {
    addLink(...d)
  })
}

drawGraph()













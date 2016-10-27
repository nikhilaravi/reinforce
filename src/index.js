import helpers from './helpers/helpers'
import { beliefs } from './config'
import { users } from './fixedData'
import { scaleOrdinal, schemeCategory10 } from 'd3-scale'
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force'
import { select, selectAll, event } from 'd3-selection'
import { drag as d3drag } from 'd3-drag'
import { range } from 'd3-array'
import env from './test'
import NodeGenerator from './node'

import "../main.scss"

const nodes = users.map((username, i) =>
  new NodeGenerator({
    beliefs: beliefs[Math.random() * (beliefs.length - 1)],
    id: (i + 1),
    username
  }))

// let's say everyone starts out with between 1 and 5 connections

const randIndexGenerator = (exclude, length) => {
  const used = [ exclude ]
  return function() { // index pushed up by 1
    let next = 1 + Math.floor(Math.random() * length)
    while(used.find(d => d === next)) {
      next = 1 + Math.floor(Math.random() * length)
    }
    used.push(next)
    return next
  }
}

const links = nodes.map((d) => {
  const createIndex = randIndexGenerator(d.id, nodes.length)
  return range(1 + Math.round(Math.random() * 5)).map(() => {
    return {
      source: d.id,
      target: createIndex()
    }
  })
}).reduce(helpers.flatten)

let node, link,
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
  links.push({ source: d, target: nodes[10] })
  update()
}

const drag = d3drag().on("start", dragStarted)
  .on("drag", dragged)
  .on("end", dragEnded)

const update = () => {
  link = svg.selectAll(".link").data(links) // removed key function...

  const linkEnter = link.enter().append("line")
    .attr("class", "link")

  link = linkEnter.merge(link)

  node = svg.selectAll(".node")
    .data(nodes, (d, i) => i)

  const nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .on("click", click)
    .call(drag)

  nodeEnter.append("circle").attr("r", 2.5)

  nodeEnter.append("title")
    .text(d => d.id)

  nodeEnter.append("text")
    .attr("dy", 3)
    .text(d => d.username)

  node = nodeEnter.merge(node)

  simulation.nodes(nodes)

  simulation.force("link").links(links)
}

update()

nodes.forEach(n => n.init())















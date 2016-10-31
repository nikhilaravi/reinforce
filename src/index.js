import helpers from './helpers/helpers'
const { flatten, sampleArray } = helpers
import { scaleOrdinal, schemeCategory10 } from 'd3-scale'
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force'
import { select, selectAll, event } from 'd3-selection'
import { drag as d3drag } from 'd3-drag'
import { range } from 'd3-array'
import messageState from './messageState'
import "../main.scss"
import { Nodes } from './nodes'

const randIndexGenerator = (exclude, length) => {
  const used = [ exclude ]
  return function() { // index pushed up by 1
    let next = Math.floor(Math.random() * length)
    while(used.find(d => d === next)) {
      next = Math.floor(Math.random() * length)
    }
    used.push(next)
    return next
  }
}

// let's say everyone starts out with between 1 and 5 connections
let links = Nodes.map(d => {
  const createIndex = randIndexGenerator(d.id, Nodes.length)
  return range(1 + Math.round(Math.random() * 5)).map(() => ({
    source: d.id,
    target: createIndex()
  }))
}).reduce(flatten)

links.forEach(l => {
  const source = Nodes.find(n => n.id === l.source)
  const target = Nodes.find(n => n.id === l.target)
  source.following = source.following.concat(target.id)
})

let node, link, width = window.innerWidth, height = 600

const svg = select("svg").attr("width", width)
  .attr("height", height)

const ticked = () => {
  link.attr("x1", d => d.source.x)
    .attr("y1", d => d.source.y)
    .attr("x2", d => d.target.x)
    .attr("y2", d => d.target.y)

  node.attr("transform", d => `translate(${d.x},${d.y})`)
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

const drag = d3drag().on("start", dragStarted)
  .on("drag", dragged)
  .on("end", dragEnded)

const update = () => {
  link = svg.selectAll(".link").data(links) // removed key function...

  const linkEnter = link.enter().append("line")
    .attr("class", "link")

  link.exit().remove()

  link = linkEnter.merge(link)

  node = svg.selectAll(".node")
    .data(Nodes, (d, i) => i)

  const nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .call(drag)

  nodeEnter.append("circle").attr("r", 2.5)

  nodeEnter.append("title")
    .text(d => d.id)

  nodeEnter.append("text")
    .attr("dy", 3)
    .text(d => d.username)

  node = nodeEnter.merge(node)

  simulation.nodes(Nodes)

  simulation.force("link").links(links)
}

Nodes.forEach(n => n.init())

messageState.init()

let cycleSID = null

const cycleDur = 5000

messageState.cycle()

cycleSID = setInterval(messageState.cycle, cycleDur)

let updateLinksSID = null, updateLinksNodeIndex = 0

const updateLinks = () => {
  Nodes[updateLinksNodeIndex].adjustFollowing()

  links = Nodes.filter(n => n.following.length).map(n =>
    n.following.map(t => ({
      source: n,
      target: Nodes.find(d => d.id === t)
    }))).reduce(flatten)

  update()
  
  simulation.alphaTarget(0.3).restart() 

  updateLinksNodeIndex = (updateLinksNodeIndex + 1) % Nodes.length 
}

updateLinks()

updateLinksSID = setInterval(updateLinks, cycleDur / Nodes.length)



















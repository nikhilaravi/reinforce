import helpers from './helpers/helpers'
const { flatten, sampleArray } = helpers
import { scaleOrdinal, schemeCategory10 } from 'd3-scale'
import { forceSimulation, forceLink, forceManyBody, forceCenter } from 'd3-force'
import { select, selectAll, event } from 'd3-selection'
import { drag as d3drag } from 'd3-drag'
import { range } from 'd3-array'
import { timer } from 'd3-timer'
import messageState from './messageState'
import "../main.scss"
import { Nodes } from './nodes'

let renderer = new THREE.WebGLRenderer({ alpha: true }), 
  width = window.innerWidth, 
  height = 600,
  particles = Nodes.length,
  scene = new THREE.Scene(),
  camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 10000),
  nodePositions = new Float32Array(particles * 2),
  sizes = new Float32Array(particles),
  edgeGeometry = new THREE.BufferGeometry(),
  nodeGeometry = new THREE.BufferGeometry(),
  edgeVertices = new Float32Array(3 * Nodes.length * Nodes.length * 2), // not sure how to preallocate here...
  lastOccupiedEdgeVertexIndex

scene.add(camera)
camera.position.z = 1000

for(let i=0; i < particles; i++) { // todo: use meaningful size here
  sizes[i] = Math.random() * 10 + 3
}

const nodeMaterial = new THREE.ShaderMaterial({
  uniforms: {
    color: {
      type: 'c',
      value: new THREE.Color(0x3498db)
    },
    alpha: { type: 'f', value: 0.7 },
    pointSize: { type: 'f', value: 10 }
  },
  vertexShader: document.getElementById("node-vertexshader").textContent,
  fragmentShader: document.getElementById("node-fragmentshader").textContent,
  transparent: true
})

const edgeMaterial = new THREE.ShaderMaterial({
  uniforms: {
    color: {
      type: 'c',
      value: new THREE.Color(0x3498db)
    }
  },
  vertexShader: document.getElementById("edge-vertexshader").textContent,
  fragmentShader: document.getElementById("edge-fragmentshader").textContent,
  transparent: true
})

const nodePositionBuffer = new THREE.BufferAttribute(nodePositions, 2)

nodeGeometry.addAttribute("position", nodePositionBuffer)
nodeGeometry.addAttribute("size", new THREE.BufferAttribute(sizes, 1))

const edgeVerticesBuffer = new THREE.BufferAttribute(edgeVertices, 3)

edgeGeometry.addAttribute("position", edgeVerticesBuffer)

scene.add(new THREE.Points(nodeGeometry, nodeMaterial))
scene.add(new THREE.LineSegments(edgeGeometry, edgeMaterial))

renderer.setSize(width, height)
renderer.setPixelRatio(window.devicePixelRatio)

document.body.appendChild(renderer.domElement)

const force = forceSimulation()
  .nodes(Nodes)
  .force("link", forceLink().id(d => d.id))
  .force("charge", forceManyBody())
  .force("center", forceCenter(width / 2, height / 2))

const emptyNode = new THREE.Vector2()

timer(d => {
  for(let i=0; i < Nodes.length; i++) {
    nodePositions[i * 2] = Nodes[i].x - width / 2
    nodePositions[i * 2 + 1] = -(Nodes[i].y - height / 2)
  }

  for(let i=0; i < Math.max(lastOccupiedEdgeVertexIndex, links.length); i++) {
    const link = links[i]

    let source, target
    if(link) {
      source = link.source
      target = link.target
    } else {
      source = emptyNode
      target = emptyNode
    }

    edgeVertices[(i * 2) * 3] = source.x - width / 2
    edgeVertices[(i * 2) * 3 + 1] = -(source.y - height / 2)
    edgeVertices[(i * 2) * 3 + 3] = target.x - width / 2
    edgeVertices[(i * 2) * 3 + 4] = -(target.y - height / 2)
  }

  lastOccupiedEdgeVertexIndex = links.length

  edgeVerticesBuffer.needsUpdate = true
  nodePositionBuffer.needsUpdate = true
  renderer.render(scene, camera)
})

const randIndexGenerator = (exclude, length) => {
  const used = [ exclude ]
  return function() {
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

  force.force("link").links(links)

  force.alphaTarget(0.3).restart()
  
  updateLinksNodeIndex = (updateLinksNodeIndex + 1) % Nodes.length 
}

updateLinks()

updateLinksSID = setInterval(updateLinks, cycleDur / Nodes.length)



















import helpers from './helpers/helpers'
const { flatten, sampleArray, roundDown, decodeFloat } = helpers
import { scaleOrdinal, schemeCategory10, scaleLinear } from 'd3-scale'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceX, forceY } from 'd3-force'
import { quadtree as d3quadtree } from 'd3-quadtree'
import { select, selectAll, event } from 'd3-selection'
import { drag as d3drag } from 'd3-drag'
import { range } from 'd3-array'
import { timer } from 'd3-timer'
import messageState from './messageState'
import { getData } from './api'
import "../main.scss"
import { Nodes, initializeNodes, setFollowedBy, initializeFollowings, minFollowedByLength, maxFollowedByLength } from './nodes'

let popoverElement = document.querySelector("#popover"),
  popoverID = popoverElement.querySelector(".node_id"),
  popoverBelief = popoverElement.querySelector('.node_belief'),
  quadtree = d3quadtree(),
  renderer = new THREE.WebGLRenderer({ alpha: true }), 
  width = window.innerWidth, height = window.innerHeight,
  scene = new THREE.Scene(),
  camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 10000),
  nodePositions, nodeSizesColors,
  edgeGeometry = new THREE.BufferGeometry(),
  nodeGeometry = new THREE.BufferGeometry(),
  edgeVertices, lastOccupiedEdgeVertexIndex,
  nodePositionBuffer, edgeVerticesBuffer, nodeSizesColorsBuffer,
  force = forceSimulation(),
  emptyNode = new THREE.Vector2(),
  links, 
  nodeData, edgeData,
  cycleSID = null, cycleDur = 5000,
  updateLinksSID = null, updateLinksNodeIndex = 0,
  nodeSizeScale = scaleLinear().range([4, 20]).clamp(true)

scene.add(camera)
camera.position.z = 1000

const nodeMaterial = new THREE.ShaderMaterial({
  vertexShader: document.getElementById("node-vertexshader").textContent,
  fragmentShader: document.getElementById("node-fragmentshader").textContent,
  transparent: true
})

const edgeMaterial = new THREE.ShaderMaterial({
  uniforms: {
    color: {
      type: 'c',
      value: new THREE.Color(0xCCE1F1)
    }
  },
  vertexShader: document.getElementById("edge-vertexshader").textContent,
  fragmentShader: document.getElementById("edge-fragmentshader").textContent,
  transparent: true
})

renderer.setSize(width, height)
renderer.setPixelRatio(window.devicePixelRatio)

document.body.appendChild(renderer.domElement)

const updateLinks = () => {
  Nodes[updateLinksNodeIndex].adjustFollowing()
  setFollowedBy(Nodes[updateLinksNodeIndex])
  nodeSizeScale.domain([minFollowedByLength, maxFollowedByLength])

  links = []

  for(let i=0; i<Nodes.length; i++) {
    let n = Nodes[i]
    if(n.following.length) {
      for(let j=0; j<n.following.length; j++) {
        let target
        for(let k=0; k<Nodes.length; k++) {
          if(Nodes[k].id === n.following[j]) {
            target = Nodes[k]
            break
          }
        }
        links.push({ source: n, target })
      }
    }
  }

  force.force("link").links(links)
  force.alphaTarget(0.3).restart()
  
  updateLinksNodeIndex = (updateLinksNodeIndex + 1) % Nodes.length 
}

const initialize = () => {
  nodePositions = new Float32Array(Nodes.length * 2)
  nodeSizesColors = new Float32Array(Nodes.length * 2)
  edgeVertices = new Float32Array(edgeData.length * 2 * 6)
 
  nodePositionBuffer = new THREE.BufferAttribute(nodePositions, 2)
  nodeGeometry.addAttribute("position", nodePositionBuffer)
  nodeSizesColorsBuffer = new THREE.BufferAttribute(nodeSizesColors, 2)
  nodeGeometry.addAttribute("size", nodeSizesColorsBuffer)
  
  edgeVerticesBuffer = new THREE.BufferAttribute(edgeVertices, 3)

  edgeGeometry.addAttribute("position", edgeVerticesBuffer)

  scene.add(new THREE.LineSegments(edgeGeometry, edgeMaterial))
  scene.add(new THREE.Points(nodeGeometry, nodeMaterial))
  
  force.nodes(Nodes)
    .force("link", forceLink().id(d => d.id))
    .force("charge", forceManyBody().strength(-10).distanceMax(300))
    .force("center", forceCenter(width / 2, height / 2))
    .force("vertical", forceY().strength(0.1))
    .force("horizontal", forceX().strength(0.1))
    .velocityDecay(0.6)
  
  timer(d => {
    quadtree = d3quadtree().extent([[-1, -1], [width, height]])

    for(let i=0; i < Nodes.length; i++) {
      let node = Nodes[i]

      nodePositions[i * 2] = node.x - width / 2
      nodePositions[i * 2 + 1] = -(node.y - height / 2)
      nodeSizesColors[i * 2] = nodeSizeScale(node.followedBy.length)
      if(node.trumporhillary === 0) { // red
        nodeSizesColors[i * 2 + 1] = decodeFloat(229, 29, 46, 254)
      } else if(node.trumporhillary === 1 || node.trumporhillary === 2 || node.trumporhillary === 5) { // blue
        nodeSizesColors[i * 2 + 1] = decodeFloat(18, 168, 224, 254)
      } else { // purple
        nodeSizesColors[i * 2 + 1] = decodeFloat(80, 88, 139, 254)
      }
      quadtree.add([node.x, node.y, node])
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

      edgeVertices[i * 2 * 3] = source.x - width / 2
      edgeVertices[i * 2 * 3 + 1] = -(source.y - height / 2)
      edgeVertices[i * 2 * 3 + 3] = target.x - width / 2
      edgeVertices[i * 2 * 3 + 4] = -(target.y - height / 2)
    }

    lastOccupiedEdgeVertexIndex = links.length

    edgeVerticesBuffer.needsUpdate = true
    nodePositionBuffer.needsUpdate = true
    nodeSizesColorsBuffer.needsUpdate = true
    renderer.render(scene, camera)
  })
  
  links = edgeData

  links.forEach(l => {
    const source = Nodes.find(n => n.id === +l.source)
    const target = Nodes.find(n => n.id === +l.target)
    source.following = source.following.concat(target.id)
  })

  initializeFollowings()

  Nodes.forEach(n => n.init())

  messageState.init()

  messageState.cycle()

  cycleSID = setInterval(messageState.cycle, cycleDur)

  updateLinks()

  updateLinksSID = setInterval(updateLinks, cycleDur / Nodes.length)
}

document.addEventListener("mousemove", e => {
  e.preventDefault()
  popoverElement.style.left = e.pageX + 'px'
  popoverElement.style.top = e.pageY + 'px'

  const match = quadtree.find(e.pageX, e.pageY, 3)
  if(match) {
    popoverElement.style.display = 'block'
    popoverID.innerHTML = match[2].id
    popoverBelief.innerHTML = match[2].belief
  } else {
    popoverElement.style.display = 'none'
  }
})

Promise.all(['nodes', 'edges'].map(getData))
  .then(data => {
    nodeData = data[0].filter((d, i) => i < 600) 

    nodeData.splice(roundDown(nodeData.length, 3)) // nodes length must be multiple of 3

    edgeData = data[1].filter(d =>
      [+d.source, +d.target].every(id => nodeData.find(n => n.node_id === id))) 

    edgeData.splice(roundDown(edgeData.length, 3))

    initializeNodes(nodeData)
    initialize()
  })

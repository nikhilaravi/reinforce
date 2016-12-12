import mediator from './mediator'

let pickerOpen = false

const initialDataset = 'downTerrorism'
let currentDataset

const datasets = {
	downTerrorism: {
		nodes: 'downsampled_terrorism_nodes',
		edges: 'downsampled_terrorism_edges',
		beliefs: ["conservative", "liberal", "neutral"]
	},
	toy: {
		nodes: 'nodes_toy',
		edges: 'edges_toy',
		beliefs: ["conservative", "liberal"]
	},
	random: {
		nodes: 'nodes_random_network',
		edges: 'edges_random_network',
		beliefs: ["conservative", "liberal"]
	},
	scale_free: {
		nodes: 'nodes_scale_free_network',
		edges: 'edges_scale_free_network',
		beliefs: ["conservative", "liberal"]
	}
}

const closePicker = () => {
	pickerOpen = false
	updatePickerVisibility()
}

const openPicker = () => {
	pickerOpen = true
	updatePickerVisibility()
}

const togglePicker = () => {
	pickerOpen = !pickerOpen
	updatePickerVisibility()
}

const updatePickerVisibility = () => {
	if(pickerOpen) {
		document.querySelector("#dataset-picker").classList.add("open")
	} else {
		document.querySelector("#dataset-picker").classList.remove("open")
	}
}

const selectDataset = (dataset) => {
	const activeNode = document.querySelector("[data-dataset=" + dataset + "]")

	Array.prototype.forEach.call(document.querySelectorAll("#dataset-picker .dropdown .option"), node => {
		node.classList.remove("active")
	})

	activeNode.classList.add("active")
	document.querySelector("#dataset-picker .current").textContent = activeNode.textContent
	mediator.publish("selectDataset", datasets[dataset])

	currentDataset = dataset
}

document.addEventListener("click", e => {
	const target = e.target
	if(target.closest("#dataset-picker .select")) {
		e.stopPropagation()
		e.preventDefault()
		togglePicker()

		if(target.closest(".dropdown")) {
			selectDataset(target.getAttribute("data-dataset"))
		}
	} else {
		closePicker()
	}
})

mediator.subscribe("restart", () => {
	selectDataset(currentDataset)
})

setTimeout(() => { // timeout - wait for index.js to subscribe
	selectDataset(initialDataset)
}, 0)
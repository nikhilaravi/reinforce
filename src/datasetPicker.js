import mediator from './mediator'

let pickerOpen = false

const datasets = {
	downTerrorism: {
		nodes: 'downsampled_terrorism_nodes',
		edges: 'downsampled_terrorism_edges'
	},
	toy: {
		nodes: 'nodes_toy',
		edges: 'edges_toy'
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

document.addEventListener("click", e => {
	if(e.target.closest("#dataset-picker .select")) {
		e.stopPropagation()
		e.preventDefault()
		togglePicker()

		if(e.target.closest(".dropdown")) {
			Array.prototype.forEach.call(e.target.closest(".dropdown").querySelectorAll(".option"), node => {
				node.classList.remove("active")
			})

			e.target.classList.add("active")
		}
	} else {
		closePicker()
	}
})
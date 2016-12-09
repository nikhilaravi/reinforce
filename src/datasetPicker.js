import mediator from './mediator'

let pickerOpen = false

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
	} else {
		closePicker()
	}
})
import mediator from '../mediator'
import { initialDiversity } from '../config'

let sliderDown = false, currentDiversity = initialDiversity

const sliderRect = document.querySelector("#edit-diversity .slider").getBoundingClientRect()
const sliderLeft = sliderRect.left
const sliderWidth = sliderRect.width
const overridesDOM = document.querySelector("#edit-diversity .overrides")

const circle = document.querySelector("#edit-diversity .circle")
const sliderLabel = document.querySelector("#edit-diversity .circle")

let overrides = {}

overridesDOM.addEventListener('click', e => {
	if(e.target.classList.contains("close")) {
		delete overrides[+e.target.closest(".pill").getAttribute("data-id")]
		mediator.publish("delete-pill")
		updateDiversity(currentDiversity * sliderWidth)
	}
})

document.addEventListener("mousedown", e => {
	if(e.target.classList.contains("circle")) {
		sliderDown = true
	}
})

document.addEventListener("mouseup", e => {
	sliderDown = false
})

const updateDiversity = (left, silent) => {
	circle.style.left = left + 'px'
	sliderLabel.textContent = (left / sliderWidth).toFixed(1)
	
	if(window.activeNode === null) {
		currentDiversity = left / sliderWidth
	} else {
		overrides[window.activeNode.id] = left / sliderWidth
	}

	mediator.publish("updateDiversity", {
		val: currentDiversity,
		overrides
	})

	// do some innerhtml
	let innerHTML = ''

	Object.keys(overrides).forEach(k => {
		innerHTML += `<div data-id='${k}' class='pill'>Node ${k} <span>${overrides[k].toFixed(2)}</span><i class='material-icons close'>close</i></div>`
	})

	overridesDOM.innerHTML = innerHTML
}

document.addEventListener("mousemove", e => {
	if(!sliderDown) return

	const left = Math.max(0, Math.min(sliderWidth, e.clientX - sliderLeft))
	updateDiversity(left)
})

mediator.subscribe("data-initialized", () => {
	updateDiversity(currentDiversity * sliderWidth)
})

mediator.subscribe("deactivateNode", () => {
	updateDiversity(currentDiversity * sliderWidth)
})

mediator.subscribe("activateNode", () => {
	const left = currentDiversity * sliderWidth
	circle.style.left = left + 'px'
	sliderLabel.textContent = (left / sliderWidth).toFixed(1)
})


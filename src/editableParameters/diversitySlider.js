import mediator from '../mediator'
import { initialDiversity } from '../config'

let sliderDown = false, currentDiversity = initialDiversity

const sliderRect = document.querySelector("#edit-diversity .slider").getBoundingClientRect()
const sliderLeft = sliderRect.left
const sliderWidth = sliderRect.width

const circle = document.querySelector("#edit-diversity .circle")
const sliderLabel = document.querySelector("#edit-diversity .circle")

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
	
	if(!silent) {
		mediator.publish("updateDiversity", left / sliderWidth)
	}

	sliderLabel.textContent = (left / sliderWidth).toFixed(1)

	if(window.activeNode === null) {
		currentDiversity = left / sliderWidth
	}
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
	updateDiversity(currentDiversity * sliderWidth, true)
})


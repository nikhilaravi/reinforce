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

const updateDiversity = left => {
	circle.style.left = left + 'px'
	mediator.publish("updateDiversity", left / sliderWidth)
	sliderLabel.textContent = (left / sliderWidth).toFixed(1)

	currentDiversity = left / sliderWidth
}

document.addEventListener("mousemove", e => {
	if(!sliderDown) return

	const left = Math.max(0, Math.min(sliderWidth, e.clientX - sliderLeft))
	updateDiversity(left)
})

mediator.subscribe("data-initialized", () => {
	updateDiversity(currentDiversity * sliderWidth)
})


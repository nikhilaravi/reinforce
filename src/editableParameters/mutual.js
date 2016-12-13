import mediator from '../mediator'

let checked = false

const update = status => {
	checked = status
	document.querySelector("#mutual-followers").setAttribute("data-checked", checked)
	mediator.publish("mutualFollows", checked)
}

document.addEventListener("click", e => {
	if(e.target.closest("#mutual-followers")) {
		e.stopPropagation()
		update(!checked)
	}
})

mediator.subscribe("data-initialized", () => {
	update(checked)
})
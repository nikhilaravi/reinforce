import mediator from '../mediator'

let checked = true

const update = status => {
	checked = status
	document.querySelector("#whether-to-unfollow").setAttribute("data-checked", checked)
	mediator.publish("whetherToUnfollow", checked)
}

document.addEventListener("click", e => {
	if(e.target.closest("#whether-to-unfollow")) {
		e.stopPropagation()
		update(!checked)
	}
})

mediator.subscribe("data-initialized", () => {
	update(checked)
})
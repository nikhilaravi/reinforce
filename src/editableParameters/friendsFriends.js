import mediator from '../mediator'

let checked = false

const update = status => {
	checked = status
	document.querySelector("#edit-friends-friends").setAttribute("data-checked", checked)
	mediator.publish("editFriends", checked)
}

document.addEventListener("click", e => {
	if(e.target.closest("#edit-friends-friends")) {
		e.stopPropagation()
		update(!checked)
	}
})

mediator.subscribe("data-initialized", () => {
	update(checked)
})
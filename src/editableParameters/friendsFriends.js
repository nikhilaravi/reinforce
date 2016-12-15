import mediator from '../mediator'

let current = 'second-degrees'

const options = ['second-degrees', 'third-degrees', 'edit-friends-friends'].reduce((acc, curr) => {
	acc[curr] = {
		active: curr === 'second-degrees' ? true : false,
		node: document.querySelector("#" + curr)
	}
	return acc
}, {})

const update = status => {
	current = status
	
	Object.keys(options).forEach(k => {
		if(k === status) {
			options[k].active = true
		} else {
			options[k].active = false
		}

		options[k].node.setAttribute("data-checked", options[k].active)
	})

	mediator.publish("editFriends", status)
}

document.addEventListener("click", e => {
	const option = e.target.closest(".degrees-option")
	if(option) {
		e.stopPropagation()
		update(option.getAttribute("id"))
	}
})

mediator.subscribe("data-initialized", () => {
	update(current)
})
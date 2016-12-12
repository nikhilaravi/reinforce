import mediator from '../mediator'

const controls = document.querySelector("#controls")

const play = () => {
	controls.setAttribute("data-status", "playing")

	mediator.publish("play")
}

const pause = () => {
	controls.setAttribute("data-status", "paused")

	mediator.publish("pause")
}

const stop = () => {
	controls.setAttribute("data-status", "stopped")
}

const restart = () => {
	mediator.publish("restart")
}

document.addEventListener("click", e => {
	if(e.target.closest("#pause-button")) {
		pause()
	} else if(e.target.closest("#play-button")) {
		play()
	}
})

mediator.subscribe("data-initialized", play)

mediator.subscribe("stopped", stop)
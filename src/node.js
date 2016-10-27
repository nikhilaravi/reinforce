export default class Node {
	constructor(opts) {
		this.id = opts.id
		this.username = opts.username
	}

	init() {
		console.log(this.username)
	}
}
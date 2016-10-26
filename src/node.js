export default opts => {
	const node = () => {

	}

	node.id = opts.id
	node.username = opts.username

	node.speak = () => {
		console.log("lol")
	}

	return node
}
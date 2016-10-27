export default opts => {
	const config = Object.assign({}, opts)

	const node = () => {

	}

	node.speak = () => {
		console.log("lol")
	}

	Object.keys(config).forEach(k => {
		node[k] = arg => {
			if(!arguments.length) { return config[k] }
			config[k] = arg
			return node
		}
	})

	return node
}
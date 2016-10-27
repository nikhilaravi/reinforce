export default opts => {
	let SID = null

	const config = Object.assign({}, opts)

	const node = () => {

	}

	node.speak = () => {
		// console.log(config.username)
	}

	node.init = () => {
		SID = setInterval(node.speak, 1000)
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
// create dict based on a property of the node
const calculateDistribution = (Nodes, prop) => {
  return Nodes.reduce((dict, node) => {
    var belief = node[prop];
    if (dict.hasOwnProperty(belief)) {
      dict[belief] += 1
    } else {
      dict[belief] = 1
    }
    return dict
  }, {})
}

export default calculateDistribution
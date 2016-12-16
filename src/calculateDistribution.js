// create dict based on a property of the node
export const calculateDistribution = (Nodes, prop) => {
  return Nodes.reduce((dict, node) => {
    var belief = node[prop];
    if (prop === 'diversity' && isNaN(belief)) {
      belief = 0
    }
    if (dict.hasOwnProperty(belief)) {
      dict[belief] += 1
    } else {
      dict[belief] = 1
    }
    return dict
  }, {})
}

export const create_count_dict = (Nodes, prop) => {
  return Nodes.reduce((dict, node) => {
    var followers = node[prop].length;
    if (dict.hasOwnProperty(followers)) {
      dict[followers] += 1
    } else {
      dict[followers] = 1
    }
    return dict
  }, {})
}

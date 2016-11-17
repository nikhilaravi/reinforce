import numpy as np
import networkx as nx
from copy import deepcopy
import json

def write_dict(output_file, output_dict):
	f = open(output_file, 'w')
	f.write(json.dumps(output_dict))
	f.close()


def generate_graph_strong_community_structure():
	g = nx.DiGraph()

	num_communities = 2
	num_nodes_per_community = 50
	num_neighbors = 10

	nodes_per_community = {}

	num_bridgers = 3

	# Add nodes to the graph
	count = 0
	for c in range(0, num_communities):

		nodes_per_community[c] = []
		if c % 2 == 0: 
			l = 0
		else:
			l = 1

		for n in range(0, num_nodes_per_community):
			nodes_per_community[c].append(count)
			g.add_node(count, {'trumporhillary':l})
			count += 1

	# Add edges between all nodes within communities
	for c in nodes_per_community:
		for n1 in range(0, len(nodes_per_community[c])):

			potential_neighbors = deepcopy(nodes_per_community[c])
			potential_neighbors.remove(nodes_per_community[c][n1])
			np.random.shuffle(potential_neighbors)
			sampled_neighbors = potential_neighbors[0:num_neighbors]

			for n2 in sampled_neighbors:
				g.add_edge(nodes_per_community[c][n1], n2)

	# Add edge between num_bridgers random node from each community
	bridge_nodes = []
	for c in range(0, num_communities):
		np.random.shuffle(nodes_per_community[c])
		bridge_nodes.extend(nodes_per_community[c][0:num_bridgers])

	for n1 in range(0, len(bridge_nodes)):
		for n2 in range(n1 + 1, len(bridge_nodes)):
			g.add_edge(bridge_nodes[n1], bridge_nodes[n2])

	# Output gml
	nx.write_gml(g, '../data/toy_polarized_network.gml')


def output_nodes_and_edges(input_gml='../data/toy_polarized_network.gml'):

	g = nx.read_gml(input_gml)

	nodes = []

	for n in g.nodes(data=True):
		nodes.append({'node_id':n[0], 'trumporhillary':n[1]['trumporhillary']})

	edges = []

	for e in g.edges():
		edges.append({'source':e[0], 'target':e[1]})

	write_dict('../data/toy/nodes.json', nodes)
	write_dict('../data/toy/edges.json', edges)

if __name__ == '__main__':
	generate_graph_strong_community_structure()
	output_nodes_and_edges()


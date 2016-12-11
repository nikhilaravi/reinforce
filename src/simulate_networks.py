import numpy as np
import networkx as nx
from copy import deepcopy
import json
import matplotlib.pyplot as plt
import community as comm

def write_dict(output_file, output_dict):
	f = open(output_file, 'w')
	f.write(json.dumps(output_dict))
	f.close()

def compute_graph_modularity(g=None):

	curr_partition = comm.best_partition(g)		

	# Now, run community detection with this partition
	modularity = comm.modularity(curr_partition, g)
	print modularity

	# Return partition
	return curr_partition

def generate_graph_strong_community_structure():
	g = nx.Graph()

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


def generate_graph_random_structure(
		output_gml='data/toy_random_network.gml',
	):
	
	num_nodes = 100
	p_edge = 0.1
	g = nx.erdos_renyi_graph(num_nodes, p_edge)
	trump_or_hillary = dict(zip(g.nodes(), list(np.round(np.random.rand(1, num_nodes))[0])))
	nx.set_node_attributes(g, 'trumporhillary', trump_or_hillary)

	# Output gml
	nx.write_gml(g, output_gml)


def generate_graph_scale_free_structure(
		output_gml='data/toy_scale_free_network.gml',
	):
	
	num_nodes = 500
	g = nx.Graph(nx.scale_free_graph(num_nodes))

	modularity_classes = compute_graph_modularity(g=g)
	nodes_to_modularity = {}
	for n in modularity_classes:
		if not nodes_to_modularity.has_key(modularity_classes[n]):
			nodes_to_modularity[modularity_classes[n]] = []
		nodes_to_modularity[modularity_classes[n]].append(n)

	sorted_classes = sorted(nodes_to_modularity.items(), key=lambda x:len(x[1]), reverse=True)

	# Assign trump or hillary status
	count = 0
	for c in sorted_classes:

		if count % 3 == 1:
			l = 0
		elif count % 3 == 2:
			l = 1
		else:
			l = 7
		attr_dict = dict(zip(c[1], [l for i in range(0, len(c[1]))]))
		nx.set_node_attributes(g, 'trumporhillary', attr_dict)
		count += 1

	# Output gml
	nx.write_gml(g, output_gml)


def get_node_positions_from_gexf(input_gexf=''):
	from xml.dom import minidom
	xmldoc = minidom.parse(input_gexf)
	all_nodes = xmldoc.getElementsByTagName('node')

	node_positions = {}
	for node in all_nodes:
		twitter_handle = node.getElementsByTagName('attvalue')[4].attributes['value'].value
		node_positions[twitter_handle] = []
		curr_pos = node.getElementsByTagName('viz:position')[0]

		node_positions[twitter_handle].append(curr_pos.attributes['x'].value)
		node_positions[twitter_handle].append(curr_pos.attributes['y'].value)

	return node_positions


def downsample_network(input_gml='../data/issues/terrorism/terrorism_giant_component.gml'):

	downsampled_size = 500

	# Open network
	g = nx.read_gml(input_gml)

	# Sort by degree
	sorted_degrees = sorted(g.degree_iter(),key=lambda x:x[1],reverse=True)[0:downsampled_size]

	# Store node IDs
	subgraph_nodes = []
	for n in sorted_degrees:
		subgraph_nodes.append(n[0])

	sub_g = g.subgraph(subgraph_nodes)

	sub_g = max(nx.connected_component_subgraphs(sub_g), key=len)

	print len(sub_g.nodes())
	print len(sub_g.edges())
	nx.write_gml(sub_g, input_gml.split('.gml')[0] + '_500_subgraph.gml')


def output_nodes_and_edges(
		input_gml='data/toy_scale_free_network.gml',
		output_nodes_file='data/nodes_scale_free_network.json',
		output_edges_file='data/edges_scale_free_network.json'
	):

	# Open graph
	print 'Reading gml ...'
	g = nx.read_gml(input_gml).to_undirected()

	# Get giant component
	print 'Getting giant component ...'
	g = max(nx.connected_component_subgraphs(g), key=len)

	edges = []

	nodes_to_add = set()

	for e in g.edges():
		nodes_to_add.add(e[0])
		nodes_to_add.add(e[1])
		edges.append({'source':e[0], 'target':e[1]})

	nodes = []

	for n in g.nodes(data=True):

		if n[0] not in nodes_to_add: continue

		nodes.append({'node_id':n[0], 'trumporhillary':n[1]['trumporhillary']})

	write_dict(output_nodes_file, nodes)
	write_dict(output_edges_file, edges)

'''
	Outputs node and edge JSON files with coordinates from gexf file
	Coordinates (and gexf) exported from Gephi
'''
def output_nodes_and_edges_with_coordinates(
		input_gml='data/terrorism_giant_component.gml',
		input_gexf='data/terrorism_giant_component_layout.gexf',
		output_nodes_file='data/nodes.json',
		output_edges_file='data/edges.json'
	):

	# Get node coordinates from gexf file
	node_coordinates = get_node_positions_from_gexf(input_gexf=input_gexf)

	# Open graph
	print 'Reading gml ...'
	g = nx.read_gml(input_gml).to_undirected()

	# Get giant component
	print 'Getting giant component ...'
	g = max(nx.connected_component_subgraphs(g), key=len)

	edges = []

	nodes_to_add = set()

	for e in g.edges():
		nodes_to_add.add(e[0])
		nodes_to_add.add(e[1])
		edges.append({'source':e[0], 'target':e[1]})

	nodes = []

	for n in g.nodes(data=True):

		if n[0] not in nodes_to_add: continue

		nodes.append({'node_id':n[0], 'trumporhillary':n[1]['trumporhillary'], 'x_pos':node_coordinates[n[1]['twitterhandle']][0], 'y_pos':node_coordinates[n[1]['twitterhandle']][1]})

	write_dict(output_nodes_file, nodes)
	write_dict(output_edges_file, edges)

'''
	Simulates the spread of information in social network (per modularity class) based on SI infection model
	Explanation and preliminary results here:
	https://docs.google.com/document/d/1KSMl691MqRp8N_O_9H24-2uvB7QWSbT6H4Kjl4TeE3Y/edit
'''
def run_full_si_simulator(input_gml='../data/issues/terrorism/terrorism_giant_component.gml'):

	g = nx.read_gml(input_gml)
	modularity_classes = compute_graph_modularity(g=g)

	print len(g.nodes())

	# For each modularity class, randomly select a seed node 
	nodes_per_modularity = {}
	for n in modularity_classes:
		if not nodes_per_modularity.has_key(modularity_classes[n]):
			nodes_per_modularity[modularity_classes[n]] = []
		nodes_per_modularity[modularity_classes[n]].append(n)

	sorted_nodes_per_modularity = sorted(nodes_per_modularity.items(), key=lambda x:len(x[1]), reverse=True)[0:30]
	top_communities = [i[0] for i in sorted_nodes_per_modularity]

	transmission_probs = [0.05*i for i in range(1, 21)]
	influence_effect = 0.01
	median_normalized_times = []

	# Now, for each time step, run the simulation forward until all nodes in that community have been infected
	for transmission_prob in transmission_probs:
		print transmission_prob

		infected_nodes_per_modularity = {}
		already_infected_per_modularity = dict(zip(top_communities, [{} for i in range(0, len(top_communities))]))

		for m in top_communities:
			infected_nodes_per_modularity[m] = [np.random.choice(nodes_per_modularity[m])]
			already_infected_per_modularity[m][infected_nodes_per_modularity[m][0]] = 0

		infection_time_per_modularity = dict(zip(top_communities, [0 for i in range(0, len(top_communities))]))
		for m in top_communities:
			# print m

			while len(already_infected_per_modularity[m]) / float(len(nodes_per_modularity[m])) < 0.99:
				# print already_infected_per_modularity[m].keys()

				# Increment time
				infection_time_per_modularity[m] += 1

				# Get the current node
				curr_node = infected_nodes_per_modularity[m][0]

				# print 'curr node: ', curr_node

				# Sample to see if this infected node should transmit the infection to its neighbors
				threshold_prob = np.minimum(1, (transmission_prob + (2 ** already_infected_per_modularity[m][curr_node]) * influence_effect))
				should_transmit = np.random.random() < threshold_prob

				# If the node should transmit, add its neighbors to the infected set
				if should_transmit:

					# Remove that node
					curr_node = infected_nodes_per_modularity[m].pop(0)

					# Get neighbors and infect them
					neighbors = g.neighbors(curr_node)
					for n2 in neighbors:

						if not infected_nodes_per_modularity.has_key(modularity_classes[n2]):
							continue

						if not n2 in infected_nodes_per_modularity[modularity_classes[n2]]:
							infected_nodes_per_modularity[modularity_classes[n2]].append(n2)
							already_infected_per_modularity[modularity_classes[n2]][n2] = 1
						
						else:
							already_infected_per_modularity[modularity_classes[n2]][n2] += 1

		# Normalize time by number of nodes in each community
		for m in top_communities:
			infection_time_per_modularity[m] /= float(len(nodes_per_modularity[m]))

		# import pprint
		# pprint.pprint(infection_time_per_modularity, width=1)
		
		curr_time = np.median(infection_time_per_modularity.values())
		median_normalized_times.append(curr_time)
		print curr_time

	print transmission_probs
	print median_normalized_times

	plt.plot(transmission_probs, median_normalized_times)
	plt.xlabel('p_i')
	plt.ylabel('time taken for full infection')
	plt.show()


if __name__ == '__main__':
	generate_graph_scale_free_structure()
	output_nodes_and_edges()


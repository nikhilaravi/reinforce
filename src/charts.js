// flot chart for plotting the reward of a single node
import uniq from 'uniq'

  var nflot = 100;
  var intervalID = undefined,
  chartCaptionElement = document.querySelector("#chart_caption"),
  chartNodeID = chartCaptionElement.querySelector(".chart_node_id"),
  chartNodeBelief = chartCaptionElement.querySelector('.chart_node_belief')


  export function initFlot(node) {
    initNodeDiversityChart(node)
    chartNodeID.innerHTML = 'Node id: ' + node.id
    chartNodeBelief.innerHTML = 'trumporhillary: ' + node.trumporhillary
    if (intervalID !== undefined) {
      clearInterval(intervalID)
    }
    var container = $("#flotreward");
    var res = node._rewards;
    var x = [...Array(res.length).keys()]
    var rewards = res.map((r, i) => {
      return [x[i], r]
    })
    var series = [{
      data: rewards,
      lines: {fill: true}
    }];
    var plot = $.plot(container, series, {
      grid: {
        borderWidth: 1,
        minBorderMargin: 20,
        labelMargin: 10,
        backgroundColor: {
          colors: ["#FFF", "#f4e4e4"]
        },
        margin: {
          top: 10,
          bottom: 10,
          left: 10,
        }
      },
      xaxis: {
        min: 0,
        max: nflot
      },
      yaxis: {
        min: -1,
        max: 1
      }
    });
    intervalID = setInterval(function(){
      var res = node._rewards;
      var x = [...Array(res.length).keys()]
      var rewards = res.map((r, i) => {
        return [x[i], r]
      })
      series[0].data = rewards;
      plot.setData(series);
      plot.draw();
    }, 100);
  }

  function create_follower_count_dict(Nodes) {
    return Nodes.reduce((dict, node) => {
      var followers = node.followedBy.length;
      if (dict.hasOwnProperty(followers)) {
        dict[followers] += 1
      } else {
        dict[followers] = 1
      }
      return dict
    }, {})
    return follower_counts_dict
  }

  function create_diversity_dict(Nodes) {
    return Nodes.reduce((dict, node) => {
      var belief = node.trumporhillary;
      if (dict.hasOwnProperty(belief)) {
        dict[belief].data += 1
      } else {
        dict[belief] = {label:belief, data:1}
      }
      return dict
    }, {})
  }

  export function initNetworkConnectivity(Nodes) {
    // console.log('num nodes', Object.keys(Nodes).length)
    var follower_counts_dict = create_follower_count_dict(Nodes)

    var x = Object.keys(follower_counts_dict)
    var y = Object.values(follower_counts_dict)
    var points = x.map((x, i) => {
      return [parseInt(x), y[i]]
    })
    var series = [{
      data: points
    }];
    var container = $("#flotnetwork");
    var plot = $.plot(container, series, {
      grid: {
        borderWidth: 1,
        minBorderMargin: 20,
        labelMargin: 10,
        backgroundColor: {
          colors: ["#FFF", "#e4f4f4"]
        },
        margin: {
          top: 10,
          bottom: 10,
          left: 10,
        }
      },
      xaxis: {
        min: 0,
        max: 20,
        axisLabel: 'Number of followers',
        axisLabelFontSizePixels: 8,
        axisLabelPadding: 5
      },
      yaxis: {
        min: 0,
        max: 25,
        axisLabel: 'Number of nodes',
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 8,
        axisLabelPadding: 50
      }
    });
    intervalID = setInterval(function(){
      var follower_counts_dict = create_follower_count_dict(Nodes)
      var x = Object.keys(follower_counts_dict)
      var y = Object.values(follower_counts_dict)
      var points = x.map((x, i) => {
        return [parseInt(x), y[i]]
      })
      // console.log(follower_counts_dict)
      series[0].data = points;
      plot.setData(series);
      plot.draw();
    }, 100);
  }

  export function initDiversityChart(Nodes) {
    // console.log('num nodes', Object.keys(Nodes).length)
    var belief_counts_dict = create_diversity_dict(Nodes)
    var belief_list = Object.keys(belief_counts_dict).reduce((list, belief) => {
      list.push([parseInt(belief), belief_counts_dict[belief].data])
      return list
    }, []);
    var series = [
      { label: "Beliefs", data: belief_list, color: "#5482FF" }
    ];
    var container = $("#flotdiversitynetwork");
    var plot = $.plot(container, series, {
      series: {
        bars: {
          show: true
        }
      },
      bars: {
        align: "center",
        barWidth: 0.5
      },
      grid: {
        borderWidth: 1,
        minBorderMargin: 20,
        labelMargin: 10,
        backgroundColor: {
          colors: ["#FFF", "#e4f4f4"]
        },
        margin: {
          top: 10,
          bottom: 10,
          left: 10,
        }
      },
      xaxis: {
        min: -1,
        max: 2,
        ticks: [[0, 'Trump'], [1, 'Hilary']]
      },
      yaxis: {
        min: 0,
        max: 60
      }
    });
    intervalID = setInterval(function(){
      var belief_counts_dict = create_diversity_dict(Nodes)
      var belief_list = Object.keys(belief_counts_dict).reduce((list, belief) => {
        list.push([parseInt(belief), belief_counts_dict[belief].data])
        return list
      }, []);
      series[0].data = belief_list;
      plot.setData(series);
      plot.draw();
    }, 100);
  }


  function create_node_diverstiy_dict(node) {
    return node.following.reduce((dict, follower) => {
      var belief = follower.trumporhillary;
      if (dict.hasOwnProperty(belief)) {
        dict[belief].data += 1
      } else {
        dict[belief] = {label:belief, data:1}
      }
      return dict
    }, {});
  }

  export function initNodeDiversityChart(node) {
    console.log('following', node.following)
    var belief_counts_dict = create_node_diverstiy_dict(node);
    var belief_list = Object.keys(belief_counts_dict).reduce((list, belief) => {
      list.push([parseInt(belief), belief_counts_dict[belief].data])
      return list
    }, []);
    var series = [
      { label: "Beliefs", data: belief_list, color: "#5482FF" }
    ];
    var container = $("#flotnodediversity");
    var plot = $.plot(container, series, {
      series: {
        bars: {
          show: true
        }
      },
      bars: {
        align: "center",
        barWidth: 0.5
      },
      grid: {
        borderWidth: 1,
        minBorderMargin: 20,
        labelMargin: 10,
        backgroundColor: {
          colors: ["#FFF", "#f4e4e4"]
        },
        margin: {
          top: 10,
          bottom: 10,
          left: 10,
        }
      },
      xaxis: {
        min: -1,
        max: 2,
        ticks: [[0, 'Trump'], [1, 'Hilary']]
      },
      yaxis: {
        min: 0,
        max: 20
      }
    });
    intervalID = setInterval(function(){
      var belief_counts_dict = create_node_diverstiy_dict(node);
      var belief_list = Object.keys(belief_counts_dict).reduce((list, belief) => {
        list.push([parseInt(belief), belief_counts_dict[belief].data])
        return list
      }, []);
      series[0].data = belief_list;
      plot.setData(series);
      plot.draw();
    }, 100);
  }

export function initAssortativity(Nodes) {
    var history = []
    history.push(calculateAssortativity(Nodes))
    var x = [...Array(history.length)]
    var points = history.map((r, i) => {
      return [x[i], r]
    })
    var series = [{
      data: points
    }];
    var container = $("#flotnetwork");
    var plot = $.plot(container, series, {
      grid: {
        borderWidth: 1,
        minBorderMargin: 20,
        labelMargin: 10,
        backgroundColor: {
          colors: ["#FFF", "#e4f4f4"]
        },
        margin: {
          top: 10,
          bottom: 10,
          left: 10,
        }
      },
      xaxis: {
        min: 0,
        max: 20,
        axisLabel: 'Number of followers',
        axisLabelFontSizePixels: 8,
        axisLabelPadding: 5
      },
      yaxis: {
        min: 0,
        max: 25,
        axisLabel: 'Number of nodes',
        axisLabelUseCanvas: true,
        axisLabelFontSizePixels: 8,
        axisLabelPadding: 50
      }
    });
    intervalID = setInterval(function(){
      history.push(calculateAssortativity(Nodes))
      var x = [...Array(history.length)]
      var points = history.map((r, i) => {
        return [x[i], r]
      })
      series[0].data = points;
      plot.setData(series);
      plot.draw();
    }, 100)
}

function calculateAssortativity(Nodes) {

		// unique types
		var types = uniq(Nodes.map(n => n.belief))
		// fraction of edges that connect a vertex of type i to another of type j
		var n_types = types.length
		var e_ij = []

		// use to calcualte the fraction
		var total_edges = Nodes.reduce((sum, n) => { sum += n.following.length; return sum }, 0);

		// iterate through the types
		for (var i=0; i<n_types; i++) {
			var type_i = types[i];
			var nodes_type_i = Nodes.filter(n => n.belief === type_i);
			// iterate through all other types
			e_ij.push([])
			for (var j=0; j<n_types; j++) {
				var type_j = types[j];
				var edges_type_j = 0;

				// iterate through all nodes of type i
				for (var n=0; n<nodes_type_i.length; n++) {

					// find all nodes being followed of the type_j
					var followings = nodes_type_i[n].following;
					var followings_type_j = followings.filter(n => n.belief === type_j);
					edges_type_j += followings_type_j.length;

					// save
					e_ij[i][j] = edges_type_j/total_edges
				}
			}
		}

		// a_i = sum out over all j
		var a_i = []
		for (var i=0; i<n_types; i++) {
			var a_i_j = e_ij[i].reduce((sum, elem) => {
				sum +=elem;
				return sum;
			}, 0);
			a_i.push(a_i_j)
		}

		// b_j sum out over all i
		var b_j = []
		for (var j=0; j<n_types; j++) {
			var b_j_i = 0
			for (var i=0; i<n_types; i++) {
				b_j_i += e_ij[i][j]
			}
			b_j.push(b_j_i)
		}

		var sum_e_ii = 0

		for (var i=0; i<n_types; i++) {
			sum_e_ii += e_ij[i][i]
		}

		var sum_prod_a_ij_b_ij= 0

		for (var i=0; i<n_types; i++) {
			sum_prod_a_ij_b_ij += a_i[i]*b_j[i]
		}


		// Positive values of r indicate a correlation between nodes of similar degree, while negative values indicate relationships between nodes of different degree
		var assortativity = (sum_e_ii - sum_prod_a_ij_b_ij)/(1-sum_prod_a_ij_b_ij)

		return assortativity
		// console.log('assortativity', assortativity)
}

export function AssortativityChart(Nodes) {
  this.series = [{data: []}];
  this.history = [];
  return {
    setup: () => {
      this.container = $('[chart="assortativity"]');
      document.querySelector('[chart="assortativity"]').setAttribute('style', 'width:800px; height: 300px;')
      this.plot = $.plot(this.container, this.series, {
        xaxis: {
          min: 0,
          max: 20,
          axisLabel: 'Time',
        },
        yaxis: {
          min: -1,
          max: 1,
          axisLabel: 'Assortativity',
        }
      });
      this.history.push(calculateAssortativity(Nodes))
      var points = this.history.map((r, i) => {
        return [i, r]
      })
      this.series[0].data = points;
      this.plot.setData(this.series);
      this.plot.draw();
    },

    update: (Nodes) => {
      this.history.push(calculateAssortativity(Nodes))
      var points = this.history.map((r, i) => {
        return [i, r]
      });
      this.series[0].data = points;
      this.plot.setData(this.series);
      this.plot.draw();
    },

    clear: () => {
      this.series[0].data = []
      this.plot.setData(this.series);
      this.plot.draw();
    },

    converged: () => {
      console.log('converged')
      var points = this.history.map((r, i) => {
        return [i, r]
      });
      this.series[0].data = points;
      this.plot.setData(this.series);
      this.plot.draw();
    }
  }
}

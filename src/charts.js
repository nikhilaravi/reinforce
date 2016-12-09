// flot chart for plotting the reward of a single node

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

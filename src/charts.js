// flot chart for plotting the reward of a single node

  var nflot = 100;
  var intervalID = undefined,
  chartCaptionElement = document.querySelector("#chart_caption"),
  chartNodeID = chartCaptionElement.querySelector(".chart_node_id"),
  chartNodeBelief = chartCaptionElement.querySelector('.chart_node_belief')

  export function initFlot(node) {
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

  export function initNetworkConnectivity(Nodes) {
    var follower_counts_dict = Nodes.reduce((dict, node) => {
      var followers = node.followedBy.length;
      if (dict.hasOwnProperty(followers)) {
        dict[followers] += 1
      } else {
        dict[followers] = 1
      }
      return dict
    }, {})

    var x = Object.keys(follower_counts_dict)
    var y = Object.values(follower_counts_dict)
    var container = $("#flotnetwork");
    var points = x.map((x, i) => {
      return [parseInt(x), y[i]]
    })
    console.log(points)
    var series = [{
      data: points
    }];
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
        max: 100
      },
      yaxis: {
        min: 0,
        max: 100
      }
    });
    plot.setData(series);
    plot.draw();
  }

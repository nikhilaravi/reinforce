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

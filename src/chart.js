
  var nflot = 1000;
  export function initFlot(node) {
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
        min: -100,
        max: 100
      }
    });
    setInterval(function(){
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

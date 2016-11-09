var fs = require('fs')

// //Converter Class 
// var Converter = require("csvtojson").Converter;
// var converter = new Converter({});
 
// //end_parsed will be emitted once parsing finished 
// converter.on("end_parsed", function (jsonArray) {
//    // console.log(jsonArray); //here is your result jsonarray 
//    console.log("lol")
//    fs.writeFile('/tmp/nodes.json', JSON.stringify(jsonArray), function() {
// 			console.log("done")
// 		})
// });
 
// //read from file 
// require("fs").createReadStream("./src/data/edgestest.txt").pipe(converter);

fs.readFile('./src/data/edgestest.txt', function(err, content) {
	var parsed = JSON.parse(content)
	var array = parsed.split(",").map(function(d) {
		var ids = d.trim().split(" ")
		return [+ids[0], +ids[1]]
	})

	fs.writeFile('/tmp/edges.json', JSON.stringify(array), function() {
		console.log("done")
	})
})
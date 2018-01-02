
//to dos:
//troubleshoot knots
//bounding box


var params = {
		segments: 5,
		iterations: 200,
		points: [3, 9],
		show: 6,
		ratios: []
}

var original = document.getElementById("original");
var curve = document.getElementById("curve");
var nodes = document.getElementById("nodes");
var ranges = [];

function updateKnots(){
	knots = [];
	generateKnots();
	updateRenderer(original.noUiSlider.get(), nodes.noUiSlider.get(), curve.noUiSlider.get());
}

function updateRenderer(original, nodes, curve){
	console.log(original, curve, nodes)
	scene.clear();
	if(original == 1.00) scene.drawKnots(knots);
	if(nodes == 1.00) scene.drawNodes(knots);
	if(curve == 1.00) scene.drawCurvedKnots(knots);
	scene.drawValues(knots);
}

for(var i = 0; i < params.segments; i++){
	params.ratios.push([90, 100]);
}




function initUI(){

	function makeRange(i){

		var label = document.createElement("span");
		label.class = "my_label";
		label.innerHTML = "A"+i;
		document.getElementById("ratios").append(label);

        const range = document.createElement("div");
		range.style.height = '20px';
		range.style.margin = '30px auto 30px';

		noUiSlider.create(range, {
			start: params.ratios[i], 
			margin: 1, 
			limit: 100, // ... but no more than 600
			connect: true, // Display a colored bar between the handles
			orientation: 'horizontal', // Orient the slider vertically
			behaviour: 'tap-drag', // Move handle on tap, bar is draggable
			step: 1,
			tooltips: true,
			range: {
				'min': 0,
				'max': 100
			}
		});
		range.idx = i

		document.getElementById("ratios").append(range);

		range.noUiSlider.on('end', function(){
			var ratio = this.get();
			updateKnots();
			for(var j = 0; j < params.segments; j++){
				params.ratios[j] = ranges[j].noUiSlider.get();
			}
		});

		return range;
	}

	var ratio_div = document.getElementById("ratios");

	for (var i = 0; i < params.segments; i++){
		
		// var label = document.createElement("span");
		// label.class = "my_label";
		// label.innerHTML = "A"+i;
		// document.getElementById("ratios").append(label);

		// ranges[i] = document.createElement("div");
  //       //const range = document.createElement("div");
		// ranges[i].style.height = '20px';
		// ranges[i].style.margin = '30px auto 30px';

		// noUiSlider.create(ranges[i], {
		// 	start: params.ratios[i], 
		// 	margin: 1, 
		// 	limit: 100, // ... but no more than 600
		// 	connect: true, // Display a colored bar between the handles
		// 	orientation: 'horizontal', // Orient the slider vertically
		// 	behaviour: 'tap-drag', // Move handle on tap, bar is draggable
		// 	step: 1,
		// 	tooltips: true,
		// 	range: {
		// 		'min': 0,
		// 		'max': 100
		// 	}
		// });
		// ranges[i].idx = i

		// document.getElementById("ratios").append(ranges[i]);

		// ranges[i].noUiSlider.on('end', function(){
		// 	var a = i
		// 	params.ratios[a] = this.get();
		// 	updateKnots();
		// 	console.log("adding to params.ratios ", this.idx, this.get());
		// 	console.log(params.ratios)
		// });

		
        ranges.push(makeRange(i))

	}



	var iterations = document.getElementById("iterations");

	iterations.style.height = '20px';
	iterations.style.margin = '30px auto 30px';

	noUiSlider.create(iterations, {
		start: [params.iterations], 
		orientation: 'horizontal', // Orient the slider vertically
		behaviour: 'tap-drag', // Move handle on tap, bar is draggable
		step: 1,
		tooltips: true,
		range: {
			'min': 0,
			'max': 1000
		}
	});

	iterations.noUiSlider.on('end', function(){
		console.log(this.get());
		params.iterations = this.get();
		updateKnots();
	});

	var segments = document.getElementById("segments");

	segments.style.height = '20px';
	segments.style.margin = '30px auto 30px';

	noUiSlider.create(segments, {
		start: [ params.segments ], // 4 handles, starting at...
		orientation: 'horizontal', // Orient the slider vertically
		behaviour: 'tap-drag', // Move handle on tap, bar is draggable
		step: 1,
		tooltips: true,
		range: {
			'min': 1,
			'max': 24
		}
	});

	segments.noUiSlider.on('end', function(){
		console.log(this.get());
		params.segments = this.get();
		updateKnots()
	});

	var show = document.getElementById("show");

	show.style.height = '20px';
	show.style.margin = '30px auto 30px';

	noUiSlider.create(show, {
		start: [ params.show ], // 4 handles, starting at...
		orientation: 'horizontal', // Orient the slider vertically
		behaviour: 'tap-drag', // Move handle on tap, bar is draggable
		step: 1,
		tooltips: true,
		range: {
			'min': 1,
			'max': 20
		}
	});

	show.noUiSlider.on('end', function(){
		console.log(this.get());
		params.show = this.get();
		updateKnots();
	});

	var points = document.getElementById("points");

	points.style.height = '20px';
	points.style.margin = '30px auto 30px';

	noUiSlider.create(points, {
		start: params.points, // 4 handles, starting at...
		margin: 1, // Handles must be at least 300 apart
		connect: true, // Display a colored bar between the handles
		orientation: 'horizontal', // Orient the slider vertically
		behaviour: 'tap-drag', // Move handle on tap, bar is draggable
		step: 1,
		tooltips: true,
		range: {
			'min': 3,
			'max': 24
		}
	});


	points.noUiSlider.on('end', function(){
		console.log(this.get());
		params.points = this.get();
		updateKnots();
	});


	original.style.height = '20px';
	original.style.margin = '10px 20px 10px 0px';

	noUiSlider.create(original, {
		start: 1, // 4 handles, starting at...
		orientation: 'horizontal', // Orient the slider vertically
		behaviour: 'tap-drag', // Move handle on tap, bar is draggable
		step: 1,
		range: {
			'min': 0,
			'max': 1
		}
	});


	original.noUiSlider.on('end', function(){
		// var val = this.get();
		updateRenderer(original.noUiSlider.get(), nodes.noUiSlider.get(), curve.noUiSlider.get());
	});

	curve.style.height = '20px';
	curve.style.margin ='10px 20px 10px 0px';

	noUiSlider.create(curve, {
		start: 1, // 4 handles, starting at...
		orientation: 'horizontal', // Orient the slider vertically
		behaviour: 'tap-drag', // Move handle on tap, bar is draggable
		step: 1,
		range: {
			'min': 0,
			'max': 1
		}
	});


	curve.noUiSlider.on('end', function(){
		// var val = this.get();
		updateRenderer(original.noUiSlider.get(), nodes.noUiSlider.get(), curve.noUiSlider.get());
	});

	nodes.style.height = '20px';
	nodes.style.margin = '10px 20px 10px 0px';

	noUiSlider.create(nodes, {
		start: 1, // 4 handles, starting at...
		orientation: 'horizontal', // Orient the slider vertically
		behaviour: 'tap-drag', // Move handle on tap, bar is draggable
		step: 1,
		range: {
			'min': 0,
			'max': 1
		}
	});


	nodes.noUiSlider.on('end', function(){
		// var val = this.get();
		updateRenderer(original.noUiSlider.get(), nodes.noUiSlider.get(), curve.noUiSlider.get());
	});
}















function Scene2D(element){
	this.element = element;
 	this.w = element.width();
	this.h = element.height();
	this.draw = SVG('renderArea');
	var that = this;
	// this.weaves = [];
	// this.showing = 0;
	// this.highlight = this.draw.nested();


	// $(window).on('resize', function(){
	// 	that.resize();
	// });

}

Scene2D.prototype.clear = function(){
	var children = this.draw.children();
	for(c in children){
		children[c].remove();
	}
}


// Scene2D.prototype.element = null;
// Scene2D.prototype.w= 1;
// Scene2D.prototype.h= 1;
// Scene2D.prototype.draw = null;
// Scene2D.prototype.weaves = null;
// Scene2D.prototype.showing = 0;
// Scene2D.prototype.highlight = null;

// Scene2D.prototype.drawWeave = function (id){
// 	console.log("hiding "+this.showing+" showing"+id);
// 	for(w in this.weaves){
// 		this.weaves[w].hide();
// 	}
// 	this.weaves[id].show();
// 	this.showing = id;
// }




Scene2D.prototype.drawKnots = function(knots, show_nodes){
	console.log("rendering knots");
	var colors = ['#ff3205', '#ffae00', '#26ff00', '#00c7ff', '#4f0091'];

	var inc = this.w / 3.;
	var x_offset = 0;
	var y_offset = 0;


	for(k in knots){
		var knot = knots[k];

		var path = "";

		var nested = this.draw.nested();
		//draw segments
		for(e in knot.edges){
			var edge = knot.edges[e];
			var from = knot.nodes[edge.from];
			var to = knot.nodes[edge.to];

			if(e == 0) path +="M "+from.x*inc+" "+from.y*inc;
			path += "C"+to.x*inc+" "+to.y*inc+" "+to.x*inc+" "+to.y*inc+" "+to.x*inc+" "+to.y*inc;

			var l = nested.line(from.x*inc, from.y*inc, to.x*inc, to.y*inc);
			l.stroke({
				color: colors[edge.seg_id%colors.length],
				width: 1
			});

		}

		

		if(show_nodes){
			for(n in knot.nodes){
				var node = knot.nodes[n];
				var c = nested.circle(20);
				c.cx(node.x*inc);
				c.cy(node.y*inc);
				if(node.kind == "topo") c.fill('#555');
				if(node.kind == "ground") c.fill('#000');
				if(node.kind == "power") c.fill('#f00');
				if(node.kind == "analog") c.fill('#00f');
				if(node.kind == "intersection") c.fill('#0f0');
				c.stroke({
					color: '#fff',
					width: 2
				});

				var t = nested.text(""+node.id);
				t.cx(node.x*inc);
				t.cy(node.y*inc);
				t.fill('#fff');
			}
		}


		nested.move((k%3)*inc, Math.floor((k/3))*inc);
	}
}

Scene2D.prototype.drawCurvedKnots = function(knots){
	console.log("rendering curved knots");
	var colors = ['#ff3205', '#ffae00', '#26ff00', '#00c7ff', '#4f0091'];

	var inc = this.w / 3.;
	var x_offset = 0;
	var y_offset = 0;

	for(k in knots){
		var knot = knots[k];
		var nested = this.draw.nested();
		var path = ""
		var r_path = ""
		var control = true;

		//cycle through each point
		//if its the first point, just move there
		//if its the last point, just draw a line if you're not already there
		//if its an topo point, draw a curve from the previous node to the next node
		//if its an analog point, only draw it if the next point is an analog point




		//draw edges in no particular order

		for(e in knot.edges){
			var edge = knot.edges[e];
			var from = knot.nodes[edge.from]
			var to = knot.nodes[edge.to]


			if(to.kind == "topo"){

				//draw to the next edge ending point
				var edges = getEdgesBeginningAt(knot, to.id, true);
				var next_node = knot.nodes[edges[0].to]; 

				edges = getEdgesEndingAt(knot, to.id, true);
				var prev_node = knot.nodes[edges[0].from]; 

				//handle the case where the previous node is also topo (in which case it would have already been drawn)
				if(prev_node.kind != "topo"){

					var control_node = {
						x: to.x, 
						y: to.y
					}
					var ending_node = next_node;
					var escape = false;

					//if there are other topo nodes in a row, then average them into a single point
					while(next_node.kind == "topo" && !escape){
						console.log("multiple TOPOs in a row");
						control_node.x = (control_node.x + next_node.x) / 2.0;
						control_node.y = (control_node.y + next_node.y) / 2.0;
						edges = getEdgesBeginningAt(knot, next_node.id, true);

						if(edges.length == 0) escape = true;
						else next_node = knot.nodes[edges[0].to];

					}

					//handle the case where the next point is also a topo point


					
					path = "M "+from.x*inc+" "+from.y*inc+" Q "+control_node.x*inc+" "+control_node.y*inc+" "+next_node.x*inc+" "+next_node.y*inc;

					var p = nested.path(path);
					p.stroke({
						color: colors[edge.seg_id%colors.length],
						width: 4
					});
					p.fill("none");
				}


			}else if(from.kind == "topo"){
				//do nothing, this will be handeled by the other function
			
			}else{
				//this is a normal edge, just draw it.
				path = "M "+from.x*inc+" "+from.y*inc+" L "+to.x*inc+" "+to.y*inc;

				var p = nested.path(path);
				p.stroke({
					color: colors[edge.seg_id%colors.length],
					width: 4
				});
				p.fill("none");

			}
			
		}

		nested.move((k%3)*inc, Math.floor((k/3))*inc);

	}

}

Scene2D.prototype.drawNodes = function(knots){
	console.log("rendering nodes");

	var inc = this.w / 3.;
	var x_offset = 0;
	var y_offset = 0;


	for(k in knots){
		var knot = knots[k];
		var nested = this.draw.nested();

		for(n in knot.nodes){
			var node = knot.nodes[n];
			var c = nested.circle(20);
			c.cx(node.x*inc);
			c.cy(node.y*inc);
			if(node.kind == "topo") c.fill('#555');
			if(node.kind == "ground") c.fill('#000');
			if(node.kind == "power") c.fill('#f00');
			if(node.kind == "analog") c.fill('#00f');
			if(node.kind == "intersection") c.fill('#0f0');
			c.stroke({
				color: '#fff',
				width: 2
			});

			var t = nested.text(""+node.id);
			t.cx(node.x*inc);
			t.cy(node.y*inc);
			t.fill('#fff');
		}
		
		nested.move((k%3)*inc, Math.floor((k/3))*inc);
	}
}

Scene2D.prototype.drawValues = function(knots){
	console.log("drawing values")
	var inc = this.w / 3.;
	var x_offset = 0;
	var y_offset = 0;

	var nested = this.draw.nested();

	for(k in knots){
		var knot = knots[k];

		var text = nested.text(function(add) {
		  add.tspan('AO: '+knot.percents[0]+" / "+(knot.percents[0] - knot.percents[1])).newLine()
		  add.tspan('A1: '+knot.percents[1]+" / "+(knot.percents[1] - knot.percents[2])).newLine()
		  add.tspan('A2: '+knot.percents[2]+" / "+(knot.percents[2] - knot.percents[3])).newLine()
		  add.tspan('A3: '+knot.percents[3]+" / "+(knot.percents[3] - knot.percents[4])).newLine()
		  add.tspan('A4: '+knot.percents[4]+" / "+knot.percents[4]).newLine()
		})

		text.move((k%3)*inc, Math.floor((k/3))*inc);
	}
}








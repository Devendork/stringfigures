

var scene;
var precision = 1000;
var num_segments = 5;
var knots = [];

$( document ).ready(function() {
    console.log( "ready!" );
    scene = new Scene2D($('#renderArea'))

    initUI();
    generateKnots();
    updateRenderer(1, 1, 1);

});

function checkGraphCorrectness(knot){
	console.log('Checking Graph Correctness');
	for(n in knot.nodes){
		var node = knot.nodes[n];
		var edges = getEdgesBeginningAt(knot, node.id);
		if(edges.length > 1) console.log("MULTIPLE NODES BEGINNING AT "+node.id, edges);

		var edges_from = getEdgesEndingAt(knot, node.id);
		if(edges_from.length > 1) console.log("MULTIPLE NODES ENDING AT "+node.id, edges_from);
	}
}

function getEdgesBeginningAt(knot, node_id, pre_intersection){
	var edges = [];

	var all_edges;
	if(pre_intersection) all_edges = knot.edges_before_intersection;
	else all_edges = knot.edges;

	for(e in all_edges){
		if(all_edges[e].from == node_id) edges.push(all_edges[e]);
	}

	return edges;
}

function getEdgesEndingAt(knot, node_id, pre_intersection){
	var edges = [];
	var all_edges;

	if(pre_intersection) all_edges = knot.edges_before_intersection;
	else all_edges = knot.edges;

	for(e in all_edges){
		if(all_edges[e].to == node_id) edges.push(all_edges[e]);
	}

	return edges;
}

function getEdgesWith(knot, node_id){

	var edges_from = getEdgesBeginningAt(knot, node_id, false);
	var edges = edges_from.concat(getEdgesEndingAt(knot, node_id, false));

	return edges;
}

function dist(p1, p2){
	var raw = Math.sqrt(Math.pow(p2.x - p1.x,2) + Math.pow(p2.y - p1.y, 2));
	return Math.floor(raw*1000) / 1000;

}

function slope(x1, y1, x2, y2) {
	if (x1 == x2){ return false;
		console.log("line of 0 length");
	}
	return (y1 - y2) / (x1 - x2);
}

// Check the direction these three points rotate
function RotationDirection(p1x, p1y, p2x, p2y, p3x, p3y) {
  if (((p3y - p1y) * (p2x - p1x)) > ((p2y - p1y) * (p3x - p1x)))
    return 1;
  else if (((p3y - p1y) * (p2x - p1x)) == ((p2y - p1y) * (p3x - p1x)))
    return 0;
  
  return -1;
}

function containsSegment(x1, y1, x2, y2, sx, sy) {
  if (x1 < x2 && x1 < sx && sx < x2) return true;
  else if (x2 < x1 && x2 < sx && sx < x1) return true;
  else if (y1 < y2 && y1 < sy && sy < y2) return true;
  else if (y2 < y1 && y2 < sy && sy < y1) return true;
  else if (x1 == sx && y1 == sy || x2 == sx && y2 == sy) return true;
  return false;
}

function hasIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  var f1 = RotationDirection(x1, y1, x2, y2, x4, y4);
  var f2 = RotationDirection(x1, y1, x2, y2, x3, y3);
  var f3 = RotationDirection(x1, y1, x3, y3, x4, y4);
  var f4 = RotationDirection(x2, y2, x3, y3, x4, y4);
//  console.log(f1, f2, f3, f4);
  
  // If the faces rotate opposite directions, they intersect.
  var intersect = f1 != f2 && f3 != f4;
  
  // If the segments are on the same line, we have to check for overlap.
  if (f1 == 0 && f2 == 0 && f3 == 0 && f4 == 0) {
    intersect = containsSegment(x1, y1, x2, y2, x3, y3) || containsSegment(x1, y1, x2, y2, x4, y4) ||
    containsSegment(x3, y3, x4, y4, x1, y1) || containsSegment(x3, y3, x4, y4, x2, y2);
  }
  
  return intersect;
}


function generateKnots(){
	
	// function jiggerPoint(x){
	// 	if(x < .99) return (x+.01);
	// 	else return (x-.01)
	// }

	//generate a random number of points
	function numPoints(point_range){
		return Math.floor(Math.random() * (point_range[1] - point_range[0]) + point_range[0]);
	}

	function placePoints(knot, num_points){
		var n, last, e;

		for(var i = 0; i < num_points; i++){
			
			n = {
				id: i,
				kind: "topo",
				x: Math.floor(Math.random()*precision)/precision,
				y: Math.floor(Math.random()*precision)/precision
			};

			if(i == 0){
				n.kind = "power";
				knot.analog.push(n.id);
			} 

			knot.nodes.push(n);

			if(i != 0){
				e = {
					id: knot.edges.length,
					seg_id: 0,
					from: i-1, 
					to: i};

				knot.edges.push(e);

			}

			last = n;
		}

		n = {
			id: num_points, 
			kind: "ground",
			x: knot.nodes[0].x,
			y: knot.nodes[0].y,
		}

		knot.nodes.push(n);

		e = {
			id: knot.edges.length,
			seg_id: 0,
			from: last.id, 
			to: n.id
		}

		knot.edges.push(e);
		knot.power = 0;
		knot.ground = n.id;
	}

	function calcIntersection(x1, y1, x2, y2, x3, y3, x4, y4){
		var ua, ub, denom = (y4 - y3)*(x2 - x1) - (x4 - x3)*(y2 - y1);
	    if (denom == 0) {
	        return null;
	    }
	    ua = ((x4 - x3)*(y1 - y3) - (y4 - y3)*(x1 - x3))/denom;
	    ub = ((x2 - x1)*(y1 - y3) - (y2 - y1)*(x1 - x3))/denom;
	    return {
	        x: x1 + ua*(x2 - x1),
	        y: y1 + ua*(y2 - y1)
	    };
	}


	function addIntersections(knot){
		var e1, e2, b, p1, p2, p3, p4;
		var num_edges = knot.edges.length;

		function sharesPoint(knot, e1, e2){
			if(e1.to == e2.from) return true;
			if(e1.from == e2.to) return true;
			if(e1.from == e2.from) return true;
			if(e1.to == e2.to) return true;

			if((e1.to == knot.ground || e1.from == knot.power) && (e2.to == knot.ground || e2.from == knot.power)) return true;
			return false;
		}

		for(var i = 0; i < num_edges; i++){
			e1 = knot.edges[i];
			
			for(var j = i+1; j < num_edges; j++){
				e2 = knot.edges[j];

				//eliminate edges that share a point
				if(!sharesPoint(knot, e1, e2)){
					p1 = knot.nodes[e1.from];
					p2 = knot.nodes[e1.to];
					p3 = knot.nodes[e2.from];
					p4 = knot.nodes[e2.to];

					b = hasIntersection(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);

					if(b){
						console.log(b, p1.id+"-"+p2.id, p3.id+"-"+p4.id);
						var ip = calcIntersection(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
						addIntersectionNode(knot, e1, e2, ip);
					}

				}
			}

		}
	}

	function makeDistancesRelative(knot){
		var total = 0, last, one, n1, n2, edge;

		//assign and total original distances
		for(e in knot.edges){
			edge = knot.edges[e];
			n1 = knot.nodes[edge.from];
			n2 = knot.nodes[edge.to];
			edge.d = dist(n1, n2);
			total += edge.d;
		}

		//divide each edge distance by total distance
		for(e in knot.edges){
			edge = knot.edges[e];
			edge.d /= total;
			edge.d = Math.floor(edge.d * precision) / precision;
		}

		//sanity check that all edges total 1
		total = 0;
		for(e in knot.edges){
			edge = knot.edges[e];
			total += edge.d;
		}

		//console.log("should be 1 ", total);
	}

	function addIntersectionNode(knot, e1, e2, ip){


			var new_node = {
				id: knot.nodes.length,
				kind: "intersection",
				x: ip.x,
				y: ip.y
			}

			knot.nodes.push(new_node);
			new_node.x = Math.floor(precision*new_node.x)/precision;
			new_node.y = Math.floor(precision*new_node.y)/precision;
			// console.log("adding new node ", new_node.id, "between ", e1.from, e1.to);
			// console.log("adding new node ", new_node.id, "between ", e2.from, e2.to);

			var e1_to_node_ratio = dist (knot.nodes[e1.from], ip) / dist(knot.nodes[e1.from],knot.nodes[e1.to]);

			e1_to_node = {
				id: e1.id,
				seg_id: e1.seg_id,
				from: e1.from,
				to: new_node.id,
				d: Math.floor(precision*e1_to_node_ratio*e1.d)/precision
			}

			e1_from_node = {
				id: knot.edges.length,
				seg_id: e1.seg_id,
				from: new_node.id,
				to: e1.to,
				d: Math.floor(precision*(1-e1_to_node_ratio)*e1.d)/precision
			}


			//delete (overwrite) the old edge and replace it with two new edges
			knot.edges[e1.id] = e1_to_node;
			knot.edges.push(e1_from_node);

			var e2_to_node_ratio = dist (knot.nodes[e2.from], ip) / dist(knot.nodes[e2.from],knot.nodes[e2.to]);

			e2_to_node = {
				id: e2.id,
				seg_id: e2.seg_id,
				from: e2.from,
				to: new_node.id,
				d: Math.floor(precision*e2_to_node_ratio*e2.d)/precision
			}

			e2_from_node = {
				id: knot.edges.length,
				seg_id: e2.seg_id,
				from: new_node.id,
				to: e2.to,
				d: Math.floor(precision*(1-e2_to_node_ratio)*e2.d)/precision
			}


			knot.edges[e2.id] = e2_to_node;		
			knot.edges.push(e2_from_node);
	}

	function addNodeOnEdgeRelative(knot, kind, edge_id, ratio_from_start_to_point){
		var from, to, new_node, edge, edge_to_node, edge_from_node;

		edge = knot.edges[edge_id];
		from = knot.nodes[edge.from];
		to = knot.nodes[edge.to];


		//create the node and add it to nodes list
		new_node = {
			id: knot.nodes.length,
			kind: kind,
			x: (1-ratio_from_start_to_point)*from.x + ratio_from_start_to_point*to.x,
			y: (1-ratio_from_start_to_point)*from.y + ratio_from_start_to_point*to.y
		}

		new_node.x = Math.floor(precision*new_node.x)/precision;
		new_node.y = Math.floor(precision*new_node.y)/precision;

		knot.nodes.push(new_node);
		if(kind == "analog") knot.analog.push(new_node.id);


		//console.log("adding new node ", new_node.id, "between ", from.id, to.id, "edge id", edge_id);

		//delete (overwrite) the old edge and replace it with two new edges
		edge_to_node = {
			id: edge_id,
			seg_id: edge.seg_id,
			from: edge.from,
			to: new_node.id,
			d: Math.floor(precision*ratio_from_start_to_point*edge.d)/precision
		}

		edge_from_node = {
			id: knot.edges.length,
			seg_id: edge.seg_id,
			from: new_node.id,
			to: edge.to,
			d: Math.floor(precision*(1-ratio_from_start_to_point)*edge.d)/precision
		}


		knot.edges[edge_id] = edge_to_node;
		knot.edges.push(edge_from_node);


		return new_node.id;
	}



	//split the rope into num_segments equal sized segments
	//add "points" to begin and end segments 
	function addAnalogNodes(knot, num_segments){
		
		var target_length = 1.0 / num_segments;
		var remaining_target_length = target_length;
		var scanning = true;
		var node_id = 0;


		var test = 0;
		var seg_id = 0;
		while(node_id != knot.ground){

			var edges = getEdgesBeginningAt(knot, node_id, false);
			var edge = edges[0];
			edge.seg_id = seg_id;

			if(edges.length > 1) console.log("ERROR, multiple edges beginning at "+edge.id);
			
			if(remaining_target_length < edge.d){
				//console.log("tl < sl ", remaining_target_length, edge.d);
				
				//advance to the new node and start counting from there
				node_id = addNodeOnEdgeRelative(knot, "analog", edge.id, (remaining_target_length/edge.d));

				//since we ate the whole segment, we're not looking for the next whole segment, starting from the new point
				remaining_target_length = target_length;
				seg_id ++;

			
			}else if(remaining_target_length == edge.d){
				//console.log("tl = sl ", remaining_target_length, edge.d);

				node_id = edge.to;
				if(node_id != knot.ground) knot.nodes[node_id].kind = "analog";
				knot.analog.push(node_id);
				
				//update it to suggest we're looking for the next full length
				remaining_target_length = target_length;
				seg_id++;

			}else{
				//console.log("tl > sl ", remaining_target_length, edge.d);

				node_id = edge.to;

				//update the reamining bit of the target we're looking for
				remaining_target_length -= edge.d;

			}
		}

		//console.log("total analog segments", knot.analog.length);
		//console.log("reamining target length (should be 0) = ", remaining_target_length);
	}


	//called once for each segment
	function shortestPath(knot, start){

		var node_list = [];
		var cur_node = -1;
		var visited = [];

		//write all the ndes into a list
		for(n in knot.nodes){
			var node = {
				node: knot.nodes[n],
				value: 1000,
				last_visited: -1,
				visited: false,
			};

			node_list[n] = node;

			if(n == start){
				node.value = 0; 
			}
		}

	
		while(visited.length <= node_list.length){

			//select the mode with the lowest value
			for(n in node_list){
				var node = node_list[n];
				var min = 1000;
				if(!node.visited){
					if(node.value < min){
						min = node.value;
						cur_node = n;
					} 
				}
			}

			visited.push(cur_node);
			node_list[cur_node].visited = true;


			var edges = getEdgesWith(knot, cur_node);
			
			//assign distance values to neighbors
			for(e in edges){
				var edge = edges[e];
				var value = node_list[cur_node].value + edge.d;

				if(edge.to != cur_node){
					if(value < node_list[edge.to].value){
						node_list[edge.to].value = value;
						node_list[edge.to].last_visited = cur_node;
					} 	
				} else{
					if(value < node_list[edge.from].value){
						node_list[edge.from].value = value;
						node_list[edge.from].last_visited = cur_node;
					}  
				}
			}

		}

		//get the path
		var path = [];
		var path_node = knot.ground;

		//create the path to see if you want :) 
		while(path_node != start){
			path.push(path_node);
			path_node = node_list[path_node].last_visited;
		}

		path.push(start);
		knot.paths.push(path);

		return node_list[knot.ground].value;





	}

	function withinRatios(knot){


		for(r in params.ratios){
			var range = params.ratios[r];
			if(knot.percents[r] < range[0] || knot.percents[r] > range[1]){
			 return false;
			}
		}

		return true;
	}

	function singleKnot(point_range, num_analog_nodes){

		var knot = {
			nodes: [], //a list of nodes with id, kind, x, and y
			edges: [], //a list of edges with from, to, and associated weight
			analog: [], //a list of id's for indexing the Analog Output Points
			power: -1, //id of the node that corresponds to power
			ground: -1, //id of node that corresponds to ground
			paths: [],	//the paths from each analog node to ground
			percents: []
		}


		var num_points = numPoints(point_range);

		placePoints(knot, num_points);
		
		makeDistancesRelative(knot);

		addAnalogNodes(knot, num_analog_nodes);


		//make a deep copy of the edge graph for the sake of rendering later
		var edge_copy = [];
		for(e in knot.edges){
			var new_edge = {
				id: knot.edges[e].id,
				to: knot.edges[e].to,
				from: knot.edges[e].from,
			}
			edge_copy.push(new_edge);
		}


		knot.edges_before_intersection = edge_copy;

		addIntersections(knot);


		console.log("analog", knot.analog)

		for(a in knot.analog){
			a_id = knot.analog[a];
			
			//get the total distance from this to ground
			var d = shortestPath(knot, a_id);

			//the ratio is this d / max d for this position
			var ratio = d / ((num_analog_nodes-a)/num_analog_nodes);
			var percent = Math.floor(ratio * 100);
			
			knot.percents.push(percent);
			console.log("A"+a+ ": "+ percent+"%");
			console.log("Path"+a+ ": ", knot.paths[a]);
		}


		return knot;
	}

	var tests = 0;

	do{
		knot = singleKnot(params.points, params.segments);
		var ps = knot.percents;

		if(withinRatios(knot))knots.push(knot);

		tests++;

	}while(knots.length < params.show && tests < params.iterations);
	// for(var i = 0; i < num_knots; i++){
	// 	knots.push(singleKnot(6, 5));
	// }


}






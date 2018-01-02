This is code for a custom GUI that helps me predict the resistance outcomes of a custom-yarn based sensor. The sensor is a knitted rope made from silver yarn and wool. The rope is created around a core that, internally, has five unique contact points with outer silver rope. This allows resistance readings to be captured along various lengths of the yarn. As you cross the yarns and make various knots, differenet resistance "signatures" are produced. I wrote this GUI to help me understand the topology of the yarn for any range of resistance signatures and to see if there are any assumptions I can make about the sensors topology based on those resistances. 

**ALGORITHM**

	While s < Show || i < Iterations

	Randomly generate between minPoints and maxPoints points in a 2D plane. 
	Create a closed path connecting those points
	(the order in which those points are drawn determines the topology, e.g. 0->1->2 etc)

	Split the path into N segments. Add nodes that split existing edges to nodelist. 

	Check all edges for intersection, create new nodes and edges for intersections.

	Calculate the shortest path from each segment to "ground" (e.g. the first point). 

	Percentage P = path (shortest path) / max_path (the length when there are no crossings, aka longest possible path);

	If all values P are within specified ranges, push to "show"  


**CONTROLS**

_Interface_
- Update - generates a new set of string figures
- Show Original - shows the topology of the knot upon which values were caulculated. The colored regions along the path mark each unique "segment" that produces a resistance calcuation.
- Show Nodes - shows the points along the knot that are meaningful. The Black node is power. Grey nodes demarkate the starting points of indvidiual segments. 
- Show Curve - generates a more knot-like aesthetic representation based on the original topology. 

_Ratio Settings_
- The sliders allow the user to specify the range of resistances that are permissible within each segment. They range from 0% to 100%. A value of 100% means that this section of the yarn has not knots or places where the yarn crosses between its starting point and ground (e.g. each segment overlaps the other longer segments). A value of less than 100% means that there is likely an intersection between this segment and ground. Due to minor computation errors, a value of 98% or higher also carries the same meaning as a value of 100. 

_Knot Settings_
- Show - specifies the number of knots that meet the resistance criteria to show on screen
- Segments - specifies the number of segments along the rope (TODO: this does not update the ratiosettings)
- Iterations - specifies how many iterations of the knot generation algorithm will be run before timeout
- Points - specifies the min and max number of control points used to generate the ropes topology.  

**TO DO**
1. Fix intersection bug that occurs with some knots. Presumed to be when itersection is on an endpoint.
2. Rewrite algorithm to evolve shapes that are close to specified resistance targets instead of random search

 

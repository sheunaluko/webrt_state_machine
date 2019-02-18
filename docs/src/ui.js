import {params} from "../module_resources/global_params.js" 
import {util}     from "../module_resources/utils.js" 
import base_node  from "./base_node.js"



function make_y_series(len) { 
    return Array(len).fill(0) 
}

function make_x_series(len) { 
    return util.range(-len, 0).map( x => x/100 ) // the /100 is hax for now for streaming
}

function create_static_multi_line_graph(container,opts) { 
	var { xs, ys , title  } = opts 
	
	//will use indeces for x arrays if not provided 
	if (! xs ) { 
		xs =  [] 
		for (var i =0; i< ys.length ; i ++)  { 
			xs.push(util.range(0, ys[0].length ) ) 
		}
	}

	var source = new Bokeh.ColumnDataSource( {
	data : {xs : xs, ys : ys }
    })
    
    // make the plot and add some tools
    //var tools = "pan,crosshair,wheel_zoom,box_zoom,reset,save";

    // WOW ! -- how lucky to find sizing_mode : stretch_both lmao 
    // https://github.com/bokeh/bokeh/issues/4958
    
    var p = Bokeh.Plotting.figure({ title: title,sizing_mode : 'stretch_both' })
    
    //add the multiline 
    var glyph = p.multi_line({ field: "xs" }, { field: "ys" }, {
		source: source,
		line_color: util.get_colors(xs.length)
    }) 
    
    var tooltips = [
	["x"    , "$x" ]  , 
	["y"    , "$y" ] 
    ]

    p.add_tools(new Bokeh.HoverTool({tooltips : tooltips , line_policy : "next"} ) ) 
	
	var el = container
	if (typeof container == 'string') { 
		el = document.getElementById(container)
	}
	while  (el.firstChild) { el.removeChild(el.firstChild)}
	Bokeh.Plotting.show(p, el)
    return { plot : p , glyph : glyph , source : source } 
} 

function create_multi_line_graph(opts) { 
    var { x_len, series_array, title  } = opts 
    var series_len = series_array.length 
    
    //make xs and ys vector 
    var xs = [] 
    var ys = [] 
    for (var i =0 ;i < series_len ; i++) { 
	xs.push(make_x_series(x_len))
	ys.push(make_y_series(x_len))
    } 
    
    //make data source 
    var source = new Bokeh.ColumnDataSource( {
	data : {xs : xs, ys : ys }
    })
    
    // make the plot and add some tools
    //var tools = "pan,crosshair,wheel_zoom,box_zoom,reset,save";

    // WOW ! -- how lucky to find sizing_mode : stretch_both lmao 
    // https://github.com/bokeh/bokeh/issues/4958
    
    var p = Bokeh.Plotting.figure({ title: title,sizing_mode : 'stretch_both' })
    
     
    //add the multiline 
    var glyph = p.multi_line({ field: "xs" }, { field: "ys" }, {
	source: source,
	line_color: util.get_colors(series_len)
    }) 
    
    var tooltips = [
	["x"    , "$x" ]  , 
	["y"    , "$y" ] 
    ]

    p.add_tools(new Bokeh.HoverTool({tooltips : tooltips , line_policy : "next"} ) ) 
    
    //NEXT STEP -- > NEXT STEP -- > NEXT STEP -- > NEXT STEP -- > NEXT STEP -- > 
    //Need to call Bokeh.Plotting.show(p , HTMLelement) 
    return { plot : p , glyph : glyph , source : source } 
	     
    
} 



// Figured out this function by looking at bokeh source code 
var bokeh_multi_stream = function(ds, x, ys) { 
    var data = ds.data 
    var xss = data.xs
    var yss = data.ys 
    // make modifications 

    for(var i=0;i<yss.length;i++) {
	
	//NOTE* if one of the y values is false (or undefined) , then the assumption is that 
	//the series at that index should NOT BE updated 
	//Sensors in rosegait return false when they wish NOT to be updated 
	
	if (ys[i]) {
	    // -  
	    xss[i].push(x)
	    xss[i].shift()

	    // -  
	    yss[i].push(ys[i])
	    yss[i].shift()
	    
	} 
    }
    // re assign the data 
    data.xs = xss 
    data.ys = yss 
    ds.setv('data', data, {
        silent: true
    });
    
    return ds.trigger('stream');
}

// < -- START CLASS DEFINITIONS -- START CLASS DEFINITIONS -- START CLASS DEFINITIONS -- > 

/* 
 * A bokeh real time, multi line graph 
 *  
 */
class Graph { 
    constructor(opts) { 
	var {series_vector, title } = opts 
	this.parent = null 
	this.opts = opts
	this.series_vector = series_vector 
	console.log("Graph with Len : " + opts.x_len)
	
	var multi_opts = { x_len : opts.x_len || params.global_x_len , 
			   title : title ,
			   series_array : series_vector } 
	
	var  {plot , glyph , source} = create_multi_line_graph(multi_opts) 
	
	var color = "#e5efff" // "white" //"#003559" //"#B9D6F2"
	var alpha = 0.2 
	plot.background_fill_color = color
	plot.background_fill_alpha = alpha

	plot.border_fill_color = color
	plot.border_fill_alpha = alpha

	this.multi_line_graph = plot 
	this.source = source 
	this.glyph  = glyph 
	
    } 
    
    get_data_source() { 
	return this.source 
    } 
    
    render_into_element(el) { 
	//el.innerHTML = 'waiting'
	//this.parent = el 
	Bokeh.Plotting.show(this.multi_line_graph, el) 
    } 
    
}


 class ui { 
    
    /* 
     * 
     * @param {HTMLElement} parent - The DOM to render the UI into 
     */ 
    constructor(parent) { 
	this.graphs = {} 
	this.parent = parent 
	this.last_series_buffer = {} // holds the previous update sent to graph 
    } 

    /* 
     * Add graph to the ui 
     * @param {Object} opts - Dict containing fields: id - graph id , series_vector - vector of Ids for series which will be graphed on this graph 
     */
    add_graph(opts) { 
	var {id, series_vector, x_len} = opts
	//console.log(series_vector)
	var graph = new Graph( {series_vector : series_vector, 
				x_len : x_len , 
				title  : id + ": " + series_vector.join(", ")} )   
			       
	this.graphs[id] = graph 
    } 
    
    /* 
     *
     * After all graphs have been added, init is called to actually display the graphs 
     *
     */
    init(container) { 
	// logic for displaying all of the added graphs 
	// should make a panel view of sorts and initialize with empty values 
	var graph_array = util.dict_2_vec(this.graphs) 	
	this.graph_array = graph_array  
	
	// for now will put two graphs side by side 
	var n_cols = 2 
	var n_rows = Math.ceil(Object.keys(this.graphs).length/2) 
	
	// some hax  
	if (graph_array.length == 1 ) { 
	    n_cols = n_rows = 1 
	} 
	
	util.bug("n_row" , n_rows) 
	
	// make a grid of divs 
	var app_el = util.make_div_array(n_rows,n_cols,"rgui",function(r,c,el) { 
	    //get the graph index
	    var index = util.id_from_loc(r,c,n_cols)
	    // debug - console.log( [index, graph_array] )
	    
	    if (index < graph_array.length ) { 
		//get the graph info using destructuring 
		var [id , graph] = graph_array[index] 
		graph.render_into_element(el) 
	    } else { 
		
		return "" 
		
	    }
	    
	})
	
	//here we will resolve the container 
	if ( typeof container == 'string' )  { 
	    container = document.getElementById(container) 
	}  // if not for now assume it is the element 
	
	//render the 
	app_render(container,app_el)

    } 

    /* 
     * Streams data to a particular graph defined by graph_id. 
     * @param {Number} x - The x coordinate for new data 
     * @param {Vector} ys - New y points to add. These should correspond to and be in the same order as the series_vector assoiated with the same graph id
     */
    stream_to_graph(id , x , ys ) { 
	bokeh_multi_stream(this.graphs[id].get_data_source(), x , ys ) 
    }
    
    /* 
     * Main data handler. 
     * @param {Object} series_buffer - Dictionary with all the series values for updating
     */
    handle_sensor_buffer(x,series_buffer) { 
	
	
	//1) loop through the available graphs
	for (var graph in this.graphs ) { 
	    var series, ys , i , val 
	    //2) get the series_vector for that graph 
	    series = this.graphs[graph].series_vector 
	    //3) look up the values for each series in the sensor_gui_buffer
	    ys = Array(series.length).fill(0)
	    for (i = 0 ; i < series.length ; i++ ) { 
		//get the value of the series 
		val =  series_buffer[ series[i] ]  
		
		//if it is false we pass it anyways (graph will handle it) 
		ys[i] = val 
	    }
	    //update the graph 
	    
	    bokeh_multi_stream(this.graphs[graph].get_data_source(), x , ys )

	    
	}

    }
	
	
    static multi_line_graph(container, opts) { 
	create_static_multi_line_graph(container, opts) 
    }
    

}




var app_el =  null 

var app_clear = function() { 
    while (app_el.firstChild) {
	app_el.removeChild(app_el.firstChild)  
    }   
}

var app_render = function(container,el) { 
    if (app_el) { 
	app_clear() 
    } else { 
	container.appendChild(el)
	app_el = container
    }
}


// FOR ARBITRARY GRAPHING -----------------------------------------------                                                   
function dict_to_update(dict) { 
    return dict 
}

function get_array_series(o) {
    //console.log(o)
    return util.range(0,o.length).map(v=>"index_" + v)
}

function get_dict_series(d) { 
    var ret
    var list = Object.keys(d) 
    //return list   -- allows toggling the removal of time key from object
    var ind = list.indexOf('time') 
    if (ind >= 0 ) { 
	list.splice(ind , 1 ) 
	ret = list 
    } else { ret = list } 
    return ret 
} 

function array_to_update(arr) { 
    let ser = get_array_series(arr)
    return util.zip_map(ser, arr)
}


function make_graph_for_obj(opts) { 
    var {o, container, x_len} = opts 
    var graph_ui = new ui()
    var series   = null 
    //console.log(o)
    if (typeof o == "object") { 
	if (Array.isArray(o)) {
	    // its an array
	    console.log("Making array grapher")
	    series = get_array_series(o) 
	    graph_ui.convert = array_to_update
	} else {
	    // assume its a dict
	    console.log("Making dict grapher")
	    series = get_dict_series(o) 
	    graph_ui.convert = dict_to_update
	}
    }
    
    graph_ui.add_graph({id  :"main", series_vector:  series, x_len : x_len || 500})
    graph_ui.init(container) 
    graph_ui.init_time = util.now()
    return graph_ui 
}


function graph_object(x,o,graph_ui) { 
    let updates = graph_ui.convert(o) 
    //console.log(updates)
    //apply the updates to the graph 
    graph_ui.handle_sensor_buffer((x-graph_ui.init_time)/1000,updates)  // should work???
}


function get_object_grapher(opts) { 
    var {container, x_len} = opts 
    var grapher = {}
    grapher.init = true 
    grapher.graph_ui = null 
    
    grapher.process_data = function(o) { 
	if (grapher.init) { 
	    grapher.graph_ui = make_graph_for_obj({o,container,x_len})
	    grapher.init = false 
	} else { 
	    var t = util.now()
	    //console.log(o)
	    graph_object(t,o,grapher.graph_ui)
	}
    }
    
    return grapher
}


 class ui_object_grapher extends base_node { 
    constructor(opts) { 
	let node_name = "UIG"
	let is_sink = true 
	super({node_name, is_sink })
	
	let main_handler = function(payload) { 
	    this.object_grapher.process_data(payload) 
	} 
	this.configure({main_handler}) 
	this.object_grapher = get_object_grapher(opts) 	

	
    } 
} 


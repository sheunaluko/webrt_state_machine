//Tue Oct  2 10:12:11 PDT 2018

import {makeLogger} from "./logger.js"
import util from "../module_resources/utils.js"

/**
 * 
 * 
 */

export default class raw_analyzer {

    /**
     * Provides insights and attributes about raw data stream. 
     * e.g. checks for dropped samples 
     */ 
    constructor() { 
	this.data_history  =  [] 
	this.log = makeLogger("RA")
    } 
    
    /**
     * Processes a data packet 
     * @param {Object} obj - Data object to process 
     */ 
    process_data(obj) { 
	this.data_history.push(obj) 
	this.log("Received data!") 
    } 
    
    /**
     * Produce report (logged to console for now) 
     */ 
    produce_report() { 
	var data_buffer = this.data_history 
	var report = get_report(data_buffer) 
	this.log("Printing report: " ) 
	this.log(JSON.stringify(report) ) 
	return report 
    } 
    
    /**
     * (UNSTABLE ) Show ditribution for field  
     */ 
    dist_field(f) { 
	//clear_plot_div() 
	
	var data = this.data_history.map( e => e[f] ) 
	
	g_hist(data,"Distribution for: " + f)     
	
    }

    /**
     * (UNSTABLE) Show time series for field 
     */ 
    line_field(f) { 
	var data = this.data_history.map( e => e[f] ) 
	g_line(data,"Time series for: " + f)     
	
    }

    
} 



function get_field_average(obj_array,f) { 
    return  utils.avg(obj_array.map( obj => obj[f] )) 
} 




function get_report(data_buffer) { 
    return { 
	    'len'       : data_buffer.length  , 
	    'acc_x_avg' : get_field_average(data_buffer, "acc_x"), 
	    'acc_y_avg' : get_field_average(data_buffer, "acc_y"), 
	    'acc_z_avg' : get_field_average(data_buffer, "acc_z"), 
	    'gyr_x_avg' : get_field_average(data_buffer, "gyr_x"), 
	    'gyr_y_avg' : get_field_average(data_buffer, "gyr_y"),
	    'gyr_z_avg' : get_field_average(data_buffer, "gyr_z") 	    
    }
} 


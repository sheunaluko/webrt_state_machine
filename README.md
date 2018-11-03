# webrt_state_machine
Web Realtime State Machine, or WRTSM, is a javascript library built for protyping and implementing real time detection and feedback systems. 
Data is piped in realtime via websockets into a configurable state machine, which allows visualization of both raw and derived data features. 
Both raw data and derived features trigger state transitions through arbitrarily defined "detectors" and "applicators", which allows for the implementation of various feedback and detection systems. 
Check out the documentation for more information, or get started below!

![](wrtsm.gif)


## Getting Started 

Simply include the wrtsm.js file in your html, and tell wrtsm which DOM node you would like to render the UI too. Here is a barebones HTML example to get you started: 
```html
<html>
<head>
  <script type="text/javascript" src="https://cdn.jsdelivr.net/gh/sheunaluko/webrt_state_machine@v0.1-alpha/dist/wrtsm.js"></script>
</head>

<body>
  <div id="wrtsm"></div>
  
  <script> 
           function demo() { 
	       wrtsm.flow.graph_dances() 
	   } 

  	   window.addEventListener("wrtsm_ready", demo ) 
  
  </script> 

</body>

</html>
```
There are three important things to note: 
1. The wrtsm.js library is loaded via the script tag inside <head>, and triggers the event "wrtsm_ready" 
2. The <div> tag creates a container with id="wrtsm" for the UI to be rendered into 
3. The inline <script> listens for the "wrtsm_ready" event and triggers the demo 


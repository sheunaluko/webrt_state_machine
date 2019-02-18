# nFLOW
nFLOW (a.k.a Node Flow) is a javascript library for protyping and implementing real time detection and feedback systems. 
Data is piped in realtime via websockets into a configurable state machine, which allows visualization of both raw and derived data features. 
Both raw data and derived features trigger state transitions through arbitrarily defined "detectors" and "applicators", which allows for the implementation of various feedback and detection systems. 
Check out the documentation for more information, or get started below!

![](wrtsm.gif)


## Getting Started 

Simply include the `nflow.js` file in your html, and tell nFLOW which DOM node you would like to render the UI too. Here is a barebones HTML example to get you started: 
```html
<html>
<head>
  <script type="text/javascript" src="https://cdn.jsdelivr.net/gh/sheunaluko/nFLOW@v0.3-alpha/dist/nflow.js"></script>
</head>

<body>
  <div id="nflow"></div>
  
  <script> 
           function demo() { 
	       nflow.flow.graph_dances() 
	   } 

  	   window.addEventListener("nflow_ready", demo ) 
  
  </script> 

</body>

</html>
```

There are three important things to note: 
1. The `nflow.js` library is loaded via the script tag inside `<head>`, and triggers the event "nflow_ready" when loaded
2. The `<div id="nflow">` tag creates a container for the UI to be rendered into (the demo is set to automatically detect the "nflow" id)
3. The inline `<script>` listens for the window "nflow_ready" event and triggers the demo 

This is what you will see when you open the html page in your web browser: 

![](wrtsm_2.gif)

It is a graph of two sine waves being plotted in real time, with a state machine proccessing every data packet as it arrives. [Check out the documentation](https://wrtsm.readthedocs.io/en/latest/) to learn more about wrtms architecture, or check out the tutorial to get started with using wrtsm for prototyping realtime feedback and detection systems in your browser! 


@Copyright Sheun Aluko, 2019-2020
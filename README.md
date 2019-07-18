# Sankey timeline

JavaScript-based animated Sankey graphs.

## What's in here

* `parse` contains scripts for converting data in 
  Excel files into `json` format.
* `static` 
  * Launch `index.html` to run the animation.
  * `sankey_timeline.animation.*.js` attaches `d3.transition` 
    objects to relevant elements in the DOM. 
  * `sankey_timeline.chart.*.js` draws the elements
    that make up the Sankey diagram (flows, input and
    output boxes, labels, etc.).
  * `sankey_timeline.constants.*.js` contains variables with
    fixed values used throughout the code.
  * `sankey_timeline.data.*.js` contains the data being graphed.
  * `sankey_timeline.funcs.*.js` contains methods used for 
    calculating the geometry of the flows.
  * `sankey_timeline.summary.*.js` calculates summary information
    contained in the data that determines the geometry of the 
    graph.  
	

## Running the Parser locally

`git clone` this repository.

    cd sankey-main-source

Create a virtual environment by running 

    virtualenv venv

### Activate the virtual environment by running:

on Linux/Mac: 

    source venv/bin/activate

on Windows: 

    venv\Scripts\activate

Change the `FILENAME` value with latest XLS file name for the Sankey Diagram in this python file under `parse`:
`sankey-main-source/parse/xls2json.py`

Run the parser by running 

    python xls2json.py    

This generates the required data in `parse` folder named as:
`sankey_timeline.data.v4.js` 

but need to inclose the generated data with to be used by the code: 

    let DATA = [];

i.e. 

    let DATA = [
        {
          "year": 1800,
          "elec": {
            "elec": 0.0,
            "res": 0.0,
            "ag": 0.0,
            "indus": 0.0,
            "trans": 0.0
          },
          ....  
    ];

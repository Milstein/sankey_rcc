const sigfig2 = function sigfig2(n) {
  if (n > 1 && n < 10){
    return Number.parseFloat(n.toPrecision(1));
  }else if (n < 1){// < 1 ~ decimal values
    return Math.round(n);
  } else {
    return Number.parseFloat(n.toPrecision(2));
  }
};

const build_all_graphs = function build_all_graphs(summary) {
  let graphs = graph_y(summary);
  graphs = graph_x(graphs);
  graphs = space_ups_and_downs(graphs);

  for (let i = 0; i < graphs.length; ++i) {
    graphs[i].graph
      .filter(function (g) {
        return g.fuel === 'waste';
      })
      .forEach(function (g, j) {
        //debugger;
        g.a.x = ELEC_BOX[0] + BOX_WIDTH;
        
        g.b.x = g.b.x + LEFT_GAP;
        
        g.a.y = g.a.y - (graphs[i].offsets.y.waste - 20);
        g.b.y = g.a.y;

        // g.d.x = ELEC_BOX[0];
        // g.d.y = (ELEC_BOX[1] -
        //   graphs[i].totals.waste * SCALE + graphs[i].offsets.y.waste);

        // g.c.x = (ELEC_BOX[0] - 20 -
        //   (graphs[i].totals.waste * SCALE - graphs[i].offsets.y.waste) / SR3 -
        //   (FUELS.length - j) * PATH_GAP);
        // g.b.x = (g.c.x - Math.abs(g.a.y - g.d.y) /
        //   SR3);

        if (g.box === 'trans') {
          g.b.x = g.b.x + (TOP_Y + LEFT_GAP) - 20;
          //g.c.x = g.c.x + BOX_WIDTH;
        }
      });
  }
  return graphs;
};

const graph_y = function graph_y(summary) {

  let graphs = [];

  // Loop through years
  for (let i = 0; i < DATA.length; ++i) {
    let graph = [];
    let boxes = [];

    // Track vertical offsets of fuel and electricity stacks
    let left_y = TOP_Y;
    let elec_y = ELEC_BOX[1] - (DATA[i].elec.res + DATA[i].elec.ag +
      DATA[i].elec.indus + DATA[i].elec.trans) * SCALE;

    let waste_y = ELEC_BOX[1] - (DATA[i].waste.res + DATA[i].waste.ag +
      DATA[i].waste.indus + DATA[i].waste.trans) * SCALE;

    let offsets = {
      y: {
        elec: 0, waste: 0, res: 0,
        ag: 0, indus: 0, trans: 0
      },
      x: {
        solar: 0, nuclear: 0, hydro: 0, wind: 0, geo: 0,
        gas: 0, coal: 0, bio: 0, petro: 0
      }
    };

    // Get totals for year being graphed from totals in summary object
    let totals = summary.totals.filter(function (d) {
      return d.year === DATA[i].year;
    })[0];

    let flows = summary.flows.filter(function (d) {
      return d.year === DATA[i].year;
    })[0];

    let half_stroke = null;
    let last_box = null;

    let waste_obj = DATA[i]['waste'];

    // Loop through fuels
    // FIXME: Need to start at 0 and draw electricity first
    for (let j = 0; j < FUELS.length; ++j) {
      let fuel_name = FUELS[j].fuel;
      if (fuel_name !== 'year') {
        let fuel_obj = DATA[i][fuel_name];

        fuel_obj.total = 0;
        // Loop through boxes in 2 object
        for (let k = 0; k < BOX_NAMES.length; ++k) {
          if ((fuel_name === 'elec' && BOX_NAMES[k] === 'elec') || (fuel_name === 'waste' && BOX_NAMES[k] === 'elec') || (fuel_name === 'elec' && BOX_NAMES[k] === 'waste') || (fuel_name === 'waste' && BOX_NAMES[k] === 'waste') || BOX_NAMES[k] === 'waste') {
            // There is no electricity fuel flowing into the electricity box
            continue;
          }
          // Create object for path from fuel to box
          let g = {
            fuel: fuel_name, box: BOX_NAMES[k], stroke: null,
            a: { x: null, y: null },
            b: { x: null, y: null },
            c: { x: null, y: null },
            cc: { x: null, y: null },
            d: { x: null, y: null }
          };

          // Calculate half stroke and increment y-coord counter
          half_stroke = fuel_obj[BOX_NAMES[k]] * SCALE / 2;
          // If first fuel (electricity)
          if (j === 0) {
            elec_y += half_stroke;
            g.a.y = elec_y;
            g.a.x = ELEC_BOX[0] + BOX_WIDTH;
            elec_y += half_stroke;
          } else {
            left_y += half_stroke;
            g.a.y = left_y;
            g.a.x = LEFT_X;

          }
          offsets.y[BOX_NAMES[k]] += half_stroke;
          // Position starting node
          g.stroke = half_stroke * 2;
          g.b.y = g.a.y;

          // Distinguish between electricity box and right-side boxes.
          if (BOX_NAMES[k] === 'elec') {
            // Increment y-offset for electricity box
            g.d.x = ELEC_BOX[0];
            g.d.y = (ELEC_BOX[1] -
              totals.elec * SCALE + offsets.y.elec);

            g.c.x = (ELEC_BOX[0] - 20 -
              (totals.elec * SCALE - offsets.y.elec) / SR3 -
              (FUELS.length - j) * PATH_GAP);
            g.b.x = (g.c.x - Math.abs(g.a.y - g.d.y) /
              SR3);
          } else {
            // Increment y -offset for electricity box
            g.d.x = WIDTH - BOX_WIDTH;
            g.d.y = summary.box_tops[BOX_NAMES[k]] + offsets.y[BOX_NAMES[k]];
          }
          g.c.y = g.d.y;
          // Add bottom half of stroke to offset
          offsets.y[BOX_NAMES[k]] += half_stroke;
          // Increment y-coord counter with rest of stroke
          if (j > 0) {
            left_y += half_stroke;
          }
          last_box = BOX_NAMES[k];
          // Push graph object to list of graph objects
          graph.push(g);
        }
        // Skip down to next fuel box
        if (j > 0) {
          left_y += LEFT_GAP;
        }

      }
    }

    offsets.y['waste'] = offsets.y['elec'];

    // ******************** Uncomment this ***********************//
    // Update x for waste from offset for elec

    // graph.filter(function (d) {
    //         return d.fuel === 'waste';
    //       })
    //       .forEach(function (g, j) {            
    //         g.a.x = ELEC_BOX[0] + BOX_WIDTH;
    //         g.a.y = g.a.y - (offsets.y.waste - 20);
    //         g.b.y = g.a.y;

    //         g.b.x = LEFT_X;
    //       });    
    // ******************** Uncomment this ***********************//
    
    graphs.push({ graph: graph, offsets: offsets, year: DATA[i].year,
      totals: totals, flows: flows });
  }

  return graphs;
};

const graph_x = function graph_x(graphs) {
  graph_x_ups(graphs);
  graph_x_downs(graphs);
  return graphs;
};

const graph_x_ups = function graph_x_ups(graphs) {
  for (let i = 0; i < graphs.length; ++i) {
    let current_box = null;
    // Sort graphs bottom to top boxes, bottom to top fuels.
    graphs[i].graph
      .filter(function (g) {
        return g.a.y > g.d.y && g.box !== 'elec' && g.box !== 'waste';
      })
      .sort(sort_graph_up)
      .forEach(function(g, j) {
        if (g.box !== current_box) {
          graphs[i].offsets.y[g.box] = g.stroke / 2;
          g.c.x = WIDTH - BOX_WIDTH - 20 - g.stroke / 2;
        } else {
          g.c.x = (WIDTH - BOX_WIDTH - 20 -
            (graphs[i].totals[g.box] * SCALE -
              graphs[i].offsets.y[g.box]) / SR3 -
            j * ELEC_GAP * HSR3);
        }
        g.b.x = (g.c.x - Math.abs(g.a.y - g.c.y) / SR3);
        g.cc.x = g.c.x - Math.abs(graphs[i].totals.fuel_height -
            g.c.y) / SR3;
        current_box = g.box;
      });
  }
  return graphs;
};

const graph_x_downs = function graph_x_downs(graphs) {
  for (let i = 0; i < graphs.length; ++i) {
    let current_box = null;
    // Sort graphs top to bottom boxes, top to bottom fuels.
    graphs[i].graph
      .filter(function (g) {
        return g.a.y < g.d.y && g.box !== 'elec' && g.box !== 'waste';
      })
      .sort(sort_graph_down)
      .forEach(function(g, j) {
        if (g.box !== current_box) {
          graphs[i].offsets.y[g.box] = g.stroke / 2;
          g.c.x = WIDTH - BOX_WIDTH - 20 - g.stroke / 2;
        } else {
          g.c.x = (WIDTH - BOX_WIDTH - 20 -
            (graphs[i].offsets.y[g.box]) / SR3 -
            j * ELEC_GAP * HSR3);
        }
        g.b.x = (g.c.x - Math.abs(g.a.y - g.c.y) / SR3);
        g.cc.x = g.c.x - Math.abs(ELEC_BOX[1] - g.c.y) / SR3;
        current_box = g.box;
      });
  }
  return graphs;
};

const space_ups_and_downs = function space_ups_and_downs(graphs) {
  let prev = null;
  let diff = null;
  for (let i = 0; i < graphs.length; ++i) {
    graphs[i].graph.sort(function (a, b) {
      return b.cc.x - a.cc.x;
    });
    graphs[i].graph
      // Don't reposition flows going to the electricity box
      .filter(function (g) {
        return g.box !== 'elec' && g.box !== 'waste';
      })
      .forEach(function (g, j) {
        if (i === 0) {
          //console.log(g.fuel, g.box);
        }
        if (j === 0) { prev = g; return; }
        let path_gap = PATH_GAP * HSR3;
        if (g.stroke === 0) {
          path_gap = 0;
        }
        diff = path_gap - ((prev.cc.x -
          prev.stroke / 2) -
          (g.cc.x + g.stroke / 2));
        g.cc.x -= diff;
        g.c.x -= diff;
        g.b.x -= diff;
        prev = g;
      });
    let max_cc = Math.max.apply(Math, graphs[i].graph.map(
      function (o) {
        return o.cc.x;
      }));
    graphs[i].graph
      .filter(function (g) {
        return g.box !== 'elec' && g.box !== 'waste';
      })
      .forEach(function (g) {
        let diff = max_cc - (WIDTH - BOX_WIDTH - 50);
        g.c.x -= diff;
        g.b.x -= diff;
      });
  }
  return graphs;
};

let sort_graph_up = function sort_graph_up(a, b) {
  if (BOX_NAMES.indexOf(a.box) < BOX_NAMES.indexOf(b.box)) { return 1; }
  if (BOX_NAMES.indexOf(a.box) > BOX_NAMES.indexOf(b.box)) { return -1; }
  if (FUEL_NAMES.indexOf(a.fuel) < FUEL_NAMES.indexOf(b.fuel)) { return 1; }
  if (FUEL_NAMES.indexOf(a.fuel) > FUEL_NAMES.indexOf(b.fuel)) { return -1; }
  return 0;
};

let sort_graph_down = function sort_graph_down(a, b) {
  if (BOX_NAMES.indexOf(a.box) < BOX_NAMES.indexOf(b.box)) { return -1; }
  if (BOX_NAMES.indexOf(a.box) > BOX_NAMES.indexOf(b.box)) { return 1; }
  if (FUEL_NAMES.indexOf(a.fuel) < FUEL_NAMES.indexOf(b.fuel)) { return -1; }
  if (FUEL_NAMES.indexOf(a.fuel) > FUEL_NAMES.indexOf(b.fuel)) { return 1; }
  return 0;
};



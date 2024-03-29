/**
 * Draw title on chart.
 * @param svg
 */
let draw_title = function draw_title(svg1) {

    let svg = d3.select('.title.container')
        //.style('width', WIDTH+'px')
        .style('height', 50 + 'px')
        .append('svg')
        .attr('id', 'title')
        .attr('width', WIDTH)
        .attr('height', 50)
        //responsive SVG needs these 2 attributes and no width and height attr
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${WIDTH} 50`);

    /**
     * Draw title of graph.
     */
    let svg_title = svg.append('text')
        .text('US energy usage in ')
        .attr('text-anchor', 'end')
        .attr('x', ELEC_BOX[0] - 5)
        .attr('y', '1.4em')
        .attr('class', 'title');

    /**
     * Draw units of graph.
     */
    svg_title.append('tspan')
        .text('(Watts per capita)')
        .attr('text-anchor', 'end')
        .attr('x', ELEC_BOX[0] - 7)
        .attr('dy', '1.2em')
        .attr('class', 'unit');

    /**
     * Draw year.
     */
    svg_title.append('tspan')
        .text(DATA[0].year)
        .attr('text-anchor', 'start')
        .attr('x', ELEC_BOX[0])
        .attr('dy', '0em')
        .attr('class', 'year animate')
        .attr('data-incr', 0);

    /**
     * Draw citation info.
     */
    svg.append('text')
        .text('Suits, Matteson, and Moyer, 2019.')
        .attr('x', ELEC_BOX[0] + BOX_WIDTH)
        .attr('y', '1.5em')
        .attr('class', 'citation');

    /**
     * Draw affiliations.
     */
    svg.append('text')
        .text('University of Chicago. Center for Robust ')
        .attr('x', ELEC_BOX[0] + BOX_WIDTH + (WIDTH -
            (ELEC_BOX[0] + BOX_WIDTH)) / 2 - 25)
        .attr('y', '1.5em')
        .attr('class', 'affiliation')
        .append('tspan')
        .text('Decision-making on Climate and Energy Policy.')
        .attr('class', 'affiliation-bottom')
        .attr('x', ELEC_BOX[0] + BOX_WIDTH + (WIDTH -
            (ELEC_BOX[0] + BOX_WIDTH)) / 2 - 25)
        .attr('dy', '1.3em');


    /**
     * Draw Energy Waste checkbox filter.
     */
    svg.append("foreignObject")
        .attr("width", 200)
        .attr("height", 50)
        //.attr('x', ELEC_BOX[0] + BOX_WIDTH + (WIDTH -
        //    (ELEC_BOX[0] + BOX_WIDTH)) / 1.25)
        .attr('x', ELEC_BOX[0] / 3.8)
        .attr('dy', '1.5em')
        //.append("xhtml:body")
        .html("<div class=\"toogleswitch\"><input type=\"checkbox\" id=\"waste_required\" name=\"waste\" class=\"switch filter\"><label for=\"waste_required\">Electricity Waste</label></div>")
        .on("click", function (d, i) {
            change_function();
        });
};

let change_function = function change_function() {
    if ($("#waste_required").prop('checked')) {
        Cookies.set("waste_required", true);
    } else {
        Cookies.set("waste_required", undefined);
    }
    location.reload(true);
};

/**
 * Draw initial input boxes on left side of chart at first timestep
 * @param svg
 * @param totals
 */
let draw_boxes_left = function draw_boxes_left(svg, totals) {
    let top = TOP_Y;
    for (let i = 1; i < FUELS.length; ++i) {
        svg.append('text')
            .text(FUELS[i].name)
            .attr('x', LEFT_X)
            .attr('y', top - 5)
            .attr('class', 'label animate fuel ' + FUELS[i].fuel)
            .attr('data-incr', 0)
            .attr('data-fuel', FUELS[i].fuel)
            .classed('hidden', function () {
                return totals[FUELS[i].fuel] === 0;
            });
        top += totals[FUELS[i].fuel] * SCALE + LEFT_GAP;
    }
};

/**
 * Draw initial output boxes on right side of chart at first timestep.
 * @param svg
 * @param totals
 * @param graph_nest
 * @param summary
 */
let draw_boxes_right = function draw_boxes_right(svg, totals, graph_nest, summary) {
    let boxtops = summary.box_tops;
    //let maxes = summary.maxes;
    BOXES.forEach(function (box) {
        let x = WIDTH - BOX_WIDTH;
        let y = boxtops[box.box];
        if (box.box === 'elec') {
            x = ELEC_BOX[0];
            y = ELEC_BOX[1] - totals.elec * SCALE;
        }
        svg.append('rect')
            .attr('x', x)
            .attr('y', y)
            .attr('width', BOX_WIDTH)
            .attr('height', function () {
                if (totals[box.box] > 0) {
                    return totals[box.box] * SCALE + BLEED;
                }
                return 0;
            })
            .attr('class', 'box sector animate ' + box.box)
            .classed('fuel', function () {
                return box.box === 'elec';
            })
            .attr('data-sector', box.box)
            .attr('data-fuel', function () {
                if (box.box === 'elec') {
                    return 'elec';
                }
            })
            .attr('data-incr', 0);

        // let y12 = y + maxes[box.box] * SCALE;
        // svg.append('line')
        //   .attr('x1', x)
        //   .attr('x2', x + BOX_WIDTH)
        //   .attr('y1', y12)
        //   .attr('y2', y12)
        //   .attr('class', 'maxline');

        let text = svg.append('text')
            .text(function () {
                if (box.box === 'res') {
                    return 'Residential';
                }
                return box.name;
            })
            .attr('x', x)
            .attr('y', y - 5)
            .attr('dy', function () {
                if (box.box === 'res') {
                    return '-1.8em';
                }
                return '-.8em';
            })
            .attr('data-sector', box.box)
            .attr('data-fuel', function () {
                if (box.box === 'elec') {
                    return 'elec';
                }
            })
            .attr('class', 'label sector animate ' + box.box)
            .classed('hidden', function () {
                return totals[box.box] === 0;
            })
            .classed('fuel', function () {
                return box.box === 'elec';
            });
        /**
         * Add /Commercial to residential box
         */
        text.append('tspan')
            .text(function () {
                if (box.box === 'res') {
                    return '/Commercial';
                }
            })
            .attr('x', x)
            .attr('dy', function () {
                if (box.box === 'res') {
                    return '1em';
                }
                return 0;
            })
            .attr('data-incr', 0);
        /**
         * Add numeric totals to output boxes
         */
        text.append('tspan')
            .attr('class', 'total sector animate ' + box.box)
            .attr('data-sector', box.box)
            .attr('data-value', totals[box.box])
            .text(sigfig2(totals[box.box]))
            .attr('x', x)
            .attr('dy', '1.2em')
            .attr('data-incr', 0);

        /**
         * Add waste totals to output boxes
         */
        if (summary.show_waste) {
            text.append('tspan')
                .attr('class', 'total waste-level sector animate ' + box.box)
                .attr('data-sector', box.box)
                .attr('data-value', graph_nest.waste[Object.keys(graph_nest.waste)[0]][box.box])
                .text(sigfig2(graph_nest.waste[Object.keys(graph_nest.waste)[0]][box.box]))
                .attr('data-value', 0)
                .text(sigfig2(0))
                .attr('x', x + BOX_WIDTH)
                .attr('dy', 0)
                .attr('text-anchor', 'end')
                .attr('data-incr', 0);
        }
    });
};

const get_fuel_name = function get_fuel_name(fuel) {
    if (fuel === 'waste') {
        return "Electricity Waste";
    }
    for (let i = 0; i < FUELS.length; ++i) {
        if (FUELS[i].fuel === fuel) {
            return FUELS[i].name;
        }
    }
};

const get_sector_name = function get_sector_name(box) {
    for (let i = 0; i < BOXES.length; ++i) {
        if (BOXES[i].box === box) {
            return BOXES[i].name;
        }
    }
};

const draw_flows = function draw_flows(svg, k, div) {
    // Draw contents of graph object
    // Loop through fuel objects in graph object
    for (let i = 0; i < graphs[k].graph.length; ++i) {
        // Loop through boxes
        // Suppress paths without nodes FIXME: this is only for testing
        if (graphs[k].graph[i].b.x === null) {
            continue;
        }
        // Set line styles
        svg.select('.fuel.' + graphs[k].graph[i].fuel)
            .append('path')
            .attr('d', line(parse_line(graphs[k].graph[i])))
            .attr('stroke-width', function () {
                if (graphs[k].graph[i].stroke > 0) {
                    return graphs[k].graph[i].stroke + BLEED;
                }
                return 0;
            })
            .attr('data-fuel', graphs[k].graph[i].fuel)
            .attr('data-sector', graphs[k].graph[i].box)
            .attr('data-incr', 0)
            .attr("stroke-linejoin", function () {
                if (graphs[k].graph[i].fuel !== 'waste') {
                    return "round";
                }
            })
            .attr('class', 'flow animate ' + graphs[k].graph[i].fuel + ' ' + graphs[k].graph[i].box)

            .on('mouseover', d => {
                div
                    .transition()
                    .duration(200)
                    .style('opacity', 0.9);
                div
                    .html(get_fuel_name(graphs[k].graph[i].fuel) + " → " + get_sector_name(graphs[k].graph[i].box) + "<br/>" + sigfig2(graphs[k].graph[i].value))
                    .style('left', d3.event.pageX + 'px')
                    .style('top', d3.event.pageY - 28 + 'px');
            })
            .on('mouseout', () => {
                div
                    .transition()
                    .duration(500)
                    .style('opacity', 0);
            });
    }
};

const draw_initial_graph = function draw_initial_graph(svg, graph_nest, div) {
    const k = 0;
    draw_flows(svg, k, div);
    draw_boxes_left(svg, graphs[k].totals);
    draw_boxes_right(svg, graphs[k].totals, graph_nest, summary);
    return true;
};

/**
 * Parse x- and y-coords into <svg> line using d3.js
 * @param obj
 * @returns {*[]}
 */
const parse_line = function (obj) {
    return [obj.a, obj.b, obj.c, obj.d];
};

/**
 * Draw <svg> line using d3.js
 */
const line = d3.line()
    .x(function (d) {
        return d.x;
    })
    .y(function (d) {
        return d.y;
    });

// const animate = function animate() {
//   let i = parseInt(d3.select(this).attr('data-incr'));
//   if (i === graphs.length - 1) {
//
//   }
//   let j = i + 1;
//   let n = graphs[j].year - graphs[i].year;
//   let d = n * SPEED;
//   d3.select(this).transition()
//     .duration(d)
//     .ease(d3.easeLinear)
//     .on('start', function repeat() {
//       d3.active(this)
//         .styleTween('stroke', function(d) {
//           if (d.classed('flow')) {
//             let g = graphs[j].filter(function(o) {
//               return o.fuel === d.attr('data-fuel');
//             }).filter(function (o) {
//               return o.box === d.attr('data-sector');
//             })[0];
//             let stroke = 0;
//             if (g.stroke > 0) { stroke = g.stroke + BLEED; }
//             return d3.interpolateNumber(
//               d.attr('stroke'), stroke
//             );
//           }
//           return null;
//         })
//         .attrTween('d', function(d) {
//           if (d.classed('flow')) {
//             let g = graphs[j].filter(function(o) {
//               return o.fuel === d.attr('data-fuel');
//             }).filter(function (o) {
//               return o.box === d.attr('data-sector');
//             })[0];
//             return parse_line(g);
//           }
//           return null;
//         })
//         .attrTween('y', function(d) {
//           if (d.classed('label')) {
//             return summary.labels[j][d.attr('data-fuel')];
//           }
//         });
//
//     })
// };
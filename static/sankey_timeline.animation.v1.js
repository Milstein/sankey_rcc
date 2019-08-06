const build_animation = function build_animation(graphs, graph_nest, summary, svg, div) {
    // let i = 1;
    let years = Object.keys(graph_nest.strokes).sort().map(Number);
    //console.log(years);

    let n = 1; // years[i] - years[i-1];
    let duration = n * SPEED;

    function animate_period(selected_year) {
        let i = years.indexOf(eval(selected_year));

        svg.selectAll('.label')
            .classed('hidden', function () {
                let d = d3.select(this);
                if (d.classed('sector')) {
                    return graphs[i].totals[d.attr('data-sector')] <= 0;
                } else if (d.classed('fuel')) {
                    return graphs[i].totals[d.attr('data-fuel')] <= 0;
                }
            });
        d3.selectAll('.animate')
            .on('mouseover', function () {
                /*
                 Show flows' popup
                  */
                let d = d3.select(this);
                if (d.classed('flow')) {
                    let l = graphs[i].graph.filter(function (e) {
                            return e.fuel === d.attr('data-fuel')
                        })
                        .filter(function (e) {
                            return e.box === d.attr('data-sector')
                        })[0];

                    div
                        .transition()
                        .duration(200)
                        .style('opacity', 0.9);
                    div
                        .html(get_fuel_name(l.fuel) + " → " + get_sector_name(l.box) + "<br/>" + sigfig2(l.value))
                        .style('left', d3.event.pageX + 'px')
                        .style('top', d3.event.pageY - 35 + 'px');
                }
            })
            .on('mouseout', () => {
                div
                    .transition()
                    .duration(500)
                    .style('opacity', 0);
            })
            .transition()
            .duration(duration)
            .ease(d3.easeLinear)
            .on('start', function () {
                let d = d3.select(this);
                d3.active(this)
                    /*
                     Update flows' geometry
                     */
                    .attr('d', function () {
                        if (d.classed('flow')) {
                            let l = graphs[i].graph.filter(function (e) {
                                    return e.fuel === d.attr('data-fuel')
                                })
                                .filter(function (e) {
                                    return e.box === d.attr('data-sector')
                                })[0];
                            return line(parse_line(l));
                        }
                    })
                    /*
                     Update flows' stroke width
                     */
                    .attr('stroke-width', function () {
                        if (d.classed('flow')) {
                            let s = graph_nest.strokes[years[i]][d.attr('data-fuel')][d.attr('data-sector')];
                            if (s > 0) {
                                return s + BLEED;
                            }
                            return 0;
                        }
                    })
                    .attr('y', function () {
                        /*
                         Update fuel box y-coordinate
                         */
                        if (d.classed('box') && d.classed('fuel')) {
                            return graph_nest.tops[years[i]][d.attr('data-fuel')];
                        }
                        /*
                         Update fuel box label y-coordinate
                         */
                        else if (d.classed('label') && d.classed('fuel')) {
                            return graph_nest.tops[years[i]][d.attr('data-fuel')] - 5;
                        }
                        return d.attr('y');
                    })
                    .attr('height', function () {
                        /*
                         Update sector box height
                         */
                        if (d.classed('box') && d.classed('sector')) {
                            return graph_nest.heights[years[i]][d.attr('data-sector')];
                        }
                        return d.attr('height');
                    })
                    .tween('text', function () {
                        let that = this;
                        /*
                         Update year
                         */
                        if (d.classed('year')) {
                            let a = parseInt(that.textContent);
                            let b = years[i];
                            return function (t) {
                                let v = a + (b - a) * t;
                                that.setAttribute('data-value', v);
                                that.textContent = Math.round(v);
                            };
                            /**
                             * Update sector waste
                             */
                        } else if (d.classed('waste-level')) {
                            let a = parseFloat(that.getAttribute('data-value'));
                            let b = graph_nest.waste[years[i]][that.getAttribute('data-sector')];
                            return function (t) {
                                let v = a + (b - a) * t;
                                that.setAttribute('data-value', v);
                                that.textContent = sigfig2(v);
                            };
                            /*
                             Update sector total
                             */
                        } else if (d.classed('total')) {
                            let a = parseFloat(that.getAttribute('data-value'));
                            let b = graphs[i].totals[that.getAttribute('data-sector')];
                            return function (t) {
                                let v = a + (b - a) * t;
                                that.setAttribute('data-value', v);
                                that.textContent = sigfig2(v);
                            };
                        }

                    });
            });

        //i++;

        // if (i < graphs.length - 1) {
        //   setTimeout(animate_period, duration);
        // }

    }

    //Run the update function when the slider is changed
    d3.select('#rangeSlider').on('input', function () {
        d3.selectAll(".range-slider__value").text(this.value);
        animate_period(this.value);
    });

    let sliderWIDTH = $('#rangeSlider').width();
    let svgTick = d3.select('#testTick')
        //.style('padding-left', '6px')
        .style('height', 40 + 'px')
        .append('svg')
        .attr('id', 'slider')
        .attr('width', sliderWIDTH)
        .attr('height', 40)
        //responsive SVG needs these 2 attributes and no width and height attr
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${sliderWIDTH} 40`);

    // /**
    //  * Draw Energy Waste checkbox filter.
    //  */
    // svgTick.append("foreignObject")
    //     .attr("width", $('#rangeSlider').width())
    //     .attr("height", 50)
    //     .attr('x', ELEC_BOX[0] / 3.8)
    //     .attr('dy', '1.5em')
    //     //.append("xhtml:body")
    //     .html("<div class=\"toogleswitch\"><input type=\"checkbox\" id=\"waste_required\" name=\"waste\" class=\"switch filter\"><label for=\"waste_required\">Electricity Waste</label></div>")
    //     .on("click", function (d, i) {
    //         alert('Me');
    //     });

    var scale = d3.scaleLinear()
        .range([7, sliderWIDTH - 10])
        .domain([1800, 2017]);

    var axis = d3.axisBottom(scale)
        .tickValues([1800, 1830, 1865, 1870, 1882, 1929, 1933, 1945, 1958, 1973, 2003])
        .tickFormat(function (d) {
            return ~~d;
        });

    var gX = svgTick.append("g")
        .attr("transform", "translate(0, 5)")
        .call(axis);

    //gX.select(".tick text").attr("x", 10);

    gX.selectAll('.tick text')
        .filter(function (d) {
            return d === 1800 || d === 1870 || d === 1933;
        })
        .attr('x', function (d, i) {
            // here you can affect just the red circles (bc their ArtistID is 1)
            return 10;
        })

    gX.selectAll(".tick").select("text")
        .on("click", function (year) {
            animate_period(year);
            d3.select('#rangeSlider').node().focus();
            d3.select('#rangeSlider').property("value", year);
            d3.select(".range-slider__value").text(year);
            clearInterval(myTimer);
            // myTimer = 0;
            d3.select("#play-button").text("Play");
            let year_info = summary.totals.filter(function (d) {
                return d.year === year;
            })[0];

            div
                .transition()
                .duration(200)
                .style('opacity', 0.9);
            div
                .html(year_info.milestone)
                .style('left', d3.event.pageX + 'px')
                .style('top', d3.event.pageY - 35 + 'px');
        }).on('mouseout', () => {
            div
                .transition()
                .duration(500)
                .style('opacity', 0);
            d3.select("#play-button").dispatch("click");
        });;


    var playButton = d3.select("#play-button");
    playButton
        .on("click", function () {
            var button = d3.select(this);
            if (button.text() == "Pause") {
                clearInterval(myTimer);
                // myTimer = 0;
                button.text("Play");
            } else {
                myTimer = setInterval(function () {
                    var b = d3.select("#rangeSlider");
                    var t = (+b.property("value") + 1) % (+b.property("max") + 1);
                    if (t == 0) {
                        t = +b.property("min");
                        // clearInterval(myTimer);
                        // myTimer = 0;
                        // button.text("Play");
                    }
                    b.property("value", t);
                    d3.select(".range-slider__value").text(t);
                    animate_period(t);
                }, duration);
                button.text("Pause");
            }
        });

    d3.select("#play-button").dispatch("click");

};
(function (d3$1, topojson) {
  'use strict';

  topojson = topojson && Object.prototype.hasOwnProperty.call(topojson, 'default') ? topojson['default'] : topojson;

  function colorData(num) {
    switch (true) {
      case num >= 100:
        return d3.schemeGreens[6][5];
      case num > 80:
        return d3.schemeGreens[6][4];
      case num > 60:
        return d3.schemeGreens[6][3];
      case num > 40:
        return d3.schemeGreens[6][2];
      case num > 20:
        return d3.schemeGreens[6][1];
      case num <= 20:
        return d3.schemeGreens[6][0];
      default:
        return '#eee';
    }
  }

  function colorScale() {
    let scale = [];
    scale = scale.concat(d3.schemeGreens[6][4]);
    scale = scale.concat(d3.schemeGreens[6][3]);
    scale = scale.concat(d3.schemeGreens[6][2]);
    scale = scale.concat(d3.schemeGreens[6][1]);
    scale = scale.concat(d3.schemeGreens[6][0]);
    scale = scale.concat('#eee');
    return scale;
  }

  function numberScale() {
    let scale = [];
    scale = scale.concat('80-100%');
    scale = scale.concat('60-80%');
    scale = scale.concat('40-60%');
    scale = scale.concat('20-40%');
    scale = scale.concat('0-20%');
    scale = scale.concat('No Data');
    return scale;
  }

  const colorLegend = (
    selection,
    {
      colorScale,
      colorLegendLabel,
      colorLegendX,
      colorLegendY,
      tickSpacing = 15,
      tickPadding = 10,
      colorLegendLabelX = -10,
      colorLegendLabelY = -20,
    }
  ) => {
    const colorLegendG = selection
      .selectAll('g.color-legend')
      .data([null])
      .join('g')
      .attr('class', 'color-legend')
      .attr(
        'transform',
        `translate(${colorLegendX},${colorLegendY})`
      );

    colorLegendG
      .selectAll('text.color-legend-label')
      .data([null])
      .join('text')
      .attr('x', colorLegendLabelX)
      .attr('y', colorLegendLabelY)
      .attr('class', 'color-legend-label')
      .attr('font-family', 'sans-serif')
      .attr('font-size', 12)
      .text(colorLegendLabel);

    colorLegendG
      .selectAll('g.tick')
      .data(colorScale.domain())
      .join((enter) =>
        enter
          .append('g')
          .attr('class', 'tick')
          .call((selection) => {
            selection.append('circle');
            selection.append('text');
          })
      )
      .attr(
        'transform',
        (d, i) => `translate(0, ${i * tickSpacing})`
      )
      .attr('font-size', 10)
      .attr('font-family', 'sans-serif')
      .call((selection) => {
        selection
          .select('circle')
          .attr('r', 4)
          .attr('fill', colorScale)
      .attr('stroke', '#000')
      .attr('stroke-width', .5);
        selection
          .select('text')
          .attr('dy', '0.32em')
          .attr('x', tickPadding)
          .text((d) => d);
      });
  };

  const projection = d3$1.geoNaturalEarth1();
  const path = d3$1.geoPath(projection);
  const graticule = d3$1.geoGraticule();

  const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'd3-tooltip')
    .style('position', 'absolute')
    .style('z-index', '10')
    .style('visibility', 'hidden')
    .style('padding', '10px')
    .style('background', 'rgba(0,0,0,0.6)')
    .style('border-radius', '5px')
    .style('color', 'white');

  const map = (selection, { data }) => {
    d3.csv('internet_users.csv')
      .then((internet) =>  {
        function usersPerCountry(country) {
          let users = 'No Data';
          internet.forEach((c) => {
            if (c.country_code == country) {
              users = c['percentage'];
            }
          });
          let round = Math.round(users * 100) / 100;
          if (isNaN(round)) {
            return users;
          }
          else return round;
        }
        function getColor(num) {
          let color = colorData(num);
          return color;
        }
        selection
          .selectAll('path.country')
          .data(data.features)
          .join('path')
          .attr('d', path)
          .attr('class', 'country')
          .attr('stroke', 'black')
          .attr('fill', (d) =>
            getColor(
              usersPerCountry(d.properties.a3)
            )
          )
          .attr('stroke-width', 0.5)
          .on('mouseover', function (e, d) {
          let count = usersPerCountry(
                  d.properties.a3);
          if (count != 'No Data') {
          count = count + '%';}
            tooltip
              .html(
                `${
                d.properties.name
              }: ${count}`
              )
              .style('visibility', 'visible');
          })
          .on('mousemove', function () {
            tooltip
              .style('top', event.pageY - 10 + 'px')
              .style(
                'left',
                event.pageX + 10 + 'px'
              );
          })
          .on('mouseout', function () {
            tooltip.style('visibility', 'hidden');
          });

        const colors = colorScale();
        const range = numberScale();

        const scale = d3$1.scaleOrdinal()
          .domain(range)
          .range(colors);

        selection.call(colorLegend, {
          colorScale: scale,
          colorLegendLabel:
            'Internet Users Per Country (2015)',
          colorLegendX: 75,
          colorLegendY: 300,
        });

        const zoom = d3
          .zoom()
          .scaleExtent([1, 10])
          .on('zoom', zoomed);

        selection.call(zoom);

        function zoomed(event) {
          const { transform } = event;
          console.log(transform);
          selection.attr('transform', transform);
          selection.attr(
            'stroke-width',
            1 / transform.k
          );
        }
      });
  };

  const worldAtlasURL =
    'https://unpkg.com/visionscarto-world-atlas@0.1.0/world/110m.json';

  const viz = (
    container,
    { state, setState }
  ) => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3$1.select(container)
      .selectAll('svg')
      .data([null])
      .join('svg')
      .attr('width', width)
      .attr('height', height);

    // state.data could be:
    // * undefined
    // * 'LOADING'
    // * An array of objects
    const { data } = state;

    if (data && data !== 'LOADING') {
      svg.call(map, {
        data,
      });
    }

    if (data === undefined) {
      setState((state) => ({
        ...state,
        data: 'LOADING',
      }));
      d3.json(worldAtlasURL)
        // .then((response) => response.json())
        .then((topoJSONData) => {
          // d3.csv("internet_users.csv")
          //   .then(function(csv) {
          const data = topojson.feature(
            topoJSONData,
            'countries'
          );
          // });
          setState((state) => ({
            ...state,
            data,
          }));
        });
    }
  };

  const container = d3$1.select('#app').node();
  let state = {};

  const render = () => {
    viz(container, {
      state,
      setState,
    });
  };

  const setState = (next) => {
    state = next(state);
    render();
  };

  render();

}(d3, topojson));
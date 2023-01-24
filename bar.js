/**
 * I referenced the code from Assignment 7b when making this bar chart.
 */

// these variables need to be accessed by both the chart and bar drawing functions
let container;
let legend;
let xScale;
let yScale;
let countDataList;
const dimensions = {
  width: 700,
  height: 575,
  margin: {
    top: 20,
    bottom: 60,
    left: 300,
    right: 50
  }
};
getBarData().then(data => {
  countDataList = data;
  drawChart();
  drawBars();
  drawLegend();
});

// Draws the skeleton of bar chart (X and Y axes and labels, title) and the box for the legend
function drawChart () {
  container = d3.select("#bar")
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);

  const bodyWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;
  const bodyHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  // X Axis
  const maxCount = d3.max(countDataList, d => d.count);
  xScale = d3.scaleLinear()
    .domain([0, maxCount])
    .range([0, bodyWidth]);
  const xAxis = d3.axisBottom(xScale);
  container.append('g')
    .style('transform', `translate(${dimensions.margin.left}px,${dimensions.height - dimensions.margin.bottom}px)`)
    .call(xAxis);

  container.append('text')
    .attr('x', dimensions.margin.left + bodyWidth/4)
    .attr('y', dimensions.height - 10)
    .attr('text-anchor', 'center')
    .text('Number of Crime Incidents');

  // Y Axis
  yScale = d3.scaleBand()
    .domain(countDataList.map(d => d.description))
    .range([0, bodyHeight])
    .padding(0.2);
  const yAxis = d3.axisLeft(yScale);
  container.append('g')
    .style('transform', `translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`)
    .call(yAxis);

  container.append('text')
    .attr('x', -300)
    .attr('y', 10)
    .attr('transform', `rotate(270)`)
    .attr('text-anchor', 'center')
    .text('Crime Incident Description');

  legend = container.append('g').style('transform', `translate(540px, 270px)`);
  legend.append('rect').attr('x', 0).attr('y', 0).attr('height', 200).attr('width', 160).attr('stroke', 'black').attr('fill', 'none');
  legend.append('text').text('Categories').attr('x', 80).attr('y', 24).attr('font-size', '20px').attr('text-anchor', 'middle');
}


// Removes existing bars, and redraws bars for the bar chart, taking the filter into account
function drawBars(offenseCodeFilter = new Set()) {
  container.select('#bars-body').remove();
  const body = container.append('g').attr('id', 'bars-body')
    .style('transform', `translate(${dimensions.margin.left}px,${dimensions.margin.top}px)`);
  const joinedData = body.selectAll('.bar').data(countDataList, d => d.offenseCode);
  joinedData.enter().append('rect')
    .attr('class', 'bar')
    .attr('y', d => yScale(d.description))
    .attr('width', d => xScale(d.count))
    .attr('height', yScale.bandwidth())
    .attr('fill', d => d.color)
    .attr('opacity', d => offenseCodeFilter.size === 0 || offenseCodeFilter.has(d.offenseCode) ? 1 : .2)
    .on('mouseenter', function (e, d) {
      d3.select(`#count-${d.offenseCode}-text`).attr('visibility', 'visible');
    })
    .on('mouseleave', function (e, d) {
      d3.select(`#count-${d.offenseCode}-text`).attr('visibility', 'hidden');
    })
    .on('click', function (e, d) {
      const alreadySelected = offenseCodeFilter.has(d.offenseCode)
      if (alreadySelected) {
        // remove it from the filter and redraw
        offenseCodeFilter.delete(d.offenseCode);
        handleChange(offenseCodeFilter);
      } else {
        // add it to the filter and redraw
        offenseCodeFilter.add(d.offenseCode);
        handleChange(offenseCodeFilter);
      }
    });

  joinedData.enter().append('text')
    .text(d => d.count)
    .attr('id', d => `count-${d.offenseCode}-text`)
    .attr('x', d => xScale(d.count) + 4)
    .attr('y', d => yScale(d.description) + yScale.bandwidth()/2 + 4)
    .attr('font-size', '12px')
    .attr('fill', '#000')
    .attr('text-anchor', 'left')
    .attr('visibility', 'hidden');
}

// Removes existing legend, and redraws legend items, taking filter into account
function drawLegend(offenseCodeFilter = new Set()) {
  legend.select('#legend-contents').remove();
  const legendContents = legend.append('g').attr('id', 'legend-contents').style('transform', 'translate(4px, 30px)');
  const joinedLegend = legendContents.selectAll('.legendItem').data(Object.entries(CATEGORIES));

  const legendItem = joinedLegend.enter().append('g').attr('class', 'legendItem').style('transform', d => {
    const index = Object.keys(CATEGORIES).indexOf(d[0]);
    return `translate(0px, ${(index+1)*20}px`
  });
  legendItem.append('a').attr('href', '#jump5').append('text')
      .text(d => d[0])
      .attr('x', 0)
      .attr('y', 0)
      .attr('font-size', '12px')
      .attr('font-weight', d => {
        const notSelected = d[1].incidentCodes.some(code => {
          return !offenseCodeFilter.has(code);
        });
        return notSelected ? 'lighter' : 'bold';
      })
      .on('click', function (e, d) {
        e.preventDefault();
        const notSelected = d[1].incidentCodes.some(code => {
          return !offenseCodeFilter.has(code);
        });

        if (notSelected) {
          d[1].incidentCodes.forEach(code => offenseCodeFilter.add(code));
          handleChange(offenseCodeFilter);
        } else {
          d[1].incidentCodes.forEach(code => {
            offenseCodeFilter.delete(code);
          });
          handleChange(offenseCodeFilter);
        }
      });
    legendItem.append('rect').attr('width', 10).attr('height', 10).attr('x', 139).attr('y', -10).attr('fill', d => d[1].color);
}
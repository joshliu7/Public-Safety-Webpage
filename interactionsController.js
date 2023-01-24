/**
 * Central function to coordinate change to visualizations based on user input. This propagates the change
 * to the bar chart, map, and legend, which will each remove their existing data and redraw them according to the
 * new filter.
 *
 * @param offenseCodeFilter: a Set
 */
function handleChange(offenseCodeFilter) {
  drawBars(offenseCodeFilter);
  drawDots(offenseCodeFilter);
  drawLegend(offenseCodeFilter);
}

// Remove any existing filter and recenter the map
function reset() {
  handleChange(new Set());
  centerCrimeMap();
}
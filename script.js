const w = 900;
const h = 500;

const padding = 60;

const svg = d3
	.select('.svg-container')
	.style('padding-bottom', `${((h - padding / 2) / w) * 100}%`)
	.append('svg')
	.attr('preserveAspectRatio', 'xMinYMin meet')
	.attr('viewBox', `0 0 ${w} ${h}`)
	.classed('svg-content', true)
	.style('background-color', '#fff');

const tooltip = d3
	.select('.svg-container')
	.append('div')
	.attr('id', 'tooltip')
	.style('opacity', 0);

async function loadAndPlotData() {
	const res = await fetch(
		'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
	);
	const data = await res.json();

	let {monthlyVariance} = data;

	monthlyVariance = monthlyVariance.slice(0, 200);

	console.log(monthlyVariance);

	const xScale = d3
		.scaleTime()
		.range([padding, w - padding])
		.domain(d3.extent(monthlyVariance, d => new Date(d.year, 0)));

	// const yScale = d3
	// 	.scaleLinear()
	// 	.range([h - padding, padding])
	// 	.domain([11, 0]);
	// // .domain(d3.extent(monthlyVariance, d => d.month));

	const yScale = d3
		.scaleBand()
		.domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
		.range([padding / 2, h - padding * 2]);

	const barWidth =
		xScale(new Date(monthlyVariance[0].year + 1, 0)) -
		xScale(new Date(monthlyVariance[0].year, 0));

	const barHeight = yScale(2) - yScale(1);

	const colorPalette = d3
		.scaleSequential()
		.domain(d3.extent(monthlyVariance, d => d.variance))
		.interpolator(d3.interpolateViridis);
	// .interpolator(d3.interpolatePuRd);

	// console.log(d3.extent(monthlyVariance, d => d.variance));
	const range =
		d3.extent(monthlyVariance, d => d.variance)[1] -
		d3.extent(monthlyVariance, d => d.variance)[0];

	const numberColors = 6;
	const colorRanges = [];
	for (let i = 0; i < numberColors; i++) {
		// console.log(
		// 	d3.extent(monthlyVariance, d => d.variance)[0] + (range / (numberColors - 1)) * i
		// );
		colorRanges.push(
			d3.extent(monthlyVariance, d => d.variance)[0] + (range / (numberColors - 1)) * i
		);
	}

	// const colorPalette = d3.scaleOrdinal().domain(colorRanges).range(d3.schemeSet3);

	svg
		.selectAll('rect')
		.data(monthlyVariance)
		.enter()
		.append('rect')
		.attr('x', d => xScale(new Date(d.year, 0)))
		.attr('y', d => yScale(d.month - 1))
		// .attr('height', barHeight)
		.attr('height', yScale.bandwidth())
		.attr('width', barWidth)
		// .attr('fill', 'red')
		.attr('fill', d => colorPalette(d.variance));

	const xAxis = d3.axisBottom(xScale).ticks(3);
	// .tickFormat((date, i) => (i % 2 ? date.getFullYear() : '')); //not really needed anymore as css handles it

	svg
		.append('g')
		.attr('transform', `translate(0, ${h - padding * 2})`)
		.attr('id', 'x-axis')
		.call(xAxis);

	const yAxis = d3.axisLeft(yScale); //.ticks(10);
	yAxis.tickFormat((y, i) =>
		y > 11 ? '' : new Date(2021, y).toLocaleString('en-us', {month: 'long'})
	);

	svg
		.append('g')
		.attr('transform', `translate(${padding}, 0)`)
		.attr('id', 'y-axis')
		.call(yAxis);

	const legend = svg
		.append('g')
		.attr('transform', `translate(200, ${h - padding})`)
		.attr('id', 'legend');

	// var o = d3.scaleOrdinal().domain([1, 2, 3, 4]).rangePoints([0, 100]);
	var o = d3.scalePoint().domain([1, 2, 3, 4]).range([0, 100]);
	console.log(o.range()); // [0, 33.333333333333336, 66.66666666666667, 100]

	// legend
	// 	.selectAll('rect')
	// 	.data(colorRanges)
	// 	.enter()
	// 	.append('rect')
	// 	.attr('height', 20)
	// 	.attr('width', 20)
	// 	.attr('x', (d, i) => i * 20)
	// 	.attr('fill', (d, i) => console.log(d, i, colorPalette(d)) || colorPalette(d));
}

loadAndPlotData();

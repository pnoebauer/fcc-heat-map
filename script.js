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

	monthlyVariance = monthlyVariance.slice(0, 40);

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

	var yScale = d3
		.scaleBand()
		.domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
		.range([padding, h - padding]);

	const barWidth =
		xScale(new Date(monthlyVariance[0].year + 1, 0)) -
		xScale(new Date(monthlyVariance[0].year, 0));

	// console.log(xScale(new Date(monthlyVariance[0].year, 0)));
	// console.log(xScale(new Date(1754, 0)));

	const barHeight = yScale(2) - yScale(1);
	// console.log(yScale(2) - yScale(1), yScale(11), yScale(0));

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
		.attr('fill', 'red');

	const xAxis = d3.axisBottom(xScale).ticks(3);
	// .tickFormat((date, i) => (i % 2 ? date.getFullYear() : '')); //not really needed anymore as css handles it

	svg
		.append('g')
		.attr('transform', `translate(0, ${h - padding})`)
		.attr('id', 'x-axis')
		.call(xAxis);

	// const yScaleAx = d3
	// .scaleLinear()
	// .range([h - padding, padding])
	// // .domain([11.5, 0.5]);
	// .domain([12, 1]);

	// var yScaleAx = d3
	// 	.scaleBand()
	// 	.domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
	// 	.range([padding, h - padding])
	// 	// .padding(0)
	// 	.paddingInner(0) // edit the inner padding value in [0,1]
	// 	.paddingOuter(0) // edit the outer padding value in [0,1]
	// 	.align(0);

	// const yScaleAx = d3
	// 	.scaleLinear()
	// 	.range([h - padding, padding])
	// 	.domain([11, 0]);

	// console.log(yScaleAx(2) - yScaleAx(1));

	const yAxis = d3.axisLeft(yScale); //.ticks(10);
	yAxis.tickFormat((y, i) =>
		y > 11 ? '' : new Date(2021, y).toLocaleString('en-us', {month: 'long'})
	);

	const drawnYAxis = svg
		.append('g')
		.attr('transform', `translate(${padding}, 0)`)
		.attr('id', 'y-axis')
		.call(yAxis);
	// // .selectAll('text')
	// // .attr('y', -15)
	// // .attr("x", 6)
	// // .style('text-anchor', 'end');
	// drawnYAxis.selectAll('text').attr('y', -15).attr('x', -15).style('text-anchor', 'end');

	// drawnYAxis.selectAll('line').attr('transform', `translate(0, -15)`);
	// // .attr("x", 6)
	// // .style('text-anchor', 'end');
}

loadAndPlotData();

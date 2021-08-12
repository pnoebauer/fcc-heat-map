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

svg
	.append('text')
	.attr('x', w / 2)
	.attr('y', 20)
	.attr('id', 'title')
	.style('text-anchor', 'middle')
	.style('font-size', 20)
	.text('Monthly Global Land-Surface Temperature');

svg
	.append('text')
	.attr('x', -250)
	.attr('y', 60)
	.style('font-size', 16)
	.attr('transform', 'rotate(-90)')
	.text('Months');

async function loadAndPlotData() {
	const res = await fetch(
		'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
	);
	const data = await res.json();

	const {monthlyVariance, baseTemperature} = data;

	const startYear = monthlyVariance[0].year;
	const endYear = monthlyVariance[monthlyVariance.length - 1].year;

	svg
		.append('text')
		.attr('x', w / 2)
		.attr('y', 40)
		.attr('id', 'description')
		.style('text-anchor', 'middle')
		.style('font-size', 15)
		.text(`${startYear} - ${endYear}: base temperature ${baseTemperature}°C`);

	const xScale = d3
		.scaleTime()
		.range([2 * padding, w - padding])
		.domain(d3.extent(monthlyVariance, d => new Date(d.year, 0)));

	// const yScale = d3
	// 	.scaleLinear()
	// 	.range([h - padding, padding])
	// 	.domain([11, 0]);
	// // .domain(d3.extent(monthlyVariance, d => d.month));

	const yScale = d3
		.scaleBand()
		.domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
		.range([padding, h - padding * 2]);

	const barWidth =
		xScale(new Date(monthlyVariance[0].year + 1, 0)) -
		xScale(new Date(monthlyVariance[0].year, 0));

	// const barHeight = yScale(2) - yScale(1);

	const colorPalette = d3
		.scaleSequential()
		.domain(d3.extent(monthlyVariance, d => d.variance))
		// .interpolator(d3.interpolateViridis);
		.interpolator(d3.interpolatePuRd);

	const range =
		d3.extent(monthlyVariance, d => d.variance)[1] -
		d3.extent(monthlyVariance, d => d.variance)[0];

	const numberColors = 5;
	const colorRanges = [];
	for (let i = 0; i < numberColors; i++) {
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
		.attr('class', 'cell')
		.attr('fill', d => colorPalette(d.variance))
		.attr('data-month', d => d.month - 1)
		.attr('data-year', d => d.year)
		.attr('data-temp', d => d.variance + baseTemperature)
		.on('mouseover', function (d, i) {
			// d3.select(this).style('r', 8);
			// console.log(d, i);
			tooltip.transition().duration(200).style('opacity', 0.9);
			tooltip

				.html(
					`${i.year} - ${new Date(2021, i.month).toLocaleString('en-us', {
						month: 'long',
					})}<br/>${(baseTemperature + i.variance).toFixed(1)}°C<br/>${i.variance.toFixed(
						1
					)}°C`
				)
				.style('text-align', 'center')
				.attr('data-year', i.year)
				// .style('left', d.pageX + 'px')
				.style('left', d.offsetX + 'px')
				.style('top', d.offsetY + 'px');
		})
		.on('mouseout', function (d, i) {
			// d3.select(this).style('fill', 'black');
			tooltip.transition().duration(500).style('opacity', 0);
		});

	const xAxis = d3.axisBottom(xScale);

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
		.attr('transform', `translate(${2 * padding}, 0)`)
		.attr('id', 'y-axis')
		.call(yAxis);

	const legend = svg
		.append('g')
		.attr('transform', `translate(${-padding + w / 2}, ${h - padding * 1.5})`)
		.attr('id', 'legend');

	const additionalXmax =
		d3.extent(monthlyVariance, d => d.variance)[1] + range / (numberColors - 1);

	const colorMap = d3
		.scalePoint()
		.domain([1, 2, 3, 4, 5, 6])
		// .range(d3.extent(monthlyVariance, d => d.variance));
		.range([d3.extent(monthlyVariance, d => d.variance)[0], additionalXmax]);

	const legendAxisScale = d3
		.scaleLinear()
		.domain([1, numberColors + 1])
		.range([0, 200]);

	const lWidth = legendAxisScale(2) - legendAxisScale(1);

	legend
		.selectAll('rect')
		.data(colorRanges)
		.enter()
		.append('rect')
		.attr('height', 20)
		.attr('width', lWidth)
		.attr('x', (d, i) => legendAxisScale(i + 1))
		.attr('fill', (d, i) => colorPalette(d));

	const legendXAxis = d3
		.axisBottom(legendAxisScale)
		// .tickFormat((x, i) => colorMap(x).toFixed(2))
		.tickFormat((x, i) =>
			i > colorRanges.length - 1 ? additionalXmax.toFixed(2) : colorRanges[i].toFixed(2)
		)
		.ticks(numberColors);

	legend
		.append('g')
		.attr('transform', `translate(0, 20)`)
		.attr('id', 'legend-x-axis')
		.call(legendXAxis);
}

loadAndPlotData();

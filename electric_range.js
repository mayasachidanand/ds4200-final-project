// Load the data
const ev = d3.csv('electric_vehicle_data.csv');

ev.then(function(data) {
    // Convert string values to numbers
    data.forEach(d => d['Electric Range'] = parseFloat(d['Electric Range']));
    data.forEach(d => d['Base MSRP'] = parseFloat(d['Base MSRP'])); 

    // Filter out values where either 'Base MSRP' or 'Electric Range' are 0
    data = data.filter(d => d['Electric Range'] !== 0 && d['Base MSRP'] !== 0);


    // Define the dimensions and margins for the SVG
    let 
        width = 550,  
        height = 350; 

    let margin = {
        top: 20,     
        bottom: 80, 
        left: 70,  
        right: 10    
};

    //reduce the data by frequency of Make
    const makeCounts = d3.rollup(data,  v => v.length, d => d.Make);

    //sort by descending count, take the top 5 values, and then find the makes of those 
    const topMakes = Array.from(makeCounts)
                    .sort((a, b) => d3.descending(a[1], b[1])) 
                    .slice(0, 7) 
                    .map(d => d[0]); 

    //filter the data to only include the top 5 makes 
    data = data.filter(d => topMakes.includes(d.Make));

    // Create the SVG container
    let svg = d3
        .select('#scatterplot')
        .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', '#ffc7f1');
    
    // Set up scales for x and y axes
    // d3.min(data, d => d.bill_length_mm)-5
    let yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d['Base MSRP']) - 5, d3.max(data, d => d['Base MSRP']) + 5])
        .range([height - margin.bottom, margin.top]);

    let xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d['Electric Range']) - 5, d3.max(data, d => d['Electric Range']) + 5])
        .range([margin.left, width - margin.right]);

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.Make))
        .range(d3.schemeCategory10);

    // Add scales     
    let xAxis = svg
        .append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(xScale));

    let yAxis = svg
        .append('g')
            .attr('transform', `translate(${margin.left},0)`)
            .call(d3.axisLeft().scale(yScale));

    // Add circles for each data point
    let circle = svg
        .selectAll('circle')
            .data(data)
        .enter()
        .append('circle')
            .attr('cx', d => xScale(d['Electric Range']))
            .attr('cy', d => yScale(d['Base MSRP']))
            .attr('r', 5)
            .attr('opacity', 0.2)
            .attr('fill', d => colorScale(d.Make));

    // Add x-axis label
    xAxis
        .append('text')
            .attr('x', width / 2 + 15)
            .attr('y', 35)
            .style('font-family', 'Arial')
            .style('stroke', 'black')
            .attr('fill', 'black')
            .attr("font-size", "14px")
            .text('Electric Range');

    // Add y-axis label
    yAxis
        .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', -50)
            .attr('x', -80)
            .style('font-family', 'Arial')
            .style('stroke', 'black')
            .attr('fill', 'black')
            .attr("font-size", "14px")
            .text('Base MSRP');

    // Add legend
    const legend = svg
        .selectAll(".legend")
            .data(colorScale.domain())
        .enter()
        .append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => "translate(0," + (i * 20 + 10) + ")");
    
    legend.append("circle")
        .attr("cx", width - 5)
        .attr("cy", 37)
        .attr("r", 4)
        .attr("height", 20)
        .style("fill", colorScale);
    
    legend.append("text")
        .attr("x", width - 65)
        .attr("y", 40)
        .style('font-family', 'Arial')
        .attr("font-size", "10px")
        .text(d => d);

});


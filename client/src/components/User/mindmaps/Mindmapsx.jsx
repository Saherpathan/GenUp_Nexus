import React, { useRef, useState } from 'react';
// import Builder from './Builder';
import * as d3 from 'd3';
import './mindmaps.css';
// import parentFunction from './main';

const Mindmapsx = () => {
  const [query, setQuery] = useState(null);
  const [display, setDisplay] = useState(false);
  const [json, setJson] = useState(null);
  const [error, setError] = useState('');

  const ref = useRef();

  const chartBuilder = (data) => {
    const svg = d3.select(document.querySelector("svg"));
    const width = window.screen.width;
    const height = window.screen.height*3;

    const margin = { top: 0, right: 50, bottom: 0, left: 75};
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const treeLayout = d3.tree().size([innerHeight, innerWidth]);

    const zoomG = svg
        .attr('width', width+150)
        .attr('height', height)
        .style('padding', 50)
    .append('g');

    const g = zoomG.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // svg.call(d3.zoom().on('zoom', () => {
    //     zoomG.attr('transform', event.transform);
    // }));

    const root = d3.hierarchy(data);
    const links = treeLayout(root).links();
    const linkPathGenerator = d3.linkHorizontal()
    .x(d => d.y)
    .y(d => d.x);

    g.selectAll('path').data(links)
    .enter().append('path')
        .attr('d', linkPathGenerator);

    g.selectAll('text').data(root.descendants())
    .enter().append('text')
        .attr('x', d => d.y)
        .attr('y', d => d.x)
        .attr('dy', '0.32em')
        .attr('text-anchor', d => d.children ? 'middle' : 'start')
        .attr('font-size', d => 3.25 - d.depth + 'em')
        .text(d => d.data.name);
  }

  const handleQuery = async () => {
    // if (query) {
      try {
        const response = await fetch( 'http://127.0.0.1:5000/tree', {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({ "query": query }),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                console.log(JSON.parse(data.data));
                chartBuilder(JSON.parse(data.data));
                // parentFunction(JSON.parse(data.data));
                setJson(data.data);
                setDisplay(true);
            } else {
                setError(data.error);
            }
        } else {
            setError('Cannot connect to server right now !!');
        }
      } catch (error) {
          setError('We are experiencing heavy traffic !!');
      }
    }
//   }

  return (
    <div>Mindmaps
      <input type="text" name="query" id="query" onChange={(e)=>setQuery(e.target.value)}   />
      <button onClick={handleQuery}>Get</button>
      <div id="chart">
        <svg style={{'background': 'white', 'color': 'black'}} ref={ref}></svg>
    </div>
    </div>
  )
}

export default Mindmapsx
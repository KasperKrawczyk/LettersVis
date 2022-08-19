// https://observablehq.com/@mbostock/the-wealth-health-of-nations@202
import define1 from "./scrubber.js";
// import * as d3js from 'https://d3js.org/d3.v7.min.js';
import * as d3js from "https://cdn.skypack.dev/d3@7";

// import * as d3 from 'https://unpkg.com/d3?module'

const margin = {top: 20, right: 20, bottom: 35, left: 40};
const height = 560;
const width = height * 2;
let scaleY = scaleLinearY();
let scaleX = scaleLinearX();


function _1(md) {
    return (
        md`The correspondence of Isabelle de Charrière`
    )
}

function _date(Scrubber, dates) {
    return (
        Scrubber(dates, {format: d => d.getUTCFullYear(), loop: false})
    )
}

function _legend(DOM, html, margin, color) {
    const id = DOM.uid().id;
    return html`
        <style>

            .${id} {
                display: inline-flex;
                align-items: center;
                margin-right: 1em;
            }

            .${id}::before {
                content: "";
                width: 1em;
                height: 1em;
                margin-right: 0.5em;
                background: var(--color);
            }

        </style>
        <div style="display: flex; align-items: center; min-height: 33px; font: 10px sans-serif; margin-left: ${margin.left}px;">
            <div>${color.domain().map(region => html`<span class="${id}"
                                                           style="--color: ${color(region)}">${document.createTextNode(region)}</span>`)}`;
}


function _chart() {
    const svg = d3js.create("svg")
        .attr("viewBox", [0, 0, width, height]);

    let node = svg.append("g")
        .attr("stroke", "black")
        .selectAll("circle")
    // .data(dataAt(1753), d => d.label)
    // .join("circle")
    // .sort((a, b) => d3.descending(a.label, b.label))

    // .attr("r", d => radius(d.label))
    // .attr("fill", d => color(d.label))
    // .call(circle => circle.append("title")
    //     .text(d => d.label));

    let edge = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line");

    function tickCurData() {
        node.attr("cx", d => scaleX(d.x))
            .attr("cy", d => scaleY(d.y));

        edge.attr("x1", d => scaleX(d.source.x))
            .attr("y1", d => scaleY(d.source.y))
            .attr("x2", d => scaleX(d.target.x))
            .attr("y2", d => scaleY(d.target.y));
    }

    return Object.assign(svg.node(), {
        update(data) {

            node = node.data(data.curNodes, d => d.label)
                .join(enter => enter.append("circle")
                    .attr("r", d => radius(d.label))
                    .attr("fill", d => color(d.label))
                    .call(node => node.append("title")
                        .text(d => d.label)));

            edge = edge.data(data.curEdges, d => [d.source, d.target])
                .join("line");

            tickCurData();
        }

    });
}


function _update(chart, currentData) {
    return (
        chart.update(currentData)
    )
}

function _currentData(dataAt, date) {
    return (
        dataAt(date)
    )
}


function scaleLinearY() {
    return (
        d3js.scaleLinear([0, 200], [height - margin.bottom, margin.top])
    )
}

function scaleLinearX() {
    return (
        d3js.scaleLinear([0, 400], [margin.left, width - margin.right])
    )
}

function radius(label) {
    if (label === "Isabelle de Charrière") {
        return 8
    } else if (!hasNumber(label)) {
        return 5
    } else {
        return 3
    }

}

function color(label) {
    if (label === "Isabelle de Charrière") {
        return "red"
    } else if (!hasNumber(label)) {
        return "blue"
    } else {
        return "green"
    }
}


function hasNumber(string) {
    return /\d/.test(string);
}

function _dataAt(data, valueAt) {
    const nodes = data.nodes;
    const edges = data.edges;
    return (
        function dataAt(date) {
            const curNodes = nodes
                .filter(n => contains(n.start, n.end, date))
                .map(d => ({
                    start: d.start,
                    end: d.end,
                    label: d.label,
                    x: valueAt(d.coordinates, "x", date),
                    y: valueAt(d.coordinates, "y", date),
                }));
            const curEdges = edges
                .filter(e => contains(e.start, e.end, date))
                .map(edge => ({
                    start: edge.start,
                    end: edge.end,
                    source: curNodes.find(node => node.label === edge.sourceLabel),
                    target: curNodes.find(node => node.label === edge.targetLabel)
                }));
            return {
                curNodes,
                curEdges
            }
        }
    )
}

function contains(start, end, date) {
    const dateUTC = new Date(date);
    const year = dateUTC.getUTCFullYear();
    return start <= year && year < end;

}

function _valueAt() {
    return (
        function valueAt(coordinateArray, coordString, date) {
            const dateUTC = new Date(date);
            let curYear = dateUTC.getUTCFullYear() + ((dateUTC.getUTCMonth()) / 11);
            // curYear = curYear === 1970 ? 1753 : curYear;
            // const leftIndex = coordinateArray.findIndex(coordinate => coordinate.time <= curYear);
            // console.log(coordinateArray)
            // for (let el in coordinateArray) {
            //     console.log(coordinateArray[el])
            // }
            const rightIndex = coordinateArray.findIndex(coordinate => coordinate.time > curYear);
            return interpolateCoordinates(coordinateArray, coordString, rightIndex, curYear)
        }
    )
}


function interpolateCoordinates(coordinateArray, coordString, rightIndex, curYear) {
    // console.log("COORDINATE ARRAY " + coordinateArray)
    // if (leftIndex === -1) {
    //     return coordinateArray[0][coordString];
    // }
    if (rightIndex === -1) {
        rightIndex = coordinateArray.length - 1;
    }

    const leftCoordObj = rightIndex === 0 ? coordinateArray[rightIndex] : coordinateArray[rightIndex - 1];
    if (typeof leftCoordObj === "undefined") {
        console.log(rightIndex)
    }
    const rightCoordObj = coordinateArray[rightIndex];
    const leftTime = leftCoordObj.time;
    const rightTime = rightCoordObj.time; // < curYear ? curYear : rightCoordObj.time
    const dateOffset = (curYear - leftTime) / (rightTime - leftTime);
    // console.log(curYear)
    // console.log(leftTime)
    // console.log(rightTime)
    // console.log(dateOffset)
    const newCoord = leftCoordObj[coordString] + ((rightCoordObj[coordString] - leftCoordObj[coordString]) * dateOffset);
    //
    // if (newCoord > 200 || newCoord < 0) {
    //     console.log("newCoord = "+newCoord)
    // }
    // console.log("\n")

    return newCoord;
}

async function _data(FileAttachment) {
    return (
        (await FileAttachment("bipartite_charriere.json").json())
        // .map(({nodesJson, edgesJson}) => ({
        //     nodes: parseNodes(nodesJson),
        //     edges: parseEdges(edgesJson)
        // }))

    )
}

async function readData(FileAttachment) {
    return (
        (await FileAttachment("bipartite_charriere.json").json())
        // .map(({nodesJson, edgesJson}) => ({
        //     nodes: parseNodes(nodesJson),
        //     edges: parseEdges(edgesJson)
        // }))

    )
}

function parseNodes(nodesJson) {
    return nodesJson.map(d => ({
        coordinates: parseCoordinateArray(d.coordinates),
        label: d.label,
        start: d.start,
        end: d.end
    }))
}

function parseEdges(edgesJson) {
    return edgesJson.map(d => ({
        sourceLabel: d.sourceLabel,
        targetLabel: d.targetLabel,
        start: d.start,
        end: d.end
    }))
}

function parseCoordinateArray(arrayJson) {
    return arrayJson.map(d => ({
        x: d.x,
        y: d.y,
        time: d.time
    }))
}

function interval() {
    return (
        d3js.utcMonth
    )
}

function _dates(data) {
    const sortedNodes = data.nodes
        .sort((a, b) => d3js.ascending(a.start, b.start));
    const firstYear = Math.floor(sortedNodes[0].start);
    const lastYear = Math.ceil(sortedNodes[sortedNodes.length - 1].end) - 1;

    return (
        interval().range(
            new Date(Date.UTC(firstYear, 0, 1)),
            new Date(Date.UTC(lastYear, 0, 1))
        )
    )
}

function _d3(require) {
    return (
        require("d3@6.7.0/dist/d3.min.js")
    )
}

export default function define(runtime, observer) {
    const main = runtime.module();

    function toString() {
        return this.url;
    }

    const fileAttachments = new Map([
        ["bipartite_charriere.json", {
            url: new URL("./files/bipartite_charriere.json", import.meta.url),
            mimeType: "application/json",
            toString
        }]
    ]);
    main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
    main.variable(observer()).define(["md"], _1);
    main.variable(observer("viewof date")).define("viewof date", ["Scrubber", "dates"], _date);
    main.variable(observer("date")).define("date", ["Generators", "viewof date"], (G, _) => G.input(_));
    main.variable(observer("chart")).define("chart", _chart);
    main.variable(observer("update")).define("update", ["chart", "currentData"], _update);
    main.variable(observer("currentData")).define("currentData", ["dataAt", "date"], _currentData);
    main.variable(observer("dataAt")).define("dataAt", ["data", "valueAt"], _dataAt);
    main.variable(observer("valueAt")).define("valueAt", _valueAt);
    main.variable(observer("data")).define("data", ["FileAttachment"], _data);
    main.variable(observer("dates")).define("dates", ["data"], _dates);
    main.variable(observer("d3")).define("d3", ["require"], _d3);
    const child1 = runtime.module(define1);
    main.import("Scrubber", child1);
    return main;
}


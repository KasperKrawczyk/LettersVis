import * as d3js from "https://cdn.skypack.dev/d3@7";
import ScrubberSetup, {updateScrubber} from "./scrubber.js"


const margin = {top: 50, right: 150, bottom: 350, left: 100};
const height = 800;
const width = 800;
const scaleY = scaleLinearY();
const scaleX = scaleLinearX();


function chart(bodySelection) {
    const svg = bodySelection
        // .classed("svg-container", true)
        .append("svg")
        .attr("viewBox", [0, 0, width, height])
        // .classed("svg-content-responsive", true);


    // controls zooming behaviour
    // svg.call(d3js.zoom()
    //     .extent([[0, 0], [width, height]])
    //     .scaleExtent([1, 3])
    //     .on("zoom", zoomed));
    //
    // function zoomed({transform}) {
    //     svg.attr("transform", transform);
    // }

    // end of zooming behaviour control


    let node = svg.append("g")
        .attr("stroke", "black")
        .selectAll("circle")


    let edge = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line");

    let text = svg.append("g")
        .attr("text-anchor", "middle")
        .attr('font-size', 8)
        .attr('font-family', '"Open Sans", sans-serif')
        .selectAll("text")


    function tickCurData() {
        node.attr("cx", d => scaleX(d.x))
            .attr("cy", d => scaleY(d.y));

        edge.attr("x1", d => scaleX(d.source.x))
            .attr("y1", d => scaleY(d.source.y))
            .attr("x2", d => scaleX(d.target.x))
            .attr("y2", d => scaleY(d.target.y));

        text.attr("x", d => scaleX(d.x))
            .attr("y", d => scaleY(d.y))

    }

    return Object.assign(svg.node(), {
        update(data) {

            node = node.data(data.curNodes, d => d.label)
                .join(enter => enter.append("circle")
                    .attr("r", d => radius(d.label))
                    .attr("fill", d => color(d.label))
                    .call(node => (node.append("title"))
                        .text(d => d.label)));

            text = text.data(data.curNodes.filter(d => !(hasNumber(d.label)), d => d.label))
                .join('text')
                .text(node => node.label)

            edge = edge.data(data.curEdges, d => [d.source, d.target])
                .join("line")
                .attr("stroke-width", d => edgeWidth(d.target.label, d.recipientLabel))
                .attr("stroke", d => edgeColor(d.target.label, d.recipientLabel));

            tickCurData();
        }

    });
}

function updateTickerFactory(chart, currentData) {
    const chartObject = chart;
    return (
        chartObject.update(currentData)
    )
}

function edgeColor(targetLabel, authorLabel) {
    if (targetLabel === authorLabel) {
        return "#1895e2";
    } else {
        return "#999";
    }
}

function edgeWidth(targetLabel, authorLabel) {
    if (targetLabel === authorLabel) {
        return 2;
    } else {
        return 1;
    }
}

function scaleLinearY() {
    return (
        d3js.scaleLinear([0, 200], [margin.top, height - margin.bottom])
    )
}

function scaleLinearX() {
    return (
        d3js.scaleLinear([0, 200], [margin.left, width - margin.right])
    )
}

function radius(label) {
    if (label === "Isabelle de Charrière" || label === "Elizabeth Robinson Montagu") {
        return 8
    } else if (!hasNumber(label)) {
        return 5
    } else {
        return 3
    }

}

function color(label) {
    if (label === "Isabelle de Charrière" || label === "Elizabeth Robinson Montagu") {
        return "#f03b20b5"
    } else if (!hasNumber(label)) {
        return "#a6cee3"
    } else {
        return "#5ecc3a"
    }
}


export function hasNumber(string) {
    return /-[0-9]{2}|-[0-9]{1}/.test(string);
}

/*
takes in an actual UTC date
 */
function dataAtFactory(data) {
    const nodes = data.nodes;
    const edges = data.edges;

    return function dataAt(date) {
        let curNodes = nodes
            .filter(n => contains(n.start, n.end, date))
            .map(d => ({
                start: d.start,
                end: d.end,
                label: d.label,
                x: valueAt(d.coordinates, "x", date),
                y: valueAt(d.coordinates, "y", date),
            }));
        let curEdges = edges
            .filter(e => contains(e.start, e.end, date))
            .map(edge => ({
                start: edge.start,
                end: edge.end,
                source: curNodes.find(node => node.label === edge.sourceLabel),
                target: curNodes.find(node => node.label === edge.targetLabel),
                authorLabel: edge.authorLabel,
                recipientLabel: edge.recipientLabel
            }));
        return {
            curNodes,
            curEdges
        }
    }
}


function contains(start, end, date) {
    const dateUTC = new Date(date);
    const year = dateUTC.getUTCFullYear();
    return start <= year && year < end;

}


function valueAt(coordinateArray, coordString, date) {
    const dateUTC = new Date(date);
    let curYear = dateUTC.getUTCFullYear() + ((dateUTC.getUTCMonth()) / 11);
    const rightIndex = coordinateArray.findIndex(coordinate => coordinate.time > curYear);
    return interpolateCoordinates(coordinateArray, coordString, rightIndex, curYear)
}

function interpolateCoordinates(coordinateArray, coordString, rightIndex, curYear) {
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

    const newCoord = leftCoordObj[coordString] + ((rightCoordObj[coordString] - leftCoordObj[coordString]) * dateOffset);

    return newCoord;
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


function dates(data) {
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

function datesConstrained(data, minYear, maxYear) {
    const sortedNodes = data.nodes
        .sort((a, b) => d3js.ascending(a.start, b.start));
    const firstYear = Math.max(Math.floor(sortedNodes[0].start), minYear);
    const lastYear = Math.min(Math.ceil(sortedNodes[sortedNodes.length - 1].end) - 1, maxYear);
    console.log(firstYear)
    console.log(lastYear)

    return (
        interval().range(
            new Date(Date.UTC(firstYear, 0, 1)),
            new Date(Date.UTC(lastYear, 0, 1))
        )
    )
}


export function def(bodySelection, data, scrubberForm) {
    let dateRange = dates(data);
    let dataAt = dataAtFactory(data);
    let chartObject = chart(bodySelection);
    if (document.getElementById("networkChart") != null) document.getElementById("networkChart").remove();
    chartObject.setAttribute('id', 'networkChart')
    ScrubberSetup(
        dateRange,
        scrubberForm,
        dataAt,
        chartObject,
        {
            format: value => ("date = " + value.toLocaleDateString()),
            loop: true,
            alternate: false,
            delay: 30
        })
}



export function defDatesConstrained(bodySelection, data, scrubberForm, minYear, maxYear) {
    let dateRange = datesConstrained(data, minYear, maxYear);
    let dataAt = dataAtFactory(data);
    let chartObject = chart(bodySelection);
    if (document.getElementById("networkChart") != null) document.getElementById("networkChart").remove();
    ScrubberSetup(
        dateRange,
        scrubberForm,
        dataAt,
        chartObject,
        {
            format: value => ("date = " + value.toLocaleDateString()),
            loop: true,
            alternate: true,
            delay: 30
        })
    chartObject.setAttribute('id', 'networkChart')

}

// export function update(bodySelection, data, scrubberForm) {
//     let dateRange = dates(data);
//     let dataAt = dataAtFactory(data);
//     let chartObject = chart(bodySelection);
//     if (document.getElementById("networkChart") != null) document.getElementById("networkChart").remove();
//     chartObject.setAttribute('id', 'networkChart')
//
//     updateScrubber(dateRange,
//         scrubberForm,
//         dataAt,
//         chartObject,{
//             format: value => ("date = " + value.toLocaleDateString()),
//             autoplay: true,
//             loop: true
//         })
// }

export function forceRedraw(element) {

    if (!element) {
        return;
    }

    var n = document.createTextNode(' ');
    var disp = element.style.display;  // don't worry about previous display style

    element.appendChild(n);
    element.style.display = 'none';

    setTimeout(function () {
        element.style.display = disp;
        n.parentNode.removeChild(n);
    }, 20); // you can play with this timeout to make it as short as possible
}

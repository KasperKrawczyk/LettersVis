import * as d3js from "https://cdn.skypack.dev/d3@7";
import {hasNumber} from "./visualiser.js"


export async function fetchData(url) {
    let response = await fetch(url);
    let object = await response.json();
    return object;
}

export function setOnChangeGetAllOptions(listBox) {

    return listBox.getAllSelectedOptions = function () {
        const set = new Set()

        const len = listBox.options.length;
        for (let i = 0; i < len; i++) {
            const option = listBox.options[i];

            if (option.selected) { // || option.textContent === "Isabelle de Charrière" || option.textContent === "Elizabeth Robinson Montagu") {
                set.add(option.textContent);
            }
        }
        return set;

    }

}

export function filterData(data, namesSet) {

    const nodes = data.nodes.filter(node => checkNode(node, namesSet));
        // .map(node => ({
        //     coordinates: node.coordinates,
        //     start: node.start,
        //     end: node.end,
        //     label: node.label
        // }));


    const edges = data.edges.filter(edge => checkEdge(edge, namesSet));
        // .map(edge => ({
        //     sourceLabel: edge.sourceLabel,
        //     targetLabel: edge.targetLabel,
        //     authorLabel: edge.authorLabel,
        //     recipientLabel: edge.recipientLabel,
        //     start: edge.start,
        //     end: edge.end
        // }));
    return {
        nodes: nodes,
        edges: edges
    };
}

function isMainPerson(node) {
    return node.label === "Isabelle de Charrière" || node.label === "Elizabeth Robinson Montagu"
}

function checkNode(node, namesSet) {
    if (hasNumber(node.label)) {
        const labels = node.label.split("_");
        return (namesSet.has(labels[0]) && namesSet.has(labels[1])); // for letter nodes the label format is name1_name2_letterDate
    } else {
        // console.log(node.label)
        return namesSet.has(node.label) || isMainPerson(node);
    }
}

function checkEdge(edge, namesSet) {
    let isGoodEdge = _checkLabel(edge.sourceLabel, namesSet);
    return isGoodEdge && _checkLabel(edge.targetLabel, namesSet);
}

function _checkLabel(label, namesSet) {
    if (hasNumber(label)) {
        const labels = label.split("_");
        return (namesSet.has(labels[0]) && namesSet.has(labels[1]));
    } else {
        return namesSet.has(label);
    }
}

function _isRegularPerson(label) {
    return !hasNumber(label) && label !== "Elizabeth Robinson Montagu" && label !== "Isabelle de Charrière"
}

export function populateListboxWithNodes(nodes, listBox) {
    nodes
        .sort((a, b) => d3js.descending(a.label, b.label))
        .filter(node => !hasNumber(node.label))
        .forEach(node => {
            const option = document.createElement("option");
            option.textContent = node.label;
            option.value = node.label;
            listBox.appendChild(option);
        })
}
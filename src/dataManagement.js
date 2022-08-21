import * as d3js from "https://cdn.skypack.dev/d3@7";
import {hasNumber} from "./visualiser.js"


export async function fetchData(url) {
    let response = await fetch(url);
    let object = await response.json();
    console.log(object)
    return object;
}

export function setOnChangeGetAllOptions(listBox){
    listBox.getAllSelectedOptions = function () {
        const set = new Set()
        const len = listBox.options.length;
        for (let i = 0; i < len; i++) {
            const option = listBox.options[i];

            if (option.selected) {
                set.add(option.textContent);
            }
        }
        console.log(set)
        return set;
    }
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
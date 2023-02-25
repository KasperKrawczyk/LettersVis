import * as d3js from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

import {def, defDatesConstrained} from "./visualiser.js"
import {fetchData, filterData, populateListboxWithNodes, setOnChangeGetAllOptions} from "./dataManagement.js";
import {defDateSpanSlider} from "./dateSpan.js";

const data = await fetchData("./files/bipartite_merged_all.json")
defDateSpanSlider($("#slider-range"), data)

populateListboxWithNodes(data.nodes, document.getElementById("namesListBox"));
const peopleSelector = setOnChangeGetAllOptions(document.getElementById("namesListBox"));
const list = document.getElementById("namesListBox");
def(d3js.select(".body"), data, document.getElementById("scrubberForm"))

// console.log("slider-range" + document.getElementById("slider-range"))
document.getElementById("slider-range").addEventListener("newdatespan", e => {
    let namesSet = peopleSelector();
    let curData = data;
    if (namesSet.size !== 0) {
        curData = filterData(data, namesSet);
    }
    defDatesConstrained(
        d3js.select(".body"),
        curData,
        document.getElementById("scrubberForm"),
        e.detail.newMinDate,
        e.detail.newMaxDate
    )

})
list.addEventListener("change", function () {
    let namesSet = peopleSelector();
    let curData = filterData(data, namesSet);
    def(d3js.select(".body"), curData, document.getElementById("scrubberForm"))
})

import * as d3js from "https://cdn.skypack.dev/d3@7";


export function defDateSpanSlider (sliderRange, data) {
    const dates = _dates(data);
    const minDate = dates.min;
    const maxDate = dates.max;
    let curMin = 0;
    let curMax = 0;
    $( function() {
        sliderRange.slider({
            range: true,
            min: minDate,
            max: maxDate,
            values: [minDate, maxDate],
            stop: function (event, ui) {
                curMin = ui.values[0];
                curMax = ui.values[1];
                this.dispatchEvent(new CustomEvent(
                    "newdatespan", {
                        detail: {
                            newMinDate: curMin,
                            newMaxDate: curMax
                        },
                        bubbles: true
                    }
                ))
            }
        });
    });
}

function _dates(data) {
    const sortedNodes = data.nodes
        .sort((a, b) => d3js.ascending(a.start, b.start));
    const firstYear = Math.floor(sortedNodes[0].start);
    const lastYear = Math.ceil(sortedNodes[sortedNodes.length - 1].end) - 1;

    return {
        min: firstYear,
        max: lastYear
    }
}
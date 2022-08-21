import * as d3js from 'https://d3js.org/d3.v7.min.js';

export default function Scrubber(values, form, dataAt, chartObject, {
    format = value => value,
    initial = 0,
    delay = null,
    autoplay = true,
    loop = true,
    loopDelay = null,
    alternate = false
} = {}) {
    values = Array.from(values);
    form.i.max = values.length;
    let frame = null;
    let timer = null;
    let interval = null;
    let direction = 1;

    function start() {
        form.b.textContent = "Pause";
        if (delay === null) frame = requestAnimationFrame(tick);
        else interval = setInterval(tick, delay);
    }

    function stop() {
        form.b.textContent = "Play";
        if (frame !== null) cancelAnimationFrame(frame), frame = null;
        if (timer !== null) clearTimeout(timer), timer = null;
        if (interval !== null) clearInterval(interval), interval = null;
        console.log("WHY?!")
    }

    function running() {
        return frame !== null || timer !== null || interval !== null;
    }

    function tick() {
        if (form.i.valueAsNumber === (direction > 0 ? values.length - 1 : direction < 0 ? 0 : NaN)) {
            if (!loop) return stop();
            if (alternate) direction = -direction;
            if (loopDelay !== null) {
                if (frame !== null) cancelAnimationFrame(frame), frame = null;
                if (interval !== null) clearInterval(interval), interval = null;
                timer = setTimeout(() => (step(), start()), loopDelay);
                return;
            }
        }
        if (delay === null) frame = requestAnimationFrame(tick);
        step();
    }

    function step() {
        form.i.valueAsNumber = (form.i.valueAsNumber + direction + values.length) % values.length;
        form.i.dispatchEvent(new CustomEvent("input", {bubbles: true}));
    }

    form.i.oninput = event => {
        if (event && event.isTrusted && running()) stop();
        form.value = values[form.i.valueAsNumber];
        form.o.value = format(form.value);
        const curData = dataAt(form.value);
        chartObject.update(curData);
    };
    form.b.onclick = () => {
        if (running()) return stop();
        direction = alternate && form.i.valueAsNumber === values.length - 1 ? -1 : 1;
        form.i.valueAsNumber = (form.i.valueAsNumber + direction) % values.length;
        form.i.dispatchEvent(new CustomEvent("input", {bubbles: true}));
        start();
    };
    form.i.oninput();
    if (autoplay) start();
    else stop();
    // Inputs.disposal(form).then(stop);
    return form;
}
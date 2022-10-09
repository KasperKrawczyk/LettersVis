// import { html, LitElement } from 'https://unpkg.com/lit-html@0.7.1/lit-html.js'

export default function ScrubberSetup(values, formContainer, dataAt, chartObject, {
    format = value => value,
    initial = 0,
    delay = null,
    autoplay = true,
    loop = true,
    loopDelay = null,
    alternate = false
} = {}) {
    values = Array.from(values);
    let frame = null;
    let timer = null;
    let interval = null;
    let direction = 1;

    formContainer.innerHTML =
        '<form id="form" style="font: 12px var(--sans-serif); font-variant-numeric: tabular-nums; display: flex; height: 33px; align-items: center;">\
            <button name=b type=button style="margin-right: 0.4em; width: 5em;"></button>\
            <label style="display: flex; align-items: center;">\
                <input name=i type=range min=0 max=0 value=0 step=1 style="width: 800px;">\
                <output name=o style="margin-left: 0.4em;"></output>\
            </label>\
        </form>';

    const form = document.getElementById("form");
    form.i.max = values.length - 1;

    function start() {
        form.b.textContent = "Pause";
        if (delay === null) frame = requestAnimationFrame(tick);
        else interval = setInterval(tick, delay);
        // console.log("INTERVAL = " + interval)
    }

    function reset() { //TODO is it worth developing?
        cancelAnimationFrame(frame), frame = null;
        clearTimeout(timer), timer = null;
        clearInterval(interval), interval = null;
        form.b.unbind();
        form.b.removeAttr('onclick');
        form.b.onclick = () => {
            if (running()) return stop();
            direction = alternate && form.i.valueAsNumber === values.length - 1 ? -1 : 1;
            form.i.valueAsNumber = (form.i.valueAsNumber + direction) % values.length;
            form.i.dispatchEvent(new CustomEvent("input", {bubbles: true}));
            start();
        };

    }

    function stop() {
        form.b.textContent = "Play";
        if (frame !== null) cancelAnimationFrame(frame), frame = null;
        if (timer !== null) clearTimeout(timer), timer = null;
        if (interval !== null) clearInterval(interval), interval = null;
        console.log("frame = " + frame + " || timer = " + timer + " || interval = " + interval)
    }

    function running() {
        console.log("frame = " + frame + " || timer = " + timer + " || interval = " + interval)

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
        let curData = dataAt(form.value);
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


export function updateScrubber(values, form, dataAt, chartObject, {
    format = value => value,
    loop = true,
    alternate = false,
    autoplay = false,
    delay = null,
    loopDelay = null
} = {}) {
    values = Array.from(values);
    form.i.max = values.length - 1;
    let curData = null;
    let frame = null;
    let timer = null;
    let interval = null;
    let direction = 1;

    function start() {
        form.b.textContent = "Pause";
        if (delay === null) frame = requestAnimationFrame(tick);
        else interval = setInterval(tick, delay);
        console.log("INTERVAL = " + interval)
    }
    function stop() {
        form.b.textContent = "Play";
        if (frame !== null) cancelAnimationFrame(frame), frame = null;
        if (timer !== null) clearTimeout(timer), timer = null;
        if (interval !== null) clearInterval(interval), interval = null;
        console.log("frame = " + frame + " || timer = " + timer + " || interval = " + interval)
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
    function running() {
        console.log("frame = " + frame + " || timer = " + timer + " || interval = " + interval)

        return frame !== null || timer !== null || interval !== null;

    }


    form.i.oninput = event => {
        if (event && event.isTrusted && running()) stop();
        form.value = values[form.i.valueAsNumber];
        form.o.value = format(form.value);
        curData = dataAt(form.value);
        chartObject.update(curData);
    };

    // form.i.oninput(); //TODO some fuckery going on in here
    if (autoplay) start();
    else stop();
}
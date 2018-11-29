export function convertMillisecondsToHourMinute(ms) {
    var d, h, m, s;
    s = Math.floor(ms / 1000);
    m = Math.floor(s / 60);
    s = s % 60;
    h = Math.floor(m / 60);
    m = m % 60;
    if (m.toString().length === 1) {
        m = '0' + m;
    }
    d = Math.floor(h / 24);
    h = h % 24;
    h += d * 24;
    if (h.toString().length === 1) {
        h = '0' + h;
    }
    return h + ':' + m;
}

export function convertSecondsToHourMinute(seconds) {
    const d = Number(seconds);
    let h = Math.floor(d / 3600);
    let m = Math.floor(d % 3600 / 60);
    let s = Math.floor(d % 3600 % 60);

    const hDisplay = h > 0 ? h + (h === 1 ? " hour, " : " hours, ") : "";
    const mDisplay = m > 0 ? m + (m === 1 ? " minute, " : " minutes, ") : "";
    const sDisplay = s > 0 ? s + (s === 1 ? " second" : " seconds") : "";
    return hDisplay + mDisplay + sDisplay;
}

export function getColor(category, type) {

    if (type === 100) {
        return '#B21016';
    }

    switch (category) {
        case 'Weight loss and healthy heart (Cardio)':
            return '#68BA18';
        case "D´stress and relax (Mind-body)":
            return "#127931";
        case "Kids (Kids)":
            return "#CF5400";
        case "Senior (Senior)":
            return "#CF5400";
        case "Cycling (Cycling)":
            return "#007AAE";
        case "Strong and firm (Conditioning)":
            return "#007364";
        default:
            return "yellow";
    }
}


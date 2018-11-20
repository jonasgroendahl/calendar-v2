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

export function getLanguage(obj) {
    if (obj.sf_dansk) {
        return 'Danish';
    }
    else if (obj.sf_engelsk) {
        return 'English';
    }
    else if (obj.sf_finsk) {
        return 'Finnish';
    }
    else if (obj.sf_fransk) {
        return 'French';
    }
    else if (obj.sf_graesk) {
        return 'Greek';
    }
    else if (obj.sf_hollandsk) {
        return 'Dutch';
    }
    else if (obj.sf_italiensk) {
        return 'Italian';
    }
    else if (obj.sf_japanese) {
        return 'Japanese';
    }
    else if (obj.sf_norsk) {
        return 'Norwegian';
    }
    else if (obj.sf_polish) {
        return 'Polish';
    }
    else if (obj.sf_spansk) {
        return 'Spanish';
    }
    else if (obj.sf_svensk) {
        return 'Swedish';
    }
    else if (obj.sf_tysk) {
        return 'German';
    }
    else {
        return 'Unknown language';
    }
}

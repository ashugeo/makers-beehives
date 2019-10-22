$(document).ready(() => {
    $.getJSON('data.json', json => showData(json));
});

function showData(json) {
    let html = '';

    const latest = json[0];

    const date = `Last update on ${latest.date.split(' ')[0]} at ${latest.date.split(' ')[1]}`;
    $('#latest-date').html(date);

    $('#camera-feed h3').after(`<div class="image"><img src="${latest.image}"><span class="live"><i class="fas fa-video"></i>Live</span></div>`);

    const previous = json[1];

    for (const type of Object.keys(latest.data)) {
        if (['battery', 'panel'].includes(type)) continue;
        const value = latest.data[type];
        const previousValue = previous.data[type];

        $(`.box#${type} h5 span.value`).html(value);

        if (previousValue === 0) continue;
        const delta = Math.round((value / previousValue * 100 - 100) * 10) / 10;
        console.log(value, previousValue, delta);
        $(`.box#${type} p`).html(`${delta > 0 ? '<span class="plus">+' : '<span class="minus">'}${delta}%</span>`);

        createChart($(`.box#${type} canvas`), json);
    }

    const units = {
        light: ' lux',
        temperature: '°C',
        humidity: '%',
        noise: ' dB',
        co: ' ppm',
        no2: ' ppm'
    }


    for (let i = 0; i < 8; i += 1) {
        const mesure = json[i];

        html = '<tr>';
        html += `<td>${mesure.date}</td>`;
        for (const type of ['light', 'temperature', 'humidity', 'noise', 'co', 'no2']) {
            html += `<td>${mesure.data[type]}${units[type]}</td>`;
        }
        html += '</tr>'
        $('table tbody').append(html);
    }
}

function createChart($el, json) {
    const type = $el.parent('.box').attr('id');

    const data = {
        labels: [],
        datasets: [{
            label: 'test',
            data: [],
            backgroundColor: 'rgba(226, 0, 26, 0.15)',
            borderColor: 'rgba(226, 0, 26, .8)',
            borderWidth: 1.5,
            pointRadius: 0
        }]
    }

    for (let i = 10; i >= 0; i -= 1) {
        let date = json[i].date;
        date = `${date.split('/')[0]}/${date.split('/')[1]}`
        data.labels.push(date);

        const value = json[i].data[type];
        data.datasets[0].data.push(value);
    }

    var ctx = $el[0].getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data,
        options: {
            layout: {
                padding: 4
            },
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    display: false,
                }],
                yAxes: [{
                    display: false,
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}
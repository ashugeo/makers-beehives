let json = {};

$(document).ready(() => {
    // $.getJSON('data.json', data => {
    //     json = data;
    //     showData();
    // });

    $.getJSON("https://sheets.googleapis.com/v4/spreadsheets/1cJRaDxrSRpd754ncW69N8Kk84PlfYFvD9PlvOZIjPls/?key=AIzaSyDXfpXBCz1AZ_lN3R3lZZ42Jprpv4RFka8&includeGridData=true", data => {
        json = data.sheets[4].data[0].rowData;
        showData();
    });
});

function showData() {
    let html = '';

    const latest = json[0];

    const date = `Last update on ${latest.values[0].formattedValue.split(' ')[0]} at ${latest.values[0].formattedValue.split(' ')[1]}`;
    $('#latest-date').html(date);

    $('#camera-feed .image').remove();

    $('#camera-feed h3').after(`<div class="image"><img src="${latest.values[2].formattedValue}"><span class="live"><i class="fas fa-video"></i>Live</span></div>`);

    const previous = json[1];

    const parsedData = JSON.parse(latest.values[1].formattedValue);

    for (const type of Object.keys(parsedData)) {
        if (['battery', 'panel'].includes(type)) continue;

        let value = parsedData[type];
        let previousValue = JSON.parse(previous.values[1].formattedValue)[type];

        $(`.box#${type} h5 span.value`).html(value);

        if (previousValue === 0) continue;
        const delta = Math.round((value / previousValue * 100 - 100) * 10) / 10;

        $(`.box#${type} p`).html(`${delta > 0 ? '<span class="plus">+' : '<span class="minus">'}${delta}%</span>`);

        createChart($(`.box#${type} canvas`), json);
    }

    $('table tbody').empty();
    fillTable(0);
}

let startAt = 0;

function fillTable() {
    startAt += 8;

    const units = {
        light: ' lux',
        temperature: '°C',
        humidity: '%',
        noise: ' dB',
        co: ' ppm',
        no2: ' ppm'
    }

    for (let i = startAt; i < startAt + 8; i += 1) {
        const mesure = json[i];
        if (!mesure) {
            $('#load-older').remove();
            continue;
        };

        html = '<tr>';
        html += `<td>${mesure.values[0].formattedValue}</td>`;
        for (const type of ['light', 'temperature', 'humidity', 'noise', 'co', 'no2']) {
            html += `<td>${JSON.parse(mesure.values[1].formattedValue)[type]}${units[type]}</td>`;
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
        console.log(json[i]);
        let date = json[i].values[0].formattedValue;
        date = `${date.split('/')[0]}/${date.split('/')[1]}`
        data.labels.push(date);

        let value = JSON.parse(json[i].values[1].formattedValue)[type];

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

$(document).on('click', '#load-older', fillTable);

$(document).on('click', 'nav ul li', (e) => {
    const $el = $(e.target);

    $('nav ul li.selected').removeClass('selected');
    $el.addClass('selected');

    const id = parseInt($el.attr('id').replace('beehive', ''));

    $.getJSON("https://sheets.googleapis.com/v4/spreadsheets/1cJRaDxrSRpd754ncW69N8Kk84PlfYFvD9PlvOZIjPls/?key=AIzaSyDXfpXBCz1AZ_lN3R3lZZ42Jprpv4RFka8&includeGridData=true", data => {
        json = data.sheets[id].data[0].rowData;
        showData();
    });

    // $.getJSON('data.json', data => {
    //     json = data;
    //     showData();
    // });
});

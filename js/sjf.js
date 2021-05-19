
var ready_queue = [];
var FIRST_PROCESS = [];
var GLOBAL_startTime = null;
var GLOBAL_endTime = null;
var my_console = $('#cust_console');
var my_gantt_chart = $('#gantt_chart');
var my_colors = [
    '#9b9fab',
    '#92b9dd',
    '#275f96',
    '#ff8181'
    
];
var num = 4
function loadValues() {

    $('input').each(function () {
        $(this).val(Math.floor(Math.random() * 10) + 1);
    });
    $('#INIT_COMPUTE').click(function () {
        if (checkValues()) {
            my_gantt_chart.empty();
            for (var i = 0; i <= GET_BURSTTIME_TOTAL(); i++) {
                $('.arrival_time').each(function (index) {
                    var curr_arrival_time = Math.round(parseFloat($(this).val()));
                    if (curr_arrival_time == parseFloat(i)) {
                        var process_number = index + 1;
                        var curr_bursttime = parseFloat($('[data-process="' + (process_number) + '"][class="burst_time"]').val());

                        if (FIRST_PROCESS.length == 0) {
                            FIRST_PROCESS.push(process_number + '?' + curr_bursttime);
                        } else {
                            ready_queue.push(process_number + '?' + curr_bursttime);
                        }
                    }
                });
            }

            ready_queue.sort(function (a, b) {
                return a.split('?')[1] - b.split('?')[1]
            });
            ready_queue = FIRST_PROCESS.concat(ready_queue);

            var loop_length = parseFloat(ready_queue.length);
            my_gantt_chart.empty();
            for (var o = 0; o < loop_length; o++) {
                var tmp_process = ready_queue[0].split('?')[0];
                var tmp_burst = parseFloat(ready_queue[0].split('?')[1]);
                ready_queue.shift();
                var tmp_at = parseFloat($('[class="arrival_time"][data-process="' + tmp_process + '"]').val());

                if (GLOBAL_startTime == null) {
                    GLOBAL_startTime = tmp_at;
                }

                if (GLOBAL_startTime < tmp_at) {
                    $('#gantt_chart').append('<div class="gantt_block bubble" style="background-color:#EEEDEB; width: 10%; color: black;">BUBBLE<br/>' + GLOBAL_startTime + ' - ' + tmp_at + '</div>');
                    GLOBAL_startTime = tmp_at;
                }

                GLOBAL_endTime = GLOBAL_startTime + tmp_burst;


                var wt = GLOBAL_startTime - tmp_at;
                var tat = GLOBAL_endTime - tmp_at;

                $('#P' + tmp_process + '_WT').empty().append(wt);
                $('#P' + tmp_process + '_TAT').empty().append(tat);

                var curr_width = ((tmp_burst / GET_BURSTTIME_TOTAL()) * 80);

                $('#gantt_chart').append('<div class="gantt_block" style="background-color: ' + my_colors[o % 4] + '; width: ' + curr_width + '%;">P' + tmp_process + '<br/>' + GLOBAL_startTime + ' - ' + GLOBAL_endTime + '</div>');

                GLOBAL_startTime = GLOBAL_endTime;
            }


            var total_tat = 0;
            $('.TAT').each(function (index, value) {
                total_tat += parseFloat($(this).text());
            });
            $('#AVG_TAT').empty().append((parseFloat(total_tat) / parseFloat(loop_length)));

            var total_wt = 0;
            $('.WT').each(function (index, value) {
                total_wt += parseFloat($(this).text());
            });
            $('#AVG_WT').empty().append((parseFloat(total_wt) / parseFloat(loop_length)));
        }
    });
    $('#methods').change(function () {
        location.href = $(this).val();
    })
};
$(document).ready(loadValues);
function GET_BURSTTIME_HIGHEST() {
    var x = 0;
    $('.burst_time').each(function (index) {
        var bt = parseFloat($(this).val());
        if (bt > 0) {
            x = bt;
        }
    });

    return parseFloat(x);
}

function GET_BURSTTIME_TOTAL() {
    var total = 0.0;
    $('.burst_time').each(function (index) {
        total += parseFloat($(this).val());
    });

    if (parseFloat(total) < GET_ARRIVALTIME_HIGHEST()) {
        total = GET_ARRIVALTIME_HIGHEST();
    }

    return parseFloat(total);
}

function GET_ARRIVALTIME_HIGHEST() {
    var highest = 0;
    $('.arrival_time').each(function () {
        if (highest == 0) {
            highest = parseFloat($(this).val());
        }
        if (parseFloat($(this).val()) > highest) {
            highest = parseFloat($(this).val());
        }
    });
    return parseFloat(highest);
}

function checkValues() {
    var flag = true;
    $('#cust_console').empty();
    $('.arrival_time').each(function (index) {

        if ($(this).val() == '' || !$.isNumeric($(this).val())) {
            $('#cust_console').append('Please input a number for Arrival Time for Process P' + (index + 1) + '<br/>');
            flag = false;
        }
    })
    $('.burst_time').each(function (index) {
        // check if burst_time is filled out
        if ($(this).val() == '' || !$.isNumeric($(this).val())) {
            $('#cust_console').append('Please input a number for Burst Time for Process P' + (index + 1) + '<br/>');
            flag = false;
        }
    })
    $('.priority').each(function (index) {
        // check if burst_time is filled out
        if ($(this).val() == '' || !$.isNumeric($(this).val())) {
            $('#cust_console').append('Please input a number for Priority for Process P' + (index + 1) + '<br/>');
            flag = false;
        }
    })

    return flag;
}
function addRow() {
    var lastRow = $('#table tr:last');
    var table = document.getElementById('table')
    let row = '<tr><td>P'
        + (num + 1)
        + '</td><td><input data-process='
        + (num + 1)
        + ' type="text" class="arrival_time" /></td><td><input data-process='
        + (num + 1)
        + ' type="text" class="burst_time" /></td><td><span class="TAT" id="P'
        + (num + 1)
        + '_TAT"></span></td><td><span class="WT" id="P'
        + (num + 1)
        + '_WT"></span></td></tr>';
    lastRow.before(row)
    num += 1
    loadValues()
}

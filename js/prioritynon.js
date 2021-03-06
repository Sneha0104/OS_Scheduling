
var ready_queue = [];
var cpu_process = null;
var cpu_bursttime = null;
var GLOBAL_startTime = null;
var GLOBAL_endTime = null;
var GLOBAL_bubbleStart = null;
var GLOBAL_bubbleEnd = null;
var my_console = $('#cust_console');
var my_gantt_chart = $('#gantt_chart');
var my_colors = [
    '#FFCCBB',
    '#F78D7D',
    '#CB9897',
    '#9BB9C3'
   
];
var i = null;
var pr_done = 0;

var num = 4
function loadValues() {
    $('#methods').change(function () {
        location.href = $(this).val();
    });
    $('input').each(function () {
        $(this).val(Math.floor(Math.random() * 10) + 1);
    });
    $('#INIT_COMPUTE').click(function () {
        if (checkValues()) {
            i = GET_ARRIVALTIME_LOWEST();
            do {
                PROCESS_ARRIVALS(i);
                if (cpu_process != null) {
                    if (i == GLOBAL_endTime) {
                        var curr_width = (((GLOBAL_endTime - GLOBAL_startTime) / GET_BURSTTIME_SUM()) * 80);
                        $('#gantt_chart').append('<div data-process="' + cpu_process + '" data-start="' + GLOBAL_startTime + '" data-end="' + GLOBAL_endTime + '" class="gantt_block" style="background-color: ' + my_colors[(cpu_process - 1) % 4] + '; width: ' + curr_width + '%;">P' + cpu_process + '<br/>' + GLOBAL_startTime + ' - ' + GLOBAL_endTime + '</div>');
                        pr_done++;


                        var curr_arrivaltime = parseFloat($('[data-process="' + cpu_process + '"][class="arrival_time"]').val());
                        $('#P' + cpu_process + '_TAT').append(GLOBAL_endTime - curr_arrivaltime);
                        $('#P' + cpu_process + '_WT').append(GLOBAL_startTime - curr_arrivaltime);

                        cpu_process = null;
                        cpu_bursttime = null;
                    }
                }

                if (cpu_process == null) {
                    if (ready_queue.length > 0) {
                        if (GLOBAL_bubbleStart != null) {
                            var bubble_width = ((i - GLOBAL_bubbleStart) / GET_BURSTTIME_SUM()) * 80;
                            $('#gantt_chart').append('<div class="bubble" style="background-color: #EEEDEB; width: ' + bubble_width + '%;  color: black;">BUBBLE<br/>' + GLOBAL_bubbleStart + ' - ' + i + '</div>');
                            GLOBAL_bubbleStart = null;
                        }
                        cpu_process = ready_queue[0].split('?')[0];
                        cpu_bursttime = parseFloat(ready_queue[0].split('?')[1]);
                        ready_queue.shift();
                        GLOBAL_startTime = i;
                        GLOBAL_endTime = GLOBAL_startTime + cpu_bursttime;
                    } else {
                        if (GLOBAL_bubbleStart == null) {
                            GLOBAL_bubbleStart = i;
                        }
                    }
                }
                i++;

            } while (pr_done < 4);


            var total_TAT = 0;
            $('.TAT').each(function (index) {
                total_TAT += parseFloat($(this).text());
            });
            $('#AVG_TAT').empty().append((total_TAT / 4));

            var total_WT = 0;
            $('.WT').each(function (index) {
                total_WT += parseFloat($(this).text());
            });
            $('#AVG_WT').empty().append((total_WT / 4));
        }
    })
};
$(document).ready(loadValues);
function GET_BURSTTIME_SUM() {
    var total = 0.0;
    $('.burst_time').each(function (index) {
        total += parseFloat($(this).val());
    });

    return (total + GET_ARRIVALTIME_LOWEST());
}

function PROCESS_ARRIVALS(time) {
    var arrival_flag = false;
    $('.arrival_time').each(function (index) {
        var curr_arrival_time = Math.round(parseFloat($(this).val()));
        if (curr_arrival_time == parseFloat(time)) {
            var process_number = index + 1;
            var curr_bursttime = parseFloat($('[data-process="' + (process_number) + '"][class="burst_time"]').val());
            var curr_prio = parseFloat($('[data-process="' + (process_number) + '"][class="priority"]').val());
            ready_queue.push(process_number + '?' + curr_bursttime + '?' + curr_prio);
            console.log(time + '\t: PR ARRVD : ' + process_number + '/' + curr_bursttime + ' | ' + ready_queue);
            SORT_READY_QUEUE();
            arrival_flag = true;
        }
    });
    return arrival_flag;
}

function GET_ARRIVALTIME_LOWEST() {
    var lowest = GET_ARRIVALTIME_HIGHEST();
    $('.arrival_time').each(function () {
        if (parseFloat($(this).val()) < lowest) {
            lowest = parseFloat($(this).val());
        }
    });

    return lowest;
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
    $('.arrival_time').each(function (index) {

        if ($(this).val() == '' || !$.isNumeric($(this).val())) {
            $('#cust_console').append('Please input a number for Arrival Time for Process P' + (index + 1) + '<br/>');
            flag = false;
        }
    })
    $('.burst_time').each(function (index) {

        if ($(this).val() == '' || !$.isNumeric($(this).val())) {
            $('#cust_console').append('Please input a number for Burst Time for Process P' + (index + 1) + '<br/>');
            flag = false;
        }
    })
    $('.priority').each(function (index) {

        if ($(this).val() == '' || !$.isNumeric($(this).val())) {
            $('#cust_console').append('Please input a number for Priority for Process P' + (index + 1) + '<br/>');
            flag = false;
        }
    })

    return flag;
}

function SORT_READY_QUEUE() {
    ready_queue.sort(function (a, b) { // sort queue by lowest priority first
        return a.split('?')[2] - b.split('?')[2]
    });
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
        + ' type="text" class="burst_time" /></td><td><input data-process='
        + (num + 1)
        + ' type="text" class="priority" /></td><td><span class="TAT" id="P'
        + (num + 1)
        + '_TAT"></span></td><td><span class="WT" id="P'
        + (num + 1)
        + '_WT"></span></td></tr>';
    lastRow.before(row)
    num += 1
    loadValues()
}

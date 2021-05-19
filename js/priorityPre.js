
var ready_queue = [];
var cpu_process = null;
var cpu_bursttime = null;
var cpu_priority = null;
var GLOBAL_startTime = null;
var GLOBAL_endTime = null;
var GLOBAL_bubbleStart = null;
var GLOBAL_bubbleEnd = null;
var my_console = $('#cust_console');
var my_gantt_chart = $('#gantt_chart');
var my_colors = [
    '#9b9fab',
    '#92b9dd',
    '#275f96',
    '#ff8181'
];
var pr_done = 0;
var num = 4
function loadValues() {

    $('input').each(function () {
        $(this).val(Math.floor(Math.random() * 15) + 1);
    });

    $('#INIT_COMPUTE').click(function () {
        if (checkValues()) {
            var i = GET_ARRIVALTIME_LOWEST();
            do {
                PROCESS_ARRIVALS(i);

                if (cpu_process != null) {
                    cpu_bursttime--;
                    console.log(i + '\t: DCRMNT BT : P' + cpu_process + '/' + cpu_bursttime);

                    if (cpu_bursttime == 0) {
                        GLOBAL_endTime = i;
                        var bt_of_process = parseFloat(GLOBAL_endTime - GLOBAL_startTime);
                        var curr_width = ((bt_of_process / GET_BURSTTIME_SUM()) * 80);
                        $('#gantt_chart').append('<div data-process="' + cpu_process + '" data-start="' + GLOBAL_startTime + '" data-end="' + GLOBAL_endTime + '" class="gantt_block" style="background-color: ' + my_colors[(cpu_process - 1) % 4] + '; width: ' + curr_width + '%;">P' + cpu_process + '<br/>' + GLOBAL_startTime + ' - ' + GLOBAL_endTime + '</div>');
                        console.log(i + '\t: ' + ' ADD_GANTT_1 = ' + cpu_process + '/' + cpu_bursttime);
                        cpu_process = null;
                        cpu_bursttime = null;
                        pr_done++;
                    }
                }

                if (cpu_process == null) {
                    if (ready_queue.length > 0) {
                        SORT_READY_QUEUE();
                        cpu_process = ready_queue[0].split('?')[0];
                        cpu_bursttime = ready_queue[0].split('?')[1];
                        cpu_priority = parseFloat(ready_queue[0].split('?')[2]);
                        ready_queue.shift();
                        GLOBAL_startTime = i;

                        if (GLOBAL_bubbleStart != null) {
                            console.log(i + '\t: BUBBLE END');
                            var bubble_width = ((i - GLOBAL_bubbleStart) / GET_BURSTTIME_SUM()) * 80;
                            $('#gantt_chart').append('<div class="bubble" style="background-color: #EEEDEB; width: ' + bubble_width + '%; color: black;">BUBBLE<br/>' + GLOBAL_bubbleStart + ' - ' + i + '</div>');
                            GLOBAL_bubbleStart = null;
                        }

                        console.log(i + '\t: ADD PR to CPU : P' + cpu_process + '/' + cpu_bursttime);
                    } else {
                        if (GLOBAL_bubbleStart == null) {
                            GLOBAL_bubbleStart = i;
                        }
                        console.log(i + '\t: BUBBLE INC - Start = ' + GLOBAL_bubbleStart);
                    }
                } else {

                    if (ready_queue.length > 0) {
                        SORT_READY_QUEUE();
                        var og_temp_pr = ready_queue[0].split('?')[0];
                        var og_temp_bt = ready_queue[0].split('?')[1];
                        var og_temp_prio = parseFloat(ready_queue[0].split('?')[2]);
                        console.log(i + '\t:' + og_temp_prio + ' < ' + cpu_priority + ' = ' + (og_temp_prio <= cpu_priority));
                        if (og_temp_prio < cpu_priority) {
                            GLOBAL_endTime = i; // change end time to loop value `i`
                            var bt_of_process = parseFloat(GLOBAL_endTime - GLOBAL_startTime);
                            var curr_width = ((bt_of_process / GET_BURSTTIME_SUM()) * 80);
                            $('#gantt_chart').append('<div data-process="' + cpu_process + '" data-start="' + GLOBAL_startTime + '" data-end="' + GLOBAL_endTime + '" class="gantt_block" style="background-color: ' + my_colors[(cpu_process - 1)] + '; width: ' + curr_width + '%;">P' + cpu_process + '<br/>' + GLOBAL_startTime + ' - ' + GLOBAL_endTime + '</div>');
                            console.log(i + '\t: ' + ' ADD_GANTT_2 = ' + cpu_process + '/' + cpu_bursttime);


                            console.log(i + '\t: CHNG PR : P' + cpu_process + '/' + cpu_bursttime + ' to ' + og_temp_pr + '/' + og_temp_bt);
                            ready_queue.push(cpu_process + '?' + cpu_bursttime + '?' + cpu_priority);
                            cpu_process = og_temp_pr;
                            cpu_bursttime = og_temp_bt;
                            cpu_priority = og_temp_prio;
                            ready_queue.shift();
                            SORT_READY_QUEUE();
                            GLOBAL_startTime = i;
                        }
                    }
                }
                i++;
            } while (pr_done < 4);

            var et_array_p = [];
            var et_array_e = [];
            $('.gantt_block').each(function (index) {

                var tmp_process = parseFloat($(this).data('process'));
                var tmp_start = parseFloat($(this).data('start'));
                var tmp_end = parseFloat($(this).data('end'));
                var tmp_arrival = parseFloat($('[data-process="' + (tmp_process) + '"][class="arrival_time"]').val());

                var slctr_tat = $('#P' + tmp_process + '_TAT');
                var slctr_wt = $('#P' + tmp_process + '_WT');
                var inArray = $.inArray(tmp_process, et_array_p);

                slctr_tat.empty().append(tmp_end - tmp_arrival);

                var curr_wt = slctr_wt.text();
                if (inArray > -1) {
                    slctr_wt.empty().append(parseFloat(curr_wt) + (tmp_start - et_array_e[inArray]));
                    et_array_e[inArray] = tmp_end;
                } else {
                    slctr_wt.append(tmp_start - tmp_arrival);
                    et_array_p.push(tmp_process);
                    et_array_e.push(tmp_end);
                }
            });

            var total_tat = 0;
            $('.TAT').each(function (index) {
                total_tat += parseFloat($(this).text());
            });
            $('#AVG_TAT').empty().append((parseFloat(total_tat) / $('.TAT').length));
            var total_wt = 0;
            $('.WT').each(function (index) {
                total_wt += parseFloat($(this).text());
            });
            $('#AVG_WT').empty().append((parseFloat(total_wt) / $('.WT').length));
        }
    });

    $('#methods').change(function () {
        location.href = $(this).val();
    })
};
$(document).ready(loadValues);
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

function GET_BT_OF_PROCESS(cpu) {
    return parseFloat(Math.round($('[data-process="' + (cpu) + '"][class="burst_time"]').val()));
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

function GET_PROCESSTIME() {

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

function GET_BURSTTIME_SUM() {
    var total = 0.0;
    $('.burst_time').each(function (index) {
        total += parseFloat($(this).val());
    });

    return (total + GET_ARRIVALTIME_LOWEST());
}

function GET_PR_WITH_HIGHEST_AT_AND_BT() {
    var procAndBT = null;
    $('.arrival_time').each(function (index) {
        var curr_arrival_time = Math.round(parseFloat($(this).val()));
        var highest = 0;
        if (curr_arrival_time > highest) {
            highest = curr_arrival_time;
            procAndBT = [$(this).data('process'), parseFloat(highest)];
        }
    });

    return procAndBT;
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

function GET_BURSTTIME_TOTAL() {
    var total = 0.0;
    $('.burst_time').each(function (index) {
        total += parseFloat($(this).val());
    });

    if (GET_ARRIVALTIME_HIGHEST() > total) {
        total = GET_ARRIVALTIME_HIGHEST();
    }

    return parseFloat(total);
}

function SORT_READY_QUEUE() {
    ready_queue.sort(function (a, b) { // sort queue by lowest bt first
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

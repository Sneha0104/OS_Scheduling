

$(document).ready(function () {
    $('input').each(function () {
        $(this).val(Math.floor(Math.random() * 10) + 1);
    });
    $('#INIT_COMPUTE').click(function () {
        if (checkValues()) {
            var ready_queue = [];
            var my_gantt_chart = $('#gantt_chart');
            var my_colors = [
                '#9b9fab',
                '#92b9dd',
                '#275f96',
                '#ff8181'
            ];

            my_gantt_chart.empty();

            for (var x = 0; x <= GET_BURSTTIME_TOTAL(); x++) {
                $('.arrival_time').each(function (index) {
                    if (parseFloat(x) == parseFloat($(this).val())) {
                        ready_queue.push((index + 1));
                    }
                });
            }

            var start_time = GET_ARRIVALTIME_LOWEST();
            var end_time = 0;
            $.each(ready_queue, function (index, value) {
                var curr_process = 'P' + value;
                var curr_arrivaltime = $('[data-process="P' + value + '"][class="arrival_time"]').val();
                var curr_bursttime = $('[data-process="P' + value + '"][class="burst_time"]').val();
                var curr_width = (curr_bursttime / parseFloat(GET_BURSTTIME_TOTAL())) * 80;
                var elem_TAT = $('#' + curr_process + '_TAT');
                var elem_WT = $('#' + curr_process + '_WT');

                if (curr_arrivaltime > start_time) {
                    my_gantt_chart.append('<div class="gantt_block bubble" style="background-color: white; width: 10%; border: 1px solid #333333; color: black;">BUBBLE<br/>' + start_time + ' - ' + curr_arrivaltime + '</div>');
                    start_time = parseFloat(curr_arrivaltime);
                }

                end_time = start_time + parseFloat(curr_bursttime);
                my_gantt_chart.append('<div class="gantt_block" style="background-color: ' + my_colors[index] + '; width: ' + curr_width + '%;">' + curr_process + '<br/>' + start_time + ' - ' + end_time + '</div>');



                var TAT = end_time - curr_arrivaltime;
                elem_TAT.empty().append(TAT);

                var WT = start_time - curr_arrivaltime;
                elem_WT.empty().append(WT);
                start_time = end_time;
            });


            var total_tat = 0;
            $('.TAT').each(function (index, value) {
                total_tat += parseFloat($(this).text());
            });
            $('#AVG_TAT').empty().append((parseFloat(total_tat) / parseFloat(ready_queue.length)));

            var total_wt = 0;
            $('.WT').each(function (index, value) {
                total_wt += parseFloat($(this).text());
            });
            $('#AVG_WT').empty().append((parseFloat(total_wt) / parseFloat(ready_queue.length)));

        }
    });
    $('#methods').change(function () {
        location.href = $(this).val();
    })
});

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

function GET_ARRIVALTIME_LOWEST() {
    var lowest = GET_ARRIVALTIME_HIGHEST();
    $('.arrival_time').each(function () {
        var at = parseFloat($(this).val());
        if (at < lowest) {
            lowest = at;
        }
    });

    return parseFloat(lowest);
}

function checkValues() {
    var flag = true;
    $('#cust_console').empty();
    $('.arrival_time').each(function (index) {

        if ($(this).val() == '' || !$.isNumeric($(this).val())) {
            $('#cust_console').append('Please input a number for Arrival Time for Process P' + (index + 1) + '<br/>');
            flag = false;
        }
    });
    $('.burst_time').each(function (index) {

        if ($(this).val() == '' || !$.isNumeric($(this).val())) {
            $('#cust_console').append('Please input a number for Burst Time for Process P' + (index + 1) + '<br/>');
            flag = false;
        }
    });

    return flag;
}
function addRow()
        {
            var lastRow = $('#table tr:last');
            var table = document.getElementById('table')
            let row = '<tr><td>P' 
            + (num + 1)
            + '</td><td><input data-process='
            + (num+1)
            + ' type="text" class="arrival_time" /></td><td><input data-process='
            + (num+1)
            + ' type="text" class="burst_time" /></td><td><span class="TAT" id="P'
            + (num+1)
            + '_TAT"></span></td><td><span class="WT" id="P'
            + (num+1)
            + '_WT"></span></td></tr>';
            lastRow.before(row)
            num+=1
            loadValues()
        }
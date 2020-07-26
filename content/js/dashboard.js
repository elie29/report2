/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [1.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "HTTP-Request-3-500"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP-Request-5-50"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP-Request-4-50"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP-Request-1-50"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP-Request-6-500"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP-Request-1-500"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP-Request-2-50"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP-Request-3-50"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP-Request-2-500"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP-Request-7-500"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP-Request-5-500"], "isController": false}, {"data": [1.0, 500, 1500, "HTTP-Request-4-500"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 70500, 0, 0.0, 5.967035460992902, 1, 391, 4.0, 8.0, 10.0, 17.0, 85.53904766526934, 26751.682805874138, 10.323438125618036], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["HTTP-Request-3-500", 5875, 0, 0.0, 6.497191489361706, 3, 47, 6.0, 9.0, 12.0, 18.0, 7.400148380847535, 3701.8736405671566, 0.8961117179932561], "isController": false}, {"data": ["HTTP-Request-5-50", 5875, 0, 0.0, 1.6997446808510628, 1, 14, 2.0, 2.0, 2.0, 3.0, 7.400213629996876, 371.79569396723565, 0.8888928481343904], "isController": false}, {"data": ["HTTP-Request-4-50", 5875, 0, 0.0, 1.6944680851063807, 1, 9, 2.0, 2.0, 2.0, 3.0, 7.400204308619379, 371.7952256499426, 0.8888917284767419], "isController": false}, {"data": ["HTTP-Request-1-50", 5875, 0, 0.0, 1.6760851063829818, 1, 19, 2.0, 2.0, 2.0, 3.0, 7.400111096135945, 371.7905425419004, 0.8888805320553919], "isController": false}, {"data": ["HTTP-Request-6-500", 5875, 0, 0.0, 10.817021276595709, 3, 111, 8.0, 20.0, 27.0, 55.0, 7.40012041727862, 3701.859651982965, 0.896108331779833], "isController": false}, {"data": ["HTTP-Request-1-500", 5875, 0, 0.0, 17.68919148936174, 3, 391, 5.0, 15.400000000000546, 27.0, 345.0, 7.39799580423455, 3700.7968288313905, 0.8958510544190275], "isController": false}, {"data": ["HTTP-Request-2-50", 5875, 0, 0.0, 1.6897021276595705, 1, 5, 2.0, 2.0, 2.0, 3.0, 7.4001670233442205, 371.79335239256847, 0.8888872498743546], "isController": false}, {"data": ["HTTP-Request-3-50", 5875, 0, 0.0, 1.6944680851063838, 1, 10, 2.0, 2.0, 2.0, 3.0, 7.400185665934835, 371.794289018896, 0.888889489169907], "isController": false}, {"data": ["HTTP-Request-2-500", 5875, 0, 0.0, 7.197957446808528, 3, 64, 6.0, 12.0, 16.0, 31.0, 7.400073811800063, 3701.836337910909, 0.8961026881476639], "isController": false}, {"data": ["HTTP-Request-7-500", 5875, 0, 0.0, 7.640340425531917, 2, 89, 5.0, 15.0, 20.0, 44.0, 7.400157702084137, 3701.8783034520475, 0.8961128467367508], "isController": false}, {"data": ["HTTP-Request-5-500", 5875, 0, 0.0, 6.735489361702119, 3, 28, 6.0, 10.0, 13.0, 19.0, 7.4001670233442205, 3701.8829663486854, 0.8961139754830892], "isController": false}, {"data": ["HTTP-Request-4-500", 5875, 0, 0.0, 6.5727659574468085, 3, 51, 6.0, 9.0, 12.0, 17.0, 7.400148380847535, 3701.8736405671566, 0.8961117179932561], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 70500, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});

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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 69000, 0, 0.0, 6.122869565217394, 1, 452, 4.0, 8.0, 10.0, 18.0, 83.70556023282278, 26178.273637077862, 10.102160304791354], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["HTTP-Request-3-500", 5750, 0, 0.0, 7.003652173913052, 3, 74, 6.0, 10.0, 15.0, 21.48999999999978, 7.242132839608799, 3622.827446246843, 0.876977023546378], "isController": false}, {"data": ["HTTP-Request-5-50", 5750, 0, 0.0, 1.7206956521739132, 1, 8, 2.0, 2.0, 2.0, 3.0, 7.24219669050504, 363.85673157852807, 0.8699122977852733], "isController": false}, {"data": ["HTTP-Request-4-50", 5750, 0, 0.0, 1.6987826086956554, 1, 7, 2.0, 2.0, 2.0, 3.0, 7.242169325697358, 363.8553567374531, 0.8699090108015382], "isController": false}, {"data": ["HTTP-Request-1-50", 5750, 0, 0.0, 1.7890434782608675, 1, 33, 2.0, 2.0, 2.0, 3.0, 7.2420872325150825, 363.85123227656584, 0.8698991499993702], "isController": false}, {"data": ["HTTP-Request-6-500", 5750, 0, 0.0, 9.510086956521718, 3, 118, 7.0, 17.0, 23.0, 49.0, 7.242123718144102, 3622.8228832964824, 0.8769759189940123], "isController": false}, {"data": ["HTTP-Request-1-500", 5750, 0, 0.0, 19.766260869565222, 3, 452, 5.0, 13.0, 22.0, 374.97999999999956, 7.239324514367226, 3621.4226007422826, 0.8766369529116563], "isController": false}, {"data": ["HTTP-Request-2-50", 5750, 0, 0.0, 1.7273043478260917, 1, 9, 2.0, 2.0, 2.0, 3.0, 7.242141961096473, 363.8539819067678, 0.8699057238426426], "isController": false}, {"data": ["HTTP-Request-3-50", 5750, 0, 0.0, 1.7241739130434781, 1, 7, 2.0, 2.0, 2.0, 3.0, 7.242169325697358, 363.8553567374531, 0.8699090108015382], "isController": false}, {"data": ["HTTP-Request-2-500", 5750, 0, 0.0, 8.426956521739168, 3, 152, 5.0, 12.0, 19.0, 83.0, 7.242068989838432, 3622.7955058356906, 0.8769692917382477], "isController": false}, {"data": ["HTTP-Request-7-500", 5750, 0, 0.0, 6.582260869565202, 2, 237, 5.0, 12.0, 18.0, 36.48999999999978, 7.242141961096473, 3622.8320092086983, 0.876978128101526], "isController": false}, {"data": ["HTTP-Request-5-500", 5750, 0, 0.0, 6.833217391304357, 3, 26, 6.0, 10.0, 14.0, 19.0, 7.242151082607124, 3622.836572182048, 0.8769792326594564], "isController": false}, {"data": ["HTTP-Request-4-500", 5750, 0, 0.0, 6.69200000000001, 3, 35, 6.0, 10.0, 13.0, 19.0, 7.242132839608799, 3622.827446246843, 0.876977023546378], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 69000, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});

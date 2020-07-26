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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 72000, 0, 0.0, 6.182708333333327, 1, 401, 4.0, 8.0, 10.0, 17.0, 87.3494889448303, 27317.884466652515, 10.541934578872343], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions\/s", "Received", "Sent"], "items": [{"data": ["HTTP-Request-3-500", 6000, 0, 0.0, 6.984666666666647, 3, 35, 6.0, 11.0, 14.0, 26.98999999999978, 7.55701769853545, 3780.346444391685, 0.915107611932027], "isController": false}, {"data": ["HTTP-Request-5-50", 6000, 0, 0.0, 1.6921666666666657, 1, 9, 2.0, 2.0, 2.0, 3.0, 7.556665545761277, 379.6560276687309, 0.9076854122349972], "isController": false}, {"data": ["HTTP-Request-4-50", 6000, 0, 0.0, 1.7073333333333338, 1, 23, 2.0, 2.0, 2.0, 3.0, 7.55688444767991, 379.6670255661996, 0.9077117061178018], "isController": false}, {"data": ["HTTP-Request-1-50", 6000, 0, 0.0, 1.7166666666666612, 1, 21, 2.0, 2.0, 2.0, 3.0, 7.556998662411237, 379.6727638526083, 0.9077254252700997], "isController": false}, {"data": ["HTTP-Request-6-500", 6000, 0, 0.0, 11.615999999999946, 3, 266, 8.0, 21.0, 32.0, 58.0, 7.5566465114111665, 3780.160760570174, 0.9150626634911958], "isController": false}, {"data": ["HTTP-Request-1-500", 6000, 0, 0.0, 17.798333333333435, 3, 401, 5.0, 15.0, 24.0, 344.9899999999998, 7.554819660159029, 3779.2468907195334, 0.9148414432223824], "isController": false}, {"data": ["HTTP-Request-2-50", 6000, 0, 0.0, 1.7473333333333316, 1, 17, 2.0, 2.0, 2.0, 4.989999999999782, 7.557027216633521, 379.67419845131326, 0.9077288551229717], "isController": false}, {"data": ["HTTP-Request-3-50", 6000, 0, 0.0, 1.7010000000000003, 1, 11, 2.0, 2.0, 2.0, 3.0, 7.557036734755568, 379.6746766532907, 0.9077299984130223], "isController": false}, {"data": ["HTTP-Request-2-500", 6000, 0, 0.0, 7.361666666666681, 3, 58, 6.0, 12.0, 16.0, 40.0, 7.556989144385094, 3780.3321603731642, 0.9151041542028825], "isController": false}, {"data": ["HTTP-Request-7-500", 6000, 0, 0.0, 8.134000000000018, 1, 272, 5.0, 16.0, 21.0, 46.98999999999978, 7.556675062972292, 3780.175043293451, 0.9150661209068011], "isController": false}, {"data": ["HTTP-Request-5-500", 6000, 0, 0.0, 7.0436666666666685, 3, 60, 6.0, 10.0, 14.0, 23.98999999999978, 7.556627477156945, 3780.151238814617, 0.9150603585619738], "isController": false}, {"data": ["HTTP-Request-4-500", 6000, 0, 0.0, 6.689666666666661, 3, 35, 6.0, 9.0, 13.0, 21.0, 7.556855894536519, 3780.265503047302, 0.9150880184790317], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 72000, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});

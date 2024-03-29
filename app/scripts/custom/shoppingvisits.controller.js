/**
 * ShoppingVisitsCtrl - controller
 */
function ShoppingVisitsCtrl($rootScope, $scope, AuthenticationService, CommonsService, $rootScope, $http) {

    var vm = this;

    var dToDate = new Date(new Date().getTime() - config.oneDay);
    var dFromDate = new Date(dToDate.getTime() - config.oneWeek);

    var globals = AuthenticationService.getCredentials();
    var credentials = globals.currentUser;

    $scope.initAPDVisits = function() {
        $http.get(CommonsService.getUrl('/dashboard/assignedShoppingList'))
            .then($scope.initAPDVisitsPhase2);
    }

    $scope.initAPDVisitsPhase2 = function(data) {

        $scope.toDate = dToDate.format("yyyy-mm-dd", null);
        $('#toDate').val($scope.toDate);
        $scope.fromDate = dFromDate.format("yyyy-mm-dd", null);
        $('#fromDate').val($scope.fromDate);

        $('#shoppingId').find('option').remove()

        if( data.data.data.length == 1 ) {
            $('#shoppingSelectorContainer').css('display','none');
            selected = data.data.data[0].identifier;
        } else {
            $('#shoppingSelectorContainer').css('display','block');
            for(var i = 0; i < data.data.data.length; i++) {
                if( i == 0 ) selected = data.data.data[i].identifier;
                $('#shoppingId').append($('<option>', {
                    value: data.data.data[i].identifier,
                    text : data.data.data[i].name
                }));
            }
        }
        $scope.shoppingId = selected;
        $('#shoppingId').val(selected);

        $scope.updateZoneList('#zone',  $scope.shoppingId);
        $scope.updateAPDVisits();
    }

    $scope.updateZoneList = function(id, entityId) {
        $http.get(CommonsService.getUrl('/dashboard/innerZoneList')
            + '&entityId=' + $scope.shoppingId
            + '&entityKind=0')
        .then(function(data) {
            $(id).empty();
            $(id).append($('<option>', {
                value: '',
                text: 'Todas'
            }));

            for( var i = 0; i < data.data.data.length; i++ ) {
                $(id).append($('<option>', {
                    value: data.data.data[i].identifier,
                    text: data.data.data[i].name
                }));
            }
        });
    }

    $scope.updateShopping = function() {
        $scope.loadingSubmit = true;
        $scope.shoppingId = $('#shoppingId').val();
        $scope.updateAPDVisits();
        $scope.loadingSubmit = false;
    }

    $scope.exportDetails = function() {
        $scope.fromDate = $('#fromDate').val();
        $scope.toDate = $('#toDate').val();

        var url =  config.baseUrl + '/dashboard/visitDetailExport'
        + '?authToken=' + $rootScope.globals.currentUser.token
        + '&shoppingId=' + $scope.shoppingId
        + '&fromStringDate=' + $scope.fromDate
        + '&toStringDate=' + $scope.toDate

        window.open(url);
    }

    $scope.updateAPDVisits = function() {
        $scope.fromDate = $('#fromDate').val();
        $scope.toDate = $('#toDate').val();

        vm.filterAPDVisits($scope.shoppingId, $scope.zoneId, $scope.fromDate, $scope.toDate);
    }

    this.filterAPDVisits = function(shoppingId, zoneId, fromDate, toDate) {

        $('#visits_by_date').html('');
        $('#visits_by_hour').html('');
        $('#permanence_by_hour').html('');
        $('#repetitions').html('');
        $('#heatmap_traffic_by_hour').html('');
        $('#heatmap_permanence_by_hour').html('');
        $('#shopping_performance_table').html('');

        vm.updateVisitsByDateChart('#visits_by_date', config.baseUrl, fromDate, toDate, shoppingId, zoneId);
        vm.updateVisitsByHourChart('#visits_by_hour', config.baseUrl, fromDate, toDate, shoppingId, zoneId);
        vm.updatePermanenceByHourChart('#permanence_by_hour', config.baseUrl, fromDate, toDate, shoppingId, zoneId);
        // vm.updateRepetitionsChart('#repetitions', config.dashUrl, fromDate, toDate, shoppingId, zoneId);
        vm.updateHeatmapTraffic('#heatmap_traffic_by_hour', config.baseUrl, fromDate, toDate, shoppingId, zoneId);
        vm.updateHeatmapPermanence('#heatmap_permanence_by_hour', config.baseUrl, fromDate, toDate, shoppingId, zoneId);
        vm.updateShoppingPerformanceTable('#shopping_performance_table', config.dashUrl, fromDate, toDate, shoppingId);
    }

    this.updateVisitsByDateChart = function(id, baseUrl, fromDate, toDate, entityId, subentityId) {

        var eid;
        var kind;

        if( subentityId === undefined || subentityId == '') {
            eid = entityId;
            kind = 0;
        } else {
            eid = subentityId;
            kind = 20;
        }

        $.getJSON(
            baseUrl
            + '/dashboard/timelineData'
            + '?authToken=' + $rootScope.globals.currentUser.token
            + '&entityId=' + eid
            + '&entityKind=' + kind
            + '&subentityId=' + eid
            + '&elementId=apd_visitor'
            + '&subIdOrder=visitor_total_visits,'
            + 'visitor_total_visits_ios,visitor_total_visits_android'
            + '&fromStringDate=' + fromDate
            + '&toStringDate=' + toDate
            + '&eraseBlanks=false'
            + '&timestamp=' + CommonsService.getTimestamp(),
            function(data) {
                // Disable extra options by default
                for( var i = 1; i < data.series.length; i++)
                    data.series[i].visible = false;

                $(id).highcharts({
                    chart: {
                        marginLeft: 200,
                        marginRight: 200
                    },
                    title: {
                        text: 'Tráfico por Día'
                    },
                    xAxis: {
                        categories: data.categories
                    },
                    yAxis: {
                        title: {
                            text: 'Tráfico por Día'
                        },
                        plotLines: [{
                            value: 0,
                            width: 1,
                            color: '#808080'
                        }]
                    },
                    tooltip: {
                        valueSuffix: ''
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'middle',
                        borderWidth: 0
                    },
                    plotOptions: {
                        line: {
                            dataLabels: {
                                enabled: true
                            },
                            enableMouseTracking: false
                        }
                    },
                    series: data.series
                });
            });
    };
    this.updateVisitsByHourChart = function(id, baseUrl, fromDate, toDate, entityId, subentityId) {
        var eid;
        var kind;

        if( subentityId === undefined || subentityId == '') {
            eid = entityId;
            kind = 0;
        } else {
            eid = subentityId;
            kind = 20;
        }

        $.getJSON(
            baseUrl
            + '/dashboard/timelineHour'
            + '?authToken=' + $rootScope.globals.currentUser.token
            + '&entityId=' + eid
            + '&entityKind=' + kind
            + '&subentityId=' + eid
            + '&elementId=apd_visitor'
            + '&subIdOrder=visitor_total_visits,'
            + 'visitor_total_visits_ios,visitor_total_visits_android'
            + '&fromStringDate=' + fromDate
            + '&toStringDate=' + toDate
            + '&eraseBlanks=true'
            + '&timestamp=' + CommonsService.getTimestamp(),
            function(data) {
                // Disable extra options by default
                for( var i = 1; i < data.series.length; i++)
                    data.series[i].visible = false;

                $(id).highcharts({
                    chart: {
                        marginLeft: 200,
                        marginRight: 200
                    },
                    title: {
                        text: 'Tráfico por Hora'
                    },
                    xAxis: {
                        categories: data.categories
                    },
                    yAxis: {
                        title: {
                            text: 'Tráfico por Hora'
                        },
                        plotLines: [{
                            value: 0,
                            width: 1,
                            color: '#808080'
                        }]
                    },
                    tooltip: {
                        valueSuffix: ''
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'middle',
                        borderWidth: 0
                    },
                    plotOptions: {
                        line: {
                            dataLabels: {
                                enabled: true
                            },
                            enableMouseTracking: false
                        }
                    },
                    series: data.series
                });
            });
    };
    this.updatePermanenceByHourChart = function(id, baseUrl, fromDate, toDate, entityId, subentityId) {
        var eid;
        var kind;

        if( subentityId === undefined || subentityId == '') {
            eid = entityId;
            kind = 0;
        } else {
            eid = subentityId;
            kind = 20;
        }

        $.getJSON(
            baseUrl
            + '/dashboard/timelineHour'
            + '?authToken=' + $rootScope.globals.currentUser.token
            + '&entityId=' + eid
            + '&entityKind=' + kind
            + '&subentityId=' + eid
            + '&elementId=apd_permanence'
            + '&subIdOrder=permanence_hourly_visits,'
            + 'permanence_hourly_visits_ios,permanence_hourly_visits_android'
            + '&fromStringDate=' + fromDate
            + '&toStringDate=' + toDate
            + '&average=true'
            + '&toMinutes=true'
            + '&eraseBlanks=true'
            + '&timestamp=' + CommonsService.getTimestamp(),
            function(data) {
                // Disable extra options by default
                for( var i = 1; i < data.series.length; i++)
                    data.series[i].visible = false;

                $(id).highcharts({
                    chart: {
                        marginLeft: 200,
                        marginRight: 200
                    },
                    title: {
                        text: 'Permanencia'
                    },
                    xAxis: {
                        categories: data.categories
                    },
                    yAxis: {
                        title: {
                            text: 'Permanencia en Minutos'
                        },
                        plotLines: [{
                            value: 0,
                            width: 1,
                            color: '#808080'
                        }]
                    },
                    tooltip: {
                        valueSuffix: ':00 Minutos'
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'middle',
                        borderWidth: 0
                    },
                    plotOptions: {
                        line: {
                            dataLabels: {
                                enabled: true
                            },
                            enableMouseTracking: false
                        }
                    },
                    series: data.series
                });
            });
    };
    this.updateRepetitionsChart = function(id, baseUrl, fromDate, toDate, entityId, subentityId) {
        $.getJSON(
            baseUrl
            + '/dashboard/repetitions'
            + '?authToken=' + $rootScope.globals.currentUser.token
            + '&entityId=' + entityId
            + '&entityKind=0'
            + '&subentityId=' + entityId
            + '&elementId=apd_visitor'
            + '&subIdOrder=visitor_total_visits,'
            + 'visitor_total_visits_ios,visitor_total_visits_android'
            + '&fromStringDate=' + fromDate
            + '&toStringDate=' + toDate
            + '&eraseBlanks=true'
            + '&timestamp=' + CommonsService.getTimestamp(),
            function(data) {

                try {
                    var newdata = new Array();
                    newdata.push(data.series[1]);
                    newdata[0].type = 'column';

                    // Disable extra options by default
                    $(id).highcharts({
                        chart: {
                            type: 'column',
                            marginLeft: 200,
                            marginRight: 200
                        },
                        title: {
                            text: 'Repeticiones'
                        },
                        xAxis: {
                            categories: data.categories
                        },
                        yAxis: {
                            title: {
                                text: 'Repeticiones'
                            },
                            plotLines: [{
                                value: 0,
                                width: 1,
                                color: '#808080'
                            }]
                        },
                        tooltip: {
                            valueSuffix: ''
                        },
                        legend: {
                            layout: 'vertical',
                            align: 'right',
                            verticalAlign: 'middle',
                            borderWidth: 0
                        },
                        plotOptions: {
                            line: {
                                dataLabels: {
                                    enabled: true
                                },
                                enableMouseTracking: false
                            }
                        },
                        series: newdata
                    });

            } catch( e ) {}
        });
    };
    this.updateHeatmapTraffic = function(id, baseUrl, fromDate, toDate, entityId, subentityId) {

        var eid;
        var kind;

        if( subentityId === undefined || subentityId == '') {
            eid = entityId;
            kind = 0;
        } else {
            eid = subentityId;
            kind = 20;
        }

        $.getJSON(
            baseUrl
            + '/dashboard/heatmapTableHour'
            + '?authToken=' + $rootScope.globals.currentUser.token
            + '&entityId=' + eid
            + '&entityKind=' + kind
            + '&subentityId=' + eid
            + '&elementId=apd_visitor'
            + '&elementSubId=visitor_total_visits'
            + '&fromStringDate=' + fromDate
            + '&toStringDate=' + toDate
            + '&average=false'
            + '&toMinutes=false'
            + '&eraseBlanks=true'
            + '&timestamp=' + CommonsService.getTimestamp(),
            function(data) {

                $(id).highcharts({
                    chart: {
                        type: 'heatmap',
                        marginLeft: 200,
                        marginRight: 200
                    },
                    title: {
                        text: 'Visitas por Hora'
                    },
                    xAxis: {
                        categories: data.xCategories
                    },
                    yAxis: {
                        categories: data.yCategories,
                        title: 'Horarios'
                    },
                    colorAxis: {
                        min: 0,
                        minColor: '#FFFFFF',
                        //maxColor: Highcharts.getOptions().colors[0]
                        maxColor: '#137499'
                    },
                    legend: {
                        align: 'right',
                        layout: 'vertical',
                        margin: 0,
                        verticalAlign: 'top',
                        y: 25,
                        symbolHeight: 280
                    },
                    tooltip: {
                        formatter: function() {
                            return this.point.value + ' Visitantes';
                        }
                    },
                    series: [{
                        borderWidth: 1,
                        borderColor: '#137499',
                        data: data.data,
                        dataLabels: {
                            enabled: false,
                            color: '#000000'
                        }
                    }]
                });
            });
    };
    this.updateHeatmapPermanence = function(id, baseUrl, fromDate, toDate, entityId, subentityId) {
        var eid;
        var kind;

        if( subentityId === undefined || subentityId == '') {
            eid = entityId;
            kind = 0;
        } else {
            eid = subentityId;
            kind = 20;
        }

        $.getJSON(
            baseUrl
            + '/dashboard/heatmapTableHour'
            + '?authToken=' + $rootScope.globals.currentUser.token
            + '&entityId=' + eid
            + '&entityKind=' + kind
            + '&subentityId=' + eid
            + '&elementId=apd_permanence'
            + '&elementSubId=permanence_hourly_visits'
            + '&fromStringDate=' + fromDate
            + '&toStringDate=' + toDate
            + '&average=true'
            + '&toMinutes=true'
            + '&eraseBlanks=true'
            + '&timestamp=' + CommonsService.getTimestamp(),
            function(data) {

                $(id).highcharts({
                    chart: {
                        type: 'heatmap',
                        marginLeft: 200,
                        marginRight: 200
                    },
                    title: {
                        text: 'Permanencia por Hora'
                    },
                    xAxis: {
                        categories: data.xCategories
                    },
                    yAxis: {
                        categories: data.yCategories,
                        title: 'Horarios'
                    },
                    colorAxis: {
                        min: 0,
                        minColor: '#FFFFFF',
                        //maxColor: Highcharts.getOptions().colors[0]
                        maxColor: '#137499'
                    },
                    legend: {
                        align: 'right',
                        layout: 'vertical',
                        margin: 0,
                        verticalAlign: 'top',
                        y: 25,
                        symbolHeight: 280
                    },
                    tooltip: {
                        formatter: function() {
                            return this.point.value + ' minutos';
                        }
                    },
                    series: [{
                        borderWidth: 1,
                        borderColor: '#137499',
                        data: data.data,
                        dataLabels: {
                            enabled: false,
                            color: '#000000'
                        }
                    }]
                });
            });
    };
    this.updateShoppingPerformanceTable = function(id, baseUrl, fromDate, toDate, entityId) {
        $.getJSON(
            baseUrl
            + '/dashoard/shoppingTableData'
            + '?authToken=' + $rootScope.globals.currentUser.token
            + '&entityId=' + entityId
            + '&entityKind=0'
            + '&fromStringDate=' + fromDate
            + '&toStringDate=' + toDate
            + '&onlyExternalIds=true'
            + '&timestamp=' + CommonsService.getTimestamp(),
            function(data) {
                var tab = '';
                tab = '<table class="table table-striped" style="text-align: center;" >';
                tab += '<tr style="font-weight:bold;">';
                tab += '<td style="text-align: left; border-right: 1px solid gray;">Centro Comercial</td>';
                // tab += '<td>Paseantes</td>';
                tab += '<td>Visitantes</td>';
                // tab += '<td>Tickets</td>';
                // tab += '<td>Paseantes/Visitantes</td>';
                // tab += '<td>Tickets/Visitantes</td>';
                tab += '<td>Día más Alto</td>';
                tab += '<td>Día más Bajo</td>';
                tab += '<td>Permanencia Promedio</td>';
                tab += '</tr>';
                tab += '<tbody>';
                for (var i = 1; i < data.length - 1; i++) {
                    tab += '<tr>';
                    tab += '<td style="text-align: left; border-right: 1px solid gray;">' + data[i][0] + '</td>';
                    for (var x = 1; x < data[i].length; x++) {
                        if( x != 1 && x != 3 && x != 4 && x != 5 ) {
                            if (x == 0 || x == 3 || x == 5 || x == 7)
                                tab += '<td style="border-right: 1px solid gray;">' + data[i][x] + '</td>';
                            else
                                tab += '<td>' + data[i][x] + '</td>';
                        }
                    }
                    tab += '</tr>';
                }
                tab += '<tr style="font-weight:bold;">';
                tab += '<td style="text-align: left; border-right: 1px solid gray;">' + data[data.length - 1][0] + '</td>';
                for (var x = 1; x < data[data.length - 1].length; x++) {
                    if( x != 1 && x != 3 && x != 4 && x != 5 ) {
                        if (x == 0 || x == 3 || x == 5 || x == 7)
                            tab += '<td style="border-right: 1px solid gray;">' + data[data.length - 1][x] + '</td>';
                        else
                            tab += '<td>' + data[data.length - 1][x] + '</td>';
                    }
                }
                tab += '</tr></tbody></table>';

                tab += '</tbody>';
                tab += '</table>';
                $(id).html(tab);
            });
    };

    return vm;
};

angular
    .module('bdb')
    .controller('ShoppingVisitsCtrl', ShoppingVisitsCtrl);

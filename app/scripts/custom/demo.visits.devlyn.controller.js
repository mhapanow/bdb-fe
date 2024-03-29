/**
 * DemoVisitsDevlin - controller
 */
function DemoVisitsDevlin($rootScope, $scope, AuthenticationService, CommonsService, $rootScope, $http) {

    var vm = this;

    var dToDate = new Date(new Date().getTime() - config.oneDay);
    var dFromDate = new Date(dToDate.getTime() - config.oneWeek);


    var emmitRow = function(data, i){
      var time = 0;
      var sum = 0;
      var cellValue = NaN;
      var result = [];
      output = "";
      for (var x = 0; x < data[i].length; x++) {
          var td = '<td>';
          cellValue = data[i][x];
          val = 0;

          if(x === 0)
          cellValue = cellValue.replace('Opticas Devlyn Perisur', 'Opticas Devlyn Chedraui');

          if(x == 0 || x == 3 || x == 6 || x == 9 || x == 11){
              td = '<td style="border-right: 1px solid gray;">';
          }
          if(isNaN(cellValue)) {
            output += td + cellValue  + '</td>';
          } else{
            var formatted = Number(cellValue);
            formatted = parseInt(formatted);
            formatted = formatted.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            output += td + formatted + '</td>';
            }
      }
      result[0] = output;
      result[1] = sum;
      return result;
    }

    var insertColumn = function(data, column, index){
      for (var i = 0; i < data.length; i++){
        var row = data[i];
        row.splice(index, 0, column[i]);
      }
    }
    var substituteColumn = function(data, column, index){
      for (var i = 0; i < data.length; i++){
        var row = data[i];
        row.splice(index, 1, column[i]);
      }
    }
    var getColumnValues = function(data, index){
      var clone = [];
      for (var i = 1; i < data.length; i++){
        clone.push(data[i][index]);
      }
      return clone;
    }

    var deleteRow = function(data, index){
      data.splice(index, 1);
    }
    var substituteRow = function(data, row, index){
      data.splice(index, 1, row);
    }


    var twoColumnFunc = function(data, a, b, func){
      var colA = getColumnValues(data, a);
      var colB = getColumnValues(data, b);
      var result = [];
      for(var i=0; i< colA.length; i++) {
        result.push(func(colA[i], colB[i]));
      }
      return result;
    }

    $scope.gabineteFactor = 0.85;
    $scope.toDate = dToDate.format("yyyy-mm-dd", null);
    $('#toDate').val($scope.toDate);
    $scope.fromDate = dFromDate.format("yyyy-mm-dd", null);
    $('#fromDate').val($scope.fromDate);
    $scope.storeId = '';
    $scope.groupChecked = true;


    $scope.changeMode = function(){
      console.log($scope.groupChecked);
      if($scope.groupChecked){
        $(".grouped-devlyn-filters").removeClass("hidden");
        $(".individual-devlyn-filters").addClass("hidden");
      } else{
      $(".grouped-devlyn-filters").addClass("hidden");
      $(".individual-devlyn-filters").removeClass("hidden");
      }
    }

    $scope.types = [
      {
        name:"Todas",
        value: 0
      },
      { name:"Exhibición",
        value: 1
      },
      {
        name:"Gabinete",
        value: 2
    }];

    $scope.regions = [
      {
        name:"Todas",
        value: 0
      },
      { name:"Centro 1",
        value: 1
      },
      {
        name:"Centro 2",
        value: 2
      }];

    $scope.districts = [
      {
        name:"Todas",
        value: 0
      },
      { name:"Distrito 3",
        value: 1
      },
      {
        name:"Distrito 5",
        value: 2
      },
      {
        name: "Distrito 7",
        value: 3
      },
      {
        name: "Distrito 9",
        value: 4
      },
      {
        name: "Distrito 10",
        value: 5
      },
      {
        name: "Distrito 11",
        value: 6
      }];

    $scope.formats = [
      {
        name:"Todas",
        value: 0
      },
      { name:"Chedraui",
        value: 1
      },
      {
        name:"City Club",
        value: 2
      },
      {
        name: "Coppel",
        value: 3
      },{
        name: "Devlyn",
        value: 4
      },
      {
        name: "In Moda",
        value: 5
      },
      {
        name: "Optimart",
        value: 6
      },
      {
        name: "Sams",
        value: 7
      },
      {
        name: "Sears Optica",
        value: 8
      },
      {
        name: "Soriana",
        value: 9
      },
      {
        name: "Virtual",
        value: 10
      }, {
        name: "Wal Mart",
        value: 11
      }];


    $scope.selected = $scope.types[0];
    $scope.regionSelected = $scope.regions[0];
    $scope.districtSelected = $scope.districts[0];
    $scope.formatSelected = $scope.formats[0];

    $scope.zoneChanged = function(){
      console.log($scope.selected.value);
    }
    $scope.regionChanged = function(){
      console.log($scope.regionSelected.value);
    }

    var globals = AuthenticationService.getCredentials();
    var credentials = globals.currentUser;
    $scope.brandId = 'devlyn_mx';

    $scope.exportAPDVisits = function() {
        $scope.fromDate = $('#fromDate').val();
        $scope.toDate = $('#toDate').val();

        var url =  config.baseUrl + '/dashboard/brandExport'
            + '?authToken=' + $rootScope.globals.currentUser.token
            + '&brandId=' + $scope.brandId
            + '&storeId=' + $scope.storeId
            + '&fromStringDate=' + $scope.fromDate
            + '&toStringDate=' + $scope.toDate

        window.open(url);
    }

    $scope.updateAPDVisits = function() {
        $scope.fromDate = $('#fromDate').val();
        $scope.toDate = $('#toDate').val();

        vm.filterAPDVisits($scope.brandId, $scope.storeId, $scope.fromDate, $scope.toDate);
    }

    this.filterAPDVisits = function(brandId, storeId, fromDate, toDate) {

        $('#visits_by_date').html('');
        $('#visits_by_hour').html('');
        $('#permanence_by_hour').html('');
        $('#heatmap_traffic_by_hour').html('');
        $('#heatmap_permanence_by_hour').html('');

        vm.updateVisitsByDateChart('#visits_by_date', config.baseUrl, fromDate, toDate, brandId, storeId);
        vm.updateVisitsByHourChart('#visits_by_hour', config.baseUrl, fromDate, toDate, brandId, storeId);
        vm.updatePermanenceByHourChart('#permanence_by_hour', config.baseUrl, fromDate, toDate, brandId, storeId);
        vm.updateHeatmapTraffic('#heatmap_traffic_by_hour', config.baseUrl, fromDate, toDate, brandId, storeId);
        vm.updateHeatmapPermanence('#heatmap_permanence_by_hour', config.baseUrl, fromDate, toDate, brandId, storeId);
        vm.updateBrandPerformanceTable('#brand_performance_table', config.baseUrl, fromDate, toDate, brandId);
        vm.updateHeatmapOccupation('#heatmap_occupation_by_hour', config.baseUrl, fromDate, toDate, brandId, storeId);
    }

    this.updateStoreList = function(id, baseUrl, entityId) {
        $.getJSON(
            baseUrl
            + '/dashboard/storesFilter?entityId=' + entityId
            + '&authToken=' + $rootScope.globals.currentUser.token
            + '&entityKind=1'
            + '&toStringDate=' + toDate
            + '&onlyExternalIds=true',
            function(data) {
                $(id).empty();
                $(id).append($('<option>', {
                    value: '',
                    text: 'Todas'
                }));
                var i = 0;
                $.each(data, function(idx, item) {
                    item.name = item.name.replace('Opticas Devlyn Perisur', 'Opticas Devlyn Chedraui');
                    if(i === 0 || i === 4 || i === 5 ){
                      i ++;
                    } else{
                      $(id).append($('<option>', {
                          value: item.identifier,
                          text: item.name
                      }));
                      i++;
                    }
                });
            });
    }
    this.updateVisitsByDateChart = function(id, baseUrl, fromDate, toDate, entityId, subEntityId) {
        $.getJSON(
            baseUrl
            + '/dashboard/timelineData'
            + '?authToken=' + $rootScope.globals.currentUser.token
            + '&entityId=' + entityId
            + '&entityKind=1'
            + '&subentityId=' + subEntityId
            + '&elementId=apd_visitor'
            + '&subIdOrder=visitor_total_peasents,visitor_total_visits,visitor_total_peasents_ios,'
            + 'visitor_total_peasents_android,visitor_total_visits_ios,visitor_total_visits_android,visitor_total_tickets'
            + '&fromStringDate=' + fromDate
            + '&toStringDate=' + toDate
            + '&eraseBlanks=false'
            + '&timestamp=' + CommonsService.getTimestamp(),
            function(data) {
                // Disable extra options by default
                var copy = Object.assign([], data.series);
                var copy2 = Object.assign([], data.series);
                var series = [];
                if($scope.selected.value === 2){
                  data.series = data.series.slice(1,2);
                }
                else if($scope.selected.value === 1){
                  series = data.series.slice(0,2);
                  series[0].name = "Mirador";
                  // series[0].yAxis = 1;
                  console.log(copy);
                  var tickets = copy.slice(6,7);
                  var chunk = series.concat(tickets);
                  // console.log(copy2.slice(7,8));
                  console.log(series);
                  data.series = chunk;
                } else{
                  data.series = data.series.slice(0,2);
                  data.series[0].name = "Mirador";
                }

                $(id).highcharts({
                    chart: {
                        zoomType: 'xy',
                        marginLeft: 200,
                        marginRight: 200
                    },
                    title: {
                        text: 'Tráfico por día'
                    },
                    xAxis: {
                        categories: data.categories
                    },
                    yAxis: [{
                        type: 'logarithmic',
                        title: {
                            text: 'Tráfico por Día'
                        },
                        plotLines: [{
                            value: 0,
                            width: 1,
                            color: '#808080'
                        }]
                    }
                  ],
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
                                enabled: false
                            },
                            enableMouseTracking: false
                        }
                    },
                    series: data.series
                });
            });
    };
    this.updateVisitsByHourChart = function(id, baseUrl, fromDate, toDate, entityId, subEntityId) {
        $.getJSON(
            baseUrl
            + '/dashboard/timelineHour'
            + '?authToken=' + $rootScope.globals.currentUser.token
            + '&entityId=' + entityId
            + '&entityKind=1'
            + '&subentityId=' + subEntityId
            + '&elementId=apd_visitor'
            + '&subIdOrder=visitor_total_peasents,visitor_total_visits,visitor_total_peasents_ios,'
            + 'visitor_total_peasents_android,visitor_total_visits_ios,visitor_total_visits_android'
            + '&fromStringDate=' + fromDate
            + '&toStringDate=' + toDate
            + '&eraseBlanks=true'
            + '&timestamp=' + CommonsService.getTimestamp(),
            function(data) {
                // Disable extra options by default
                if($scope.selected.value === 2){
                  data.series = data.series.slice(1,2);
                } else{
                  data.series = data.series.slice(0,2);
                  data.series[0].name = "Mirador";
                }
                // for( var i = 2; i < data.series.length; i++)
                //     data.series[i].visible = false;

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
    this.updatePermanenceByHourChart = function(id, baseUrl, fromDate, toDate, entityId, subEntityId) {
        $.getJSON(
            baseUrl
            + '/dashboard/timelineHour'
            + '?authToken=' + $rootScope.globals.currentUser.token
            + '&entityId=' + entityId
            + '&entityKind=1'
            + '&subentityId=' + subEntityId
            + '&elementId=apd_permanence'
            + '&subIdOrder=permanence_hourly_peasents,permanence_hourly_visits,permanence_hourly_peasents_ios,'
            + 'permanence_hourly_peasents_android,permanence_hourly_visits_ios,permanence_hourly_visits_android'
            + '&fromStringDate=' + fromDate
            + '&toStringDate=' + toDate
            + '&average=true'
            + '&toMinutes=true'
            + '&eraseBlanks=true'
            + '&timestamp=' + CommonsService.getTimestamp(),
            function(data) {
                // Disable extra options by default
                data.series = data.series.slice(1,2);

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
    this.updateHeatmapTraffic = function(id, baseUrl, fromDate, toDate, entityId, subEntityId) {
        $.getJSON(
            baseUrl
            + '/dashboard/heatmapTableHour'
            + '?authToken=' + $rootScope.globals.currentUser.token
            + '&entityId=' + entityId
            + '&entityKind=1'
            + '&subentityId=' + subEntityId
            + '&elementId=apd_visitor'
            + '&elementSubId=visitor_total_visits,visitor_total_peasents'
            + '&fromStringDate=' + fromDate
            + '&toStringDate=' + toDate
            + '&average=false'
            + '&toMinutes=false'
            + '&eraseBlanks=true'
            + '&timestamp=' + CommonsService.getTimestamp(),
            function(data) {

                var p = new Array();
                for( var i = 0; i < data.data.length; i++) {
                    var ob = data.data[i];
                    var p1 = p[ob[0]];
                    if( p1 === null || p1 === undefined )  {
                        p1 = new Array();
                        p[ob[0]] = p1;
                    }
                    var val = ob[3];
                    p1[ob[1]] = val;
                }

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
                            return this.point.value + ' <strong>Visitantes</strong> <br/>' + p[this.point.x][this.point.y]    + ' <strong>Mirador</strong>';
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
    this.updateHeatmapPermanence = function(id, baseUrl, fromDate, toDate, entityId, subEntityId) {
        $.getJSON(
            baseUrl
            + '/dashboard/heatmapTableHour'
            + '?authToken=' + $rootScope.globals.currentUser.token
            + '&entityId=' + entityId
            + '&entityKind=1'
            + '&subentityId=' + subEntityId
            + '&elementId=apd_permanence'
            + '&elementSubId=permanence_hourly_visits,permanence_hourly_peasents'
            + '&fromStringDate=' + fromDate
            + '&toStringDate=' + toDate
            + '&average=true'
            + '&toMinutes=true'
            + '&eraseBlanks=true'
            + '&timestamp=' + CommonsService.getTimestamp(),
            function(data) {

                var p = new Array();
                for( var i = 0; i < data.data.length; i++) {
                    var ob = data.data[i];
                    var p1 = p[ob[0]];
                    if( p1 === null || p1 === undefined )  {
                        p1 = new Array();
                        p[ob[0]] = p1;
                    }
                    var val = ob[3];
                    p1[ob[1]] = val;
                }

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
                            return '<strong>Visitantes: </strong>' + this.point.value + ' minutos <br/> <strong>Mirador: </strong>' + p[this.point.x][this.point.y]    + ' minutos';
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
    this.updateHeatmapOccupation = function(id, baseUrl, fromDate, toDate, entityId, subEntityId, zoneId) {
        var url = null;

        var eid;
        var seid;
        var kind;
        var vo = false;

        if( zoneId === undefined || zoneId == '') {
            eid = entityId;
            seid = subEntityId;
            kind = 1;
            vo = false;
        } else {
            eid = zoneId;
            seid = zoneId;
            kind = 20;
            vo = true;
        }

        if( $scope.visitsOnly == true || vo == true )
            url = baseUrl
            + '/dashboard/heatmapTableHour'
            + '?authToken=' + $rootScope.globals.currentUser.token
            + '&entityId=' + eid
            + '&entityKind=' + kind
            + '&subentityId=' + seid
            + '&elementId=apd_occupation'
            + '&elementSubId=occupation_hourly_visits'
            + '&fromStringDate=' + fromDate
            + '&toStringDate=' + toDate
            + '&average=true'
            + '&toMinutes=true'
            + '&eraseBlanks=true'
            + '&timestamp=' + CommonsService.getTimestamp();
        else
            url = baseUrl
            + '/dashboard/heatmapTableHour'
            + '?authToken=' + $rootScope.globals.currentUser.token
            + '&entityId=' + eid
            + '&entityKind=' + kind
            + '&subentityId=' + seid
            + '&elementId=apd_occupation'
            + '&elementSubId=occupation_hourly_visits,occupation_hourly_peasants'
            + '&fromStringDate=' + fromDate
            + '&toStringDate=' + toDate
            + '&average=true'
            + '&toMinutes=true'
            + '&eraseBlanks=true'
            + '&timestamp=' + CommonsService.getTimestamp();

        $.getJSON(url,
            function(data) {

                var p = new Array();
                for( var i = 0; i < data.data.length; i++) {
                    var ob = data.data[i];
                    var p1 = p[ob[0]];
                    if( p1 === null || p1 === undefined )  {
                        p1 = new Array();
                        p[ob[0]] = p1;
                    }
                    var val = ob[3];
                    p1[ob[1]] = val;
                }

                $(id).highcharts({
                    chart: {
                        type: 'heatmap',
                        marginLeft: 200,
                        marginRight: 200
                    },
                    title: {
                        text: 'Ocupación por Hora'
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
                            if( $scope.visitsOnly == true || vo == true ) {
                                return this.point.value + ' <strong>Visitantes</strong>';
                            } else {
                                return this.point.value + ' <strong>Visitantes</strong> <br/>' + p[this.point.x][this.point.y]    + ' <strong>Mirador</strong>';
                            }
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

    this.updateBrandPerformanceTable = function(id, baseUrl, fromDate, toDate, entityId, storeType) {

        $http.get(CommonsService.getUrl('/dashboard/brandTableData')
            + '&entityId=' + entityId
            + '&entityKind=1'
            + '&fromStringDate=' + fromDate
            + '&toStringDate=' + toDate
            + '&onlyExternalIds=true'
            + '&format=json'
            + '&timestamp=' + CommonsService.getTimestamp())
            .then($scope.fillBrandTable);
    };

    $scope.fillBrandTable = function(data) {
        $('#brand-table>tbody>tr').each(function(index, elem){$(elem).remove();});
        //get the footable object
        var table = $('#brand-table').data('footable');

        var newRow = '';
        var isZone = false;
        for(var i = 0; i < data.data.data.length; i++) {
            var obj = data.data.data[i];
            if($scope.zoneAble !== 'hidden' && i !== 0 && (i !== data.data.data.length -1 )){
              isZone = true;
            }
            newRow += $scope.fillBrandRecord(obj, false, isZone);
        }

        table.appendRow(newRow);
        $('#brand-table>tfoot>tr').each(function(index, elem){
            if( index == 0 ) $(elem).remove();
        });
        $('#brand-table>tfoot').prepend($scope.fillBrandRecord(data.data.totals, true));

        $('#brand-count').html('&nbsp;(' + data.data.recordCount + ')');
    };

    $scope.fillBrandRecord = function(obj, bold, isZone) {

        var formatter1 = new Intl.NumberFormat('en-US');
        var formatter2 = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2 /* this might not be necessary */
        });
        var formatter3 = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2, /* this might not be necessary */
            maximumFractionDigits: 2 /* this might not be necessary */
        });

        var b1 = bold == true ? "<b>" : "";
        var b2 = bold == true ? "</b>" : "";

        var peasants = "";
        if(!isZone){
          peasants = b1 + formatter1.format(obj.peasants) + b2;
        }

        var row = '<tr>'
                + '<td data-value="' + obj.title.replace("Ópticas Devlyn", "") + '">' + b1 + obj.title.replace("Ópticas Devlyn", "") + b2 + '</td>'
                + '<td data-value="' + obj.peasants + '"><center>'  + peasants + '</center></td>'
                + '<td data-value="' + obj.visitors + '"><center>'  + b1 +  formatter1.format(obj.visitors) + b2 + '</center></td>'
                + '<td data-value="' + obj.tickets + '"><center>'  + b1 +  formatter1.format(obj.tickets) + b2 + '</center></td>'
                + '<td data-value="' + obj.items + '"><center>'  + b1 +  formatter1.format(obj.items) + b2 + '</center></td>'
                + '<td data-value="' + obj.revenue + '"><center>'  + b1 +  formatter2.format(obj.revenue) + b2 + '</center></td>'
                + '<td data-value="' + obj.visitsConversion + '"><center>'  + b1 + formatter3.format(obj.visitsConversion) + '%' + b2 + '</center></td>'
                + '<td data-value="' + obj.ticketsConversion + '"><center>'  + b1 + formatter3.format(obj.ticketsConversion) + '%' + b2 + '</center></td>'
                + '<td data-value="' + obj.higherDay + '"><center>'  + b1 + obj.higherDay + b2 + '</center></td>'
                + '<td data-value="' + obj.lowerDay + '"><center>'  + b1 + obj.lowerDay + b2 + '</center></td>'
                + '<td data-value="' + obj.averagePermanence + '"><center>'  + b1 + formatter1.format(obj.averagePermanence) + ' mins' + b2 + '</center></td>'
                + '</tr>';
        return row;
    };

    this.updateStoreList('#store', config.baseUrl, $scope.brandId);
    $scope.updateAPDVisits();

    return vm;
};

angular
    .module('bdb')
    .controller('DemoVisitsDevlin', DemoVisitsDevlin);

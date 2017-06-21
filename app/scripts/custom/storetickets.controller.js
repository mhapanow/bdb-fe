/**
 * StoreTicketsCtrl - controller
 */
function StoreTicketsCtrl($scope, $http, $location, CommonsService, AuthenticationService, SweetAlert) {

	var vm = this;

	$scope.brands = null;
	$scope.brand = null;
	$scope.stores = null;
	$scope.store = null;
	$scope.hours = null;
	$scope.obj = null;
	$scope.fromHour = null;
	$scope.toHour = null;

	$scope.latitude = 0;
	$scope.longitude = 0;

	$scope.init = function() {
		$scope.brands = new Array();
		$scope.hours = new Array();
		for( var i = 0; i < 24; i++ ) {
			var ele = {
				id: $scope.hourFormat(i),
				name: $scope.hourFormat(i)
			};

			$scope.hours.push(ele)
			if( i == 8 ) $scope.fromHour = ele;
			if( i == 20 ) $scope.toHour = ele;
		}

		$scope.loadingRefresh = true;
		$http.get(CommonsService.getUrl('/dashboard/assignedBrandList'))
			.then($scope.postInit);
		$scope.formTicketsClass = 'hidden';
		$scope.fileUpdateDisabled = true;

	}

	$scope.hourFormat = function(hour) {
		var fmt = '';
		if( hour < 10 )
			fmt += '0';
		fmt += hour;
		fmt += ":00";
		return fmt;
	}

	$scope.postInit = function(data) {

		// validate token
		if( data.status != 200 || data.data.error_code !== undefined )
			AuthenticationService.logout(function(response) {
				$location.path('/login');    
			});

		for( var i = 0; i < data.data.data.length; i++ ) {
			var brand = {
				id: data.data.data[i].identifier,
				name: data.data.data[i].name
			}
			$scope.brands.push(brand);
		}
		$scope.brand = $scope.brands[0];
		$scope.brandChange();

	}

	$scope.brandChange = function() {

		$scope.stores = new Array();
		$scope.loadingRefresh = true;
		$http.get(CommonsService.getUrl('/dashboard/assignedStoreList')
			+ '&entityId=' + $scope.brand.id 
			+ '&entityKind=1&onlyExternalIds=true')
			.then($scope.postBrandChange);
	}

	$scope.postBrandChange = function(data) {

		for( var i = 0; i < data.data.data.length; i++ ) {
			var store = {
				id: data.data.data[i].identifier,
				name: data.data.data[i].name
			}
			$scope.stores.push(store);
		}
		$scope.store = $scope.stores[0];
		$scope.loadingRefresh = false;

		$scope.refresh();

	}

	$scope.loadTickets = function(data) {

		$scope.listdays = new Array();
        $scope.loadingloadUpdate = true;
        $scope.fromDate = $('#fromDate').val();
        $scope.toDate = $('#toDate').val();
		$http.get(CommonsService.getUrl('/dashboard/storeTicketData')
			+ '&storeId=' + this.store.id 
			+ '&fromDate=' + $scope.fromDate
			+ '&toDate=' + $scope.toDate)
			.then(function(data) {
				$scope.obj = data.data;
				for( var i = 0; i < data.data.data.length; i++ ) {
					//generar la lista de dias/ticket
					var day = {
						date: data.data.dates[i],
						numberoftickets: data.data.data[i]
					}
					$scope.listdays.push(day);
				}
				$scope.formTicketsClass = '';
				$scope.loadingloadUpdate = false;
			});
	}

	$scope.loadTicketsByHour = function(data) {

		$scope.listhours = new Array();
        $scope.loadingloadUpdate = true;
        $scope.date = $('#date').val();
		$http.get(CommonsService.getUrl('/dashboard/storeTicketByHourData')
			+ '&storeId=' + this.store.id 
			+ '&date=' + $scope.date
			+ '&fromHour=' + $scope.fromHour.id
			+ '&toHour=' + $scope.toHour.id)
			.then(function(data) {
				$scope.obj2 = data.data;
				for( var i = 0; i < data.data.data.length; i++ ) {
					//generar la lista de dias/ticket
					var day = {
						hour: data.data.dates[i],
						numberoftickets: data.data.data[i]
					}
					$scope.listhours.push(day);
				}
				$scope.formTicketsClass = '';
				$scope.loadingloadUpdate = false;
			});
	}

	$scope.refresh = function(data) {
		$scope.loadingRefresh = true;
		$scope.formTicketsClass = 'hidden';
	}

	$scope.postRefresh = function(data) {
		$scope.loadingSubmit = false;
		// Default fallback for Mexico City

	}
	$scope.updateTickets = function(){
		$scope.loadingexecUpdate = true;
		$scope.obj.data = new Array();
		for( var i = 0; i < $scope.listdays.length; i++ ) {
			$scope.obj.data.push($scope.listdays[i].numberoftickets)
		}
		$http.post(CommonsService.getUrl('/dashboard/storeTicketData'), $scope.obj)
			.then($scope.postUpdateTickets);

	}		
	
	$scope.updateTicketsByHour = function(){
		$scope.loadingexecUpdate = true;
		$scope.obj2.data = new Array();
		for( var i = 0; i < $scope.listhours.length; i++ ) {
			$scope.obj2.data.push($scope.listhours[i].numberoftickets)
		}
		$http.post(CommonsService.getUrl('/dashboard/storeTicketByHourData'), $scope.obj2)
			.then($scope.postUpdateTickets);

	}		

	$scope.postUpdateTickets = function(data){
		$scope.loadingexecUpdate = false;

		if( data.status = 200 
			&& data.data.error_code === undefined ) {
			SweetAlert.swal({
				title: "Ok!",
				text: "Los tickets del "+ $scope.fromDate
			+ ' al ' + $scope.toDate+" han sido actualizados con éxito",
				type: "success"
			});
		} else {
			SweetAlert.swal({
				title: "Error!",
				text: "Ocurrio un problema, no se han podido guardar los tickets.",
				type: "error"
			});
		}
		
	}

	$scope.update = function() {
		$scope.loadingUpdate = true;

		$scope.obj.address.latitude = $scope.latitude;
		$scope.obj.address.longitude = $scope.longitude;

		$http.post(CommonsService.getUrl('/store'), $scope.obj)
			.then($scope.postUpdate);

	}

	$scope.$on('upload.success', function(event, data) {
		var file = data[0];
		var response = JSON.parse(data[1]);
		$scope.loadingexecUpdate = true;

		file.previewElement.classList.remove('hide-trans');
		$scope.fileUpdateDisabled = false;

		CommonsService.safeApply($scope);
        $scope.period = $('#period').val();
        $scope.image = response.name;

		$scope.liststores = new Array();
		$scope.listdates = new Array();
	
		var obj = {
			method: 'previewFileUpdate',
			brandId: $scope.brand.id,
			period: $scope.period,
			imageId: response.name
		}		

		$http.post(CommonsService.getUrl('/dashboard/storeTicketData'), obj)
			.then($scope.postPreview);
	})

	$scope.postPreview = function(data){
		$scope.listdates = data.data.dateList;

		for( var i = 0; i < data.data.storeList.length; i++ ) {
			var storeElement = {
				identifier: data.data.storeList[i].storeId,
				original: data.data.storeList[i].original,
				name: data.data.storeList[i].storeName,
				tickets: data.data.storeList[i].tickets
			}
			$scope.liststores.push(storeElement);
		}
		$scope.formTicketsClass = '';
		$scope.loadingexecUpdate = false;

		if( data.status = 200 
			&& data.data.error_code === undefined ) {
			SweetAlert.swal({
				title: "Ok!",
				text: "La previsualización de tickets fue generada con éxito. Los tickets aun no están guardados. Por favor, revisa los datos y luego haz un click en el botón Confirmar para guardar los datos.",
				type: "success"
			});
		} else {
			SweetAlert.swal({
				title: "Error!",
				text: "Ocurrio un problema, no se han podido guardar los tickets.",
				type: "error"
			});
		}
		
	}

	$scope.fileUpdate = function() {
		$scope.loadingexecUpdate = true;
		$scope.formTicketsClass = 'hidden';

		$scope.liststores = new Array();
		$scope.listdates = new Array();

        $scope.period = $('#period').val();
	
		var obj = {
			method: 'doFileUpdate',
			brandId: $scope.brand.id,
			period: $scope.period,
			imageId: $scope.image
		}		

		$http.post(CommonsService.getUrl('/dashboard/storeTicketData'), obj)
			.then($scope.postFileUpdate);
	}


	$scope.postFileUpdate = function(data){

		$scope.loadingexecUpdate = false;
		$scope.fileUpdateDisabled = true;

		if( data.status = 200 
			&& data.data.error_code === undefined ) {
			SweetAlert.swal({
				title: "Ok!",
				text: "La carga de tickets ha sido generada con éxito.",
				type: "success"
			});
		} else {
			SweetAlert.swal({
				title: "Error!",
				text: "Ocurrio un problema, no se han podido guardar los tickets.",
				type: "error"
			});
		}
		
	}
	return vm;
};

angular
	.module('bdb')
	.controller('StoreTicketsCtrl', StoreTicketsCtrl);

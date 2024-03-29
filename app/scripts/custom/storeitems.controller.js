/**
 * StoreItemCtrl - controller
 */
function StoreItemCtrl($scope, $http, $location, CommonsService, AuthenticationService ) {

	var vm = this;

	$scope.brands = null;
	$scope.brand = null;
	$scope.stores = null;
	$scope.store = null;

	$scope.obj = null;

	$scope.latitude = 0;
	$scope.longitude = 0;

	$scope.init = function() {
		$scope.brands = new Array();
		$scope.loadingRefresh = true;
		$http.get(CommonsService.getUrl('/dashboard/assignedBrandList'))
			.then($scope.postInit);
		$scope.formItemClass = 'hidden';

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

	$scope.loadUpdate = function(data) {

		$scope.listdays = new Array();
        $scope.loadingloadUpdate = true;
        $scope.fromDate = $('#fromDate').val();
        $scope.toDate = $('#toDate').val();
		console.log($scope.dias);
		console.log($scope.store.id);
		console.log($scope.store);
		$http.get(CommonsService.getUrl('/dashboard/storeItemData')
			+ '&storeId=' + $scope.store.id 
			+ '&fromDate=' + $scope.fromDate
			+ '&toDate=' + $scope.toDate)
			.then($scope.postLoadUpdate);
	}

	$scope.postLoadUpdate = function(data) {
		console.log(data);
		console.log(data.data.data.length)
		$scope.obj = data.data;
		for( var i = 0; i < data.data.data.length; i++ ) {
			//generar la lista de dias/Item
			var day = {
				date: data.data.dates[i],
				numberofItem: data.data.data[i]
			}
			$scope.listdays.push(day);
		}
		console.log($scope.listdays);
		$scope.formItemClass = '';
		$scope.loadingloadUpdate = false;
	}


	$scope.refresh = function(data) {
		$scope.loadingRefresh = true;
		$scope.formItemClass = 'hidden';

	}

	$scope.postRefresh = function(data) {
		$scope.loadingSubmit = false;
		// Default fallback for Mexico City

	}
	$scope.updateItem = function(){
		$scope.loadingexecUpdate = true;
		console.log($scope.listdays);
		$scope.obj.data = new Array();
		for( var i = 0; i < $scope.listdays.length; i++ ) {
			$scope.obj.data.push($scope.listdays[i].numberofItem)
		}
		$http.post(CommonsService.getUrl('/dashboard/storeItemData'), $scope.obj)
			.then($scope.postUpdateItem);

	}		
	

	$scope.postUpdateItem = function(data){
	console.log(data);
		$scope.loadingexecUpdate = false;

		if( data.status = 200 
			&& data.data.error_code === undefined ) {
			swal({
				title: "Ok!",
				text: "Los Item del "+ $scope.fromDate
			+ ' al ' + $scope.toDate+" han sido actualizados con éxito",
				type: "success"
			});
		} else {
			swal({
				title: "Error!",
				text: "Ocurrio un problema, no se han podido guardar el Item.",
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

	return vm;
};

angular
	.module('bdb')
	.controller('StoreItemCtrl', StoreItemCtrl);

angular.module('app', ['ui.bootstrap']);
angular
    .module('app')
    .controller('appCtrl', AppCtrl);

AppCtrl.$inject = ['$scope', '$http'];

function AppCtrl($scope, $http) {
    var vm = this;
    vm.fields = [
        { label: 'Name', key: 'name' },
        { label: 'Email', key: 'email' },
        { label: 'Phone', key: 'phone' }
    ];

    vm.record = {};
    vm.records = [];
    var appRecords = [];
    var maxSize, bigCurrentPage, bigTotalItems, itemsperpage;
    vm.currentPage = 1;
    vm.maxSize = 20;
    vm.itemsperpage = 20;

    vm.handleError = function (response) {
        console.log(response.status + " - " + response.statusText + " - " + response.data);
    }

    vm.getRecords = function (callback) {
        vm.currentPage=callback;
        console.log("The current page is "+vm.currentPage.toString());
        $http.get('/records/' + vm.currentPage + "/" + vm.maxSize).then(function (response) {
            console.log("get");
            vm.totalandrecords = response.data;
            console.log(vm.totalandrecords);
            vm.bigTotalItems = vm.totalandrecords.slice(0,1);
            console.log("The total items are "+vm.bigTotalItems);
            vm.records=response.data.slice(1);
            //console.log(vm.records.toString());                        

        }, function (response) {
            vm.handleError(response);
        });
    }

    vm.pageChanged = function () {
        console.log('Page changed to: ' + vm.currentPage);
        vm.getRecords(vm.currentPage);
        
    };

    vm.getRecords(vm.currentPage);

    vm.editMode = false;
    vm.saveRecord = function() {
        if(vm.editMode) {
            vm.updateRecord();
        } else {
            vm.addRecord();
        }
    }

    vm.addRecord = function() {
        console.log(vm.record);
        $http.post('/records', vm.record).then(function(response){
            vm.record = {};
            vm.getRecords(vm.currentPage);
        }, function(response){
            vm.handleError(response);
        });
    }

    vm.updateRecord = function() {
        $http.put('/records/' + vm.record._id+'/'+vm.currentPage, vm.record).then(function (response) {
            vm.record = {};
            vm.getRecords(vm.currentPage);
            vm.editMode = false;
        }, function(response){
            vm.handleError(response);
        });
    }

    vm.editRecord = function(record) {
        vm.record = record;
        vm.editMode = true;
    }

    vm.deleteRecord = function (recordid) {
        $http.delete('/records/' + recordid+'/'+vm.currentPage).then(function (response) {
            console.log("Deleted");
            vm.getRecords(vm.currentPage);
        }, function (response) {
            vm.handleError(response);
        })
    }

    vm.cancelEdit = function() {
        vm.editMode = false;
        vm.record = {};
        vm.getAllRecords();
    }
}

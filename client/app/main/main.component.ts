const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routing from './main.routes';

export class MainController {
  $http;
  socket;
  data = [];

  /*@ngInject*/
  constructor($http, $scope, socket) {
    this.$http = $http;
    this.socket = socket;

    $scope.$on('$destroy', function () {
      // socket.unsyncUpdates('thing');
    });


  }


  $onInit() {
    // this.$http.get('/api/things').then(response => {
    //   this.data = response.data;
    //   this.socket.syncUpdates('thing', this.data);
    // });
    this.$http.get('/api/bars/search/rockville').then(response => {
      this.data = response.data.businesses;
      //this.socket.syncUpdates('thing', this.data);
    });
  }

  search(term) {
    console.info(term);
    this.$http.get('/api/bars/search/' + term).then(response => {
      this.data = response.data.businesses;
      //this.socket.syncUpdates('thing', this.data);
    });
  }
}

export default angular.module('nitelifeApp.main', [
  uiRouter])
  .config(routing)
  .component('main', {
    template: require('./main.html'),
    controller: MainController
  })
  .name;

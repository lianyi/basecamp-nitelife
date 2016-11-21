const angular = require('angular');
const uiRouter = require('angular-ui-router');
import routing from './main.routes';

export class MainController {
  $http;
  socket;
  $state;
  Auth;
  getCurrentUserSync;
  data = [];

  /*@ngInject*/
  constructor($http, $scope, socket, $state, Auth) {
    this.$http = $http;
    this.socket = socket;
    this.Auth = Auth;
    this.$state = $state;
    this.getCurrentUserSync = Auth.getCurrentUserSync;

    $scope.$on('$destroy', function () {
      // socket.unsyncUpdates('thing');
    });


  }


  $onInit() {

    this.search('rockville');


  }

  search(term) {
    let userid = this.getCurrentUserSync()._id;
    this.$http.get('/api/bars/search/' + term).then(response => {
      this.data = response.data.businesses;
      //this.socket.syncUpdates('thing', this.data);
    });
  }

  amIGoing(bar) {
    let userid = this.getCurrentUserSync()._id;
    if (userid && bar.visitors) {
      var idx = bar.visitors.indexOf(userid);
      bar.amIGoing = (idx !== -1);
    } else {
      bar.amIGoing = false;
    }
    return bar.amIGoing;
  }

  changeGoing(bar) {
    const userid = this.getCurrentUserSync()._id;
    if (userid) {
      this.$http.put('/api/bars/' + bar.id + '/' + userid).then(response => {
        this.data.filter(function (d) {
          return d.id === bar.id
        }).forEach(function (d) {
          var idx = d.visitors.indexOf(userid);
          if (idx !== -1) {
            d.visitors.splice(idx, 1);
          } else {
            d.visitors.push(userid);
          }
          d.visitorsCount = d.visitors.length;
        });
      });
    } else {
      this.$state.go('login');

    }
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

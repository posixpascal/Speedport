angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $http, CSRF, Device, Speedport) {
  $scope.loggedIn = false;
  Speedport.login().then(function(){
    $scope.loggedIn = true;
    Speedport.fetchDevices().then(function(devices){
      $scope.devices = devices.filter(function(device){
        return device.varid == "wlan_addmdevice";
      }).map(function(data){
        return new Device(data);
      });
    });
  });

  $scope.csgo = true;
  $scope.toggleCSGO = function(){

  }

  $scope.rebooting = false;
  $scope.reboot = function(){
    $scope.rebooting = true;
    CSRF.get(SPEEDPORT_CONFIG.host + "/html/content/config/problem_handling.html?lang=de").then(function(csrf){
      $http({
        method: "POST",
        data: {
          reboot_device: true,
          csrf_token: csrf
        },
          transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            },
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        url: SPEEDPORT_CONFIG.host + "/data/Reboot.json?_time=" + (+new Date()) + "&_rand=109&csrf_token=" + csrf + "&lang=de"
    }).then(function(){
      $scope.rebooting = false;
    });
    });
  }

  $scope.block = function(device){
    $scope.setDeviceType(device, 1);
  }

  $scope.unblock = function(device){
    $scope.setDeviceType(device, 0);
  }

  $scope.setDeviceType = function(device, mode){
    var data = {wlan_allow_all: 1}
      for (var i = 1, len = $scope.devices.length; i <= len; i++){
        var theDevice = $scope.devices[i - 1];
        if (mode == 0){
          data["mdevice_name[" + ("" + i) + 1 + "]"] = 1;
        } else {
          data["mdevice_name[" + ("" + i) + 1 + "]"] = (theDevice.sid == device.sid ? +!mode : mode);
        }
        data["sid[" + ("" + i) + 1 + "]"] = theDevice.sid;
        theDevice.blocked = false;
      }
      device.blocked = true;
    CSRF.get(SPEEDPORT_CONFIG.host + "/html/content/network/wlan_access.html?lang=de").then(function(csrf){
      data.csrf_token = csrf

        $http({
            method: "POST",
            url: SPEEDPORT_CONFIG.host + "/data/WLANAccess.json?lang=de", 
            data: data,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            }}).then(function(){
              alert("done");
            });
    });
  }

});
angular.module('starter.services', [])
.factory("CSRF", function($q, $http){
  return {
    get: function(url){
      return $q(function(resolve, reject){
        $http.get(url).then(function(req){
          resolve(req.data.match(SPEEDPORT_CONFIG.csrf_pattern)[1]);
        });
      });
    }
  }
})
.service("Speedport", function(CSRF, $q, $http){
  var Speedport = function(){
    this.host = SPEEDPORT_CONFIG.host;
    this.pass = SPEEDPORT_CONFIG.pass;
    return this;
  }

  Speedport.prototype.login = function(){
    var self = this;
    return $q(function(resolve, reject){
      $http.get(self.host).then(function(req){
        // get cookie
        CSRF.get(self.host + "/html/login/index.html").then(function(csrf){

          // post login
          $http({
            method: "POST",
            url: self.host + "/data/Login.json?lang=de", 
            data: {
              password: self.pass,
              showpw: 0,
              csrf_token: csrf
            },
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj)
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                return str.join("&");
            }}).then(function(){
            console.log("posted");
            $http.get(self.host + "/html/content/overview/index.html?lang=de").then(function(req){
              body = req.data;
              resolve();
            });
          });


        });
      });
    });
  }

  Speedport.prototype.fetchDevices = function(){
    return $q(function(resolve, reject){
      CSRF.get(SPEEDPORT_CONFIG.host + "/html/content/network/wlan_access.html?lang=de").then(function(csrf){
        $http.get(SPEEDPORT_CONFIG.host + "/data/WLANAccess.json?_time=" + (+new Date()) + "&_rand=963&csrf_token=" + csrf + "&_time=" + (+new Date()) + "&_rand=692&csrf_token=" + csrf).then(function(req){
          resolve(req.data);
        })
      })
    });
  }

  return new Speedport();
}).service("Device", function($q, $http){
  var Device = function(data){
    var self = this;
    this.blocked = false;
    data.varvalue.forEach(function(value){
      switch (value.varid){
        case "sid":
          self.sid = value.varvalue;
          break; 

        case "mdevice_name":
          self.name = value.varvalue;
          break;

        case "mdevice_mac":
          self.mac = value.varvalue;
          break;

        case "mdevice_connected":
          self.connected = value.varvalue == "1";
          break;

        case "mdevice_ipv4":
          self.ipv4 = value.varvalue;
          break;
      }
    });

    return this;
  }

  return Device;
});

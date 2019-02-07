(function () {
    "use strict";

    VSS.ready(function() {
        var initialConfig = VSS.getConfiguration();
        var text = "Resource id passed as initial config: " + initialConfig.resourceId;
        console.log(text);
        document.getElementsByClassName("fxs-frame-content")[0].innerText = text;
        initialConfig.getResourceData(initialConfig.resourceId, "2018-04-01").then(function (result) {
            document.getElementsByClassName("fxs-frame-content2")[0].innerText = "Resource name: " + result.name;  
        });

        VSS.getAccessToken().then(function (result) {
            document.getElementsByClassName("fxs-frame-token")[0].innerText = result.token;
            $.ajax
            ({
              type: "GET",
              url: "https://bishaldft1.vsrm.vsts.me/_apis/release/releases",
              dataType: 'json',
              async: false,
              beforeSend: function (xhr) {
                xhr.setRequestHeader ("Authorization", "Bearer " + result.token);
              },
              success: function (value){
                console.log("count = " + value.length)
              }
          });
        });

        VSS.register("resource-section", {
            setResourceId: function (resourceId) {
                var text2 = "Resource id called and set by parent: " + resourceId;
                console.log(text2);
                document.getElementsByClassName("fxs-frame-content2")[0].innerText = text2;    
            }
        });
        VSS.notifyLoadSucceeded();
    });
})();

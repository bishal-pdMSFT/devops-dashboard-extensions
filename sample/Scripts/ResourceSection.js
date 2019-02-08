(function () {
    "use strict";

    VSS.ready(function() {
        
        main();
        VSS.register("resource-section", {
            refresh: function () {
                main(); 
            }
        });
        VSS.notifyLoadSucceeded();
    });

    function main() {
        var initialConfig = VSS.getConfiguration();
        var text = "Azure resource Uri: " + initialConfig.resourceId;
        console.log(text);
        document.getElementsByClassName("fxs-frame-resource-uri")[0].innerText = text;
        initialConfig.getResourceData(initialConfig.resourceId, "2018-04-01").then(function (result) {
            document.getElementsByClassName("fxs-frame-resource-name")[0].innerText = "Resource name: " + result.name;
        });
        
        VSS.getAccessToken().then(function (result) {
            
            $.ajax
            ({
              method: "GET",
              url: `https://vsrm.dev.azure.com/${initialConfig.orgName}/${initialConfig.projectId}/_apis/release/releases?definitionId=${initialConfig.releaseDefinitionId}&$top=1&$expand=environments`,
              dataType: 'json',
              crossDomain: true,
              contentType: "application/json",
              async: true,
              cache:false,
              beforeSend: function (xhr) {
                xhr.setRequestHeader ("Authorization", "Bearer " + result.token);
              },
              success: function (value){
                document.getElementsByClassName("fxs-frame-status")[0].innerText = "Deployment status: " + value.value[0].environments[0].status;
              }
          });
        });
    }
})();

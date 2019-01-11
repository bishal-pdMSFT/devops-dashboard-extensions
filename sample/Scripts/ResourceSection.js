(function () {
    "use strict";

    VSS.ready(function() {
        var initialConfig = VSS.getConfiguration();
        var text = "Resource id passed as initial config: " + initialConfig.resourceId;
        console.log(text);
        document.getElementsByClassName("fxs-frame-content")[0].innerText = text;

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

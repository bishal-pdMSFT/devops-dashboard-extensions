(function () {
    "use strict";
    var viewModel;
    var initialConfig;

    VSS.ready(function() {
        
        initialize();
        VSS.register("resource-section", {
            refresh: function () {
                refresh(); 
            }
        });
        VSS.notifyLoadSucceeded();
    });

    function getStatusIcon(status) {
        var failedSvg= `<svg viewBox="0 0 9 9" class="fxs-portal-svg" role="presentation" focusable="false" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%"><g><title></title><circle cx="4.5" cy="4.5" r="4.5" class="msportalfx-svg-c22"></circle><path d="M7 2.8L6.2 2 4.5 3.7 2.8 2l-.8.8 1.7 1.7L2 6.2l.8.8 1.7-1.7L6.2 7l.8-.8-1.7-1.7z" class="msportalfx-svg-c01"></path></g></svg>`;
        var inProgressSvg= `<svg viewBox="0 0 16 16" class="fxs-portal-svg" role="presentation" focusable="false" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%"><g><title></title><circle cx="8" cy="8" r="8" class="msportalfx-svg-c19"></circle><path d="M7.747 3.18h-.054c-1.119 0-2.157.394-2.996 1.017L3 2.5v4.467h4.466L5.781 5.281a3.166 3.166 0 0 1 1.966-.661c1.676 0 3.066 1.179 3.358 2.72h1.474a4.88 4.88 0 0 0-4.832-4.16zM12.8 9.013H8.387l.022.012h-.022l1.633 1.633c-.554.388-1.215.595-1.966.595-1.512 0-2.799-1.022-3.239-2.4H3.269a4.887 4.887 0 0 0 4.784 3.84h.053c1.102 0 2.127-.38 2.961-.987l1.786 1.786V9.013H12.8z" class="msportalfx-svg-c01"></path></g></svg>`;
        var successSvg= `<svg viewBox="0 0 16 16" class="fxs-portal-svg" role="presentation" focusable="false" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="100%" height="100%"><g><title></title><circle cx="8" cy="8" r="8" class="msportalfx-svg-c14"></circle><path d="M3.989 8.469L3.7 8.156a.207.207 0 0 1 .012-.293l.835-.772a.204.204 0 0 1 .289.012l2.296 2.462 3.951-5.06a.204.204 0 0 1 .289-.035l.903.697a.198.198 0 0 1 .035.285l-5.075 6.497-3.246-3.48z" class="msportalfx-svg-c01"></path></g></svg>`;        
        
        switch (status.toUpperCase()) {
            case "INPROGRESS":
            case "DEALLOCATING":
            case "STARTING":
            case "WAITINGFORNODES":
            case "DEPLOYING":
            case "BASELINEUPGRADE":
            case "UPDATINGUSERCONFIGURATION":
            case "UPDATINGUSERCERTIFICATE":
            case "UPDATINGINFRASTRUCTURE":
            case "ENFORCINGCLUSTERVERSION":
            case "UPGRADESERVICEUNREACHABLE":
            case "SCALEUP":
            case "SCALEDOWN":
            case "AUTOSCALE":
                return {
                    iconContent: ko.observable(inProgressSvg),
                    iconTitle: ko.observable("In Progress")
                };
    
            case "COMPLETED":
            case "SUCCEEDED":
            case "RUNNING":
            case "ONLINE":
            case "READY":
            case "ACTIVE":
                return {
                    iconContent: ko.observable(successSvg),
                    iconTitle: ko.observable("Success")
                };
            case "FAILED":
            case "REJECTED":
            case "STOPPED":
            case "CANCELED":
            case "DEALLOCATED":
            case "STOPPED (DEALLOCATED)":
                return {
                    iconContent: ko.observable(failedSvg),
                    iconTitle: ko.observable("Failed")
                };
            default:
                return {
                    iconContent: ko.observable(""),
                    iconTitle: ko.observable("")
                };
        }
    }

    function getIcon(content, title) {
        return {
            iconContent: ko.observable(content),
            iconTitle: ko.observable(title)
        };
    }

    function registerComponents(){
        ko.components.register('icon', {
            viewModel: {
                createViewModel: (params, component) => {
                    window.iconTitle = ko.pureComputed(function () { 
                        return params.iconTitle ? 
                        params.iconTitle() : ""; 
                    }, window);
                    window.iconContent = ko.pureComputed(function () { return params.iconContent() ? `<title>${window.iconTitle()}</title>${params.iconContent()}` : "" }, window);
                }
            },
            template: `<svg data-bind="html: iconContent()" class="fxs-portal-svg" height="100%" width="100%" aria-hidden="true" role="presentation" focusable="false">
                        </svg>`
        });
    }

    function initialiseViewModel(){
        var resourceSectionModel = function() {
            var isLoadingSvg = `<svg viewBox="0 0 16 16" class="fxs-portal-svg" role="presentation" focusable="false" xmlns:svg="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true"><g><g class="msportalfx-svg-loading-animated"><rect y="6" width="4" height="4" class="msportalfx-svg-loading-square msportalfx-svg-c07"></rect><rect x="6" y="6" width="4" height="4" class="msportalfx-svg-loading-square msportalfx-svg-c07"></rect><rect x="12" y="6" width="4" height="4" class="msportalfx-svg-loading-square msportalfx-svg-c07"></rect></g></g></svg>`;
            var image = `<svg viewBox='0 0 32 32' class='msportalfx-svg-placeholder' role='presentation' focusable='false' xmlns:svg='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'><g><title></title><g><g class='msportalfx-svg-c19'><circle cx='13.4' cy='4.9' r='3.1'/><circle cx='20.5' cy='14.9' r='3.7'/><circle cx='26.7' cy='25.9' r='2.9'/><circle cx='15.2' cy='23.9' r='2.5'/><circle cx='5.1' cy='16.3' r='2.5'/><path d='M13.942 4.305l7.074 10.063-1.31.92-7.073-10.062z'/><path d='M21.117 14.372l6.26 10.936-1.39.795-6.259-10.936z'/><path d='M20.27 14.04l.132 1.594L5.154 16.9l-.133-1.595z'/><path d='M19.71 14.44l1.37.826-5.367 8.908-1.37-.826zM31.5 0h-8.1c-.3 0-.5.2-.5.6v2.9c0 .3.2.5.5.5H28v4.5c0 .3.2.5.6.5h2.9c.3 0 .5-.2.5-.5v-8c0-.3-.2-.5-.5-.5zM.5 31.9h8.1c.3 0 .5-.2.5-.6v-2.9c0-.3-.2-.5-.5-.5H4v-4.5c0-.3-.2-.5-.6-.5H.5c-.3 0-.5.2-.5.5v8c0 .3.2.5.5.5z'/></g></g></g></svg>`;
            this.showDashboardAzureResourceTile = ko.observable(true);
            this.dashboardAzureResourceHeader = ko.observable("Azure resources");
            this.errorMessage = ko.observable("");
            this.isLoading = ko.observable(true);
            this.isLoadingSvg = ko.observable(isLoadingSvg);
            this.serviceHeader = ko.observable("Iot Hub");
            this.resourceTypeImage = ko.observable(getIcon(image, "Iot Hub"));
            this.statusIcon = ko.observable(getIcon("",""));
            this.name = ko.observable("");
            this.status = ko.observable("");
            this.nameAriaLabel = ko.observable("");
            this.endpointAriaLabel = ko.observable("");
            this.onNameClick = () => {
                initialConfig.openBlade('ResourceMenuBlade', 'HubsExtension', {
                    parameters: { id: initialConfig.resourceId },
                });
            }        
        };
        viewModel = new resourceSectionModel();
        ko.applyBindings(viewModel); 
    }

    function initialize() {
        initialConfig = VSS.getConfiguration();        
        registerComponents();
        initialiseViewModel();
        refresh();
    }

    function refresh(){
        viewModel.isLoading(true);
        VSS.getAccessToken().then(function (result) {
            var obj = {
                method: "GET",
                url: `https://vsrm.dev.azure.com/${initialConfig.orgName}/${initialConfig.projectId}/_apis/Release/definitions?definitionId=${initialConfig.releaseDefinitionId}`,
                dataType: 'json',
                crossDomain: true,
                contentType: "application/json",
                async: true,
                cache:false,
                beforeSend: function (xhr) {
                  xhr.setRequestHeader ("Authorization", "Bearer " + result.token);
                },
                success: getReleaseInformationSuccessHandler
            };
            $.ajax(obj);
        });
    }

    function getServiceEndpointId(releaseDefinition) {
        var environment = releaseDefinition["environments"][0];
        var tasks = [];
        if (environment["deployPhases"]) {
            tasks = environment["deployPhases"][0]["workflowTasks"];
        }
        else {
            tasks = environment["deployStep"]["tasks"];
        }

        var serviceEndpointId = "";
        tasks.forEach((task) => {
            if (task["taskId"] == "94a74903-f93f-4075-884f-dc11f34058b4" && !!task["inputs"]["ConnectedServiceName"]) {
                serviceEndpointId = task["inputs"]["ConnectedServiceName"];
                return;
            }
        });                
        return serviceEndpointId;
    } 
    
    function parseResourceDescriptor(resourceId) {
        var parts = {};
    
        resourceId = resourceId.toLowerCase();
        parts.subscription = extractPart(resourceId, "/subscriptions/");
        parts.resourceGroup = extractPart(resourceId, "/resourcegroups/");
        parts.provider = extractPart(resourceId, "/providers/");
        parts.resourceType = extractPart(resourceId, "/" + parts.provider + "/");
        parts.resource = extractPart(resourceId, "/" + parts.resourceType + "/");
        return parts;
    }
    
    function extractPart(resourceId, delimiter) {
        var value = "";
        if (resourceId.indexOf(delimiter) !== -1) {
            var parts1 = resourceId.split(delimiter);
            if (parts1.length > 1) {
                var parts2 = parts1[1].split('/')
                value = parts2[0];
            }
        }                
        return value;
    }

    function getproxyDataSource(endpointid) {
        var parts = parseResourceDescriptor(initialConfig.resourceId);
        return {
            "serviceEndpointDetails": null,
            "dataSourceDetails": {
                "dataSourceUrl": "{{{endpoint.url}}}/subscriptions/{{{endpoint.subscriptionId}}}/resourceGroups/$(azureResourceGroup)/providers/Microsoft.Devices/IotHubs?api-version=2018-04-01",
                "resourceUrl": "",
                "parameters": {
                    "azureSubscriptionEndpoint": endpointid,
                    "azureResourceGroup": parts.resourceGroup
                },
                "resultSelector": "jsonpath:$.value[*]"
            }
        };
    }

    function getReleaseInformationSuccessHandler(releaseDefinition){        
        var serviceEndpointId = getServiceEndpointId(releaseDefinition);
        var payload = getproxyDataSource(serviceEndpointId);  
        VSS.getAccessToken().then(function (result) {
  
          $.ajax
          ({
            method: "POST",
            url: `https://dev.azure.com/${initialConfig.orgName}/${initialConfig.projectId}/_apis/serviceendpoint/endpointproxy?endpointId=${serviceEndpointId}`,
            dataType: 'json',
            crossDomain: true,
            contentType: "application/json",
            async: true,                      
            cache:false,
            data:JSON.stringify(payload),
            beforeSend: function (xhr) {
              xhr.setRequestHeader ("Authorization", "Bearer " + result.token);
              xhr.setRequestHeader ("Accept", "application/json;api-version=5.0-preview.1");
            },
            success: executeServiceEndpointRequestSuccessHandler
          });                    
      });
    }

    function executeServiceEndpointRequestSuccessHandler(servicesListPromiseState){
               
        var serviceList = servicesListPromiseState;
        if (serviceList["result"] && serviceList["result"].length > 0) {
            var servicesresult = JSON.parse(serviceList["result"][0]);
            var name = servicesresult['name'];
            var status = servicesresult['properties']['state'];
            viewModel.isLoading(false);
            if (name && name != ' ') {                 
                viewModel.nameAriaLabel(`Iot hub resource: ${name} status: ${status}, click to open resource blade`);
                viewModel.endpointAriaLabel(`${name} Iot Hub application endpoint status ${status}`);
            }
            viewModel.name(name);
            viewModel.status(status);
            viewModel.statusIcon(getStatusIcon(status));
        }
  }

})();

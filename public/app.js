import 'jquery';
import uiModules from 'ui/modules';
import uiRoutes from 'ui/routes';
import chrome from 'ui/chrome';

import 'ui/autoload/all'
import 'ui/autoload/styles';
import './less/main.less';
import indexTemplate from './templates/index.html';


uiRoutes.enable();
uiRoutes
.when('/', {
  template: indexTemplate,
  controller: 'indexController',
});


uiModules
.get('app/search-guard-multitenancy-dashboards')
.controller('indexController', function($routeParams, $http, $scope, timefilter) {
    let APP_ROOT = `${chrome.getBasePath()}/searchguard`;
    let API_ROOT = `${APP_ROOT}/api/v1`;

    timefilter.enabled = false;

    $scope.hasAccess = true;
    $scope.tenants = [];
    $scope.username = "";
    $scope.currentTenant = "";

    $scope.loadTenantsApi = function(onLoad) {
        $http.get(`${API_ROOT}/auth/authinfo`)
        .then(
            (response) => {
                $scope.username = response.data.user_name;
                let allTenants = response.data.sg_tenants;
                delete allTenants[$scope.username];


                let tenants = [];
                for (let tenant in allTenants) {
                    if (allTenants.hasOwnProperty(tenant)) {
                        tenants.push(tenant);
                    }
                }
                tenants.sort();

                $http.get(`${API_ROOT}/multitenancy/tenant`)
                .then(
                    (response) => {
                        $scope.currentTenant = response.data;
                        onLoad(tenants);
                    },
                    (error) => notify.error(error)
                );
            },
            (error) => {
                console.log(error);
                $scope.hasAccess = false;
            }
        );
    };

    $scope.loadTenants = (onLoad) => {
        onLoad([
            "Tenant 3",
            "Tenant 1",
            "Tenant 2",
        ]);
    };

    $scope.selectTenant = function (tenant, onChange) {
        $http.post(`${API_ROOT}/multitenancy/tenant`, {tenant: tenant, username: $scope.username})
        .then(
            (response) => {
                let currentTenant = response.data;
                onChange(currentTenant);
            },
            (error) => {
                console.log(error);
                $scope.hasAccess = false;
            }
        );
    };

    $scope.loadDashboards = function (onLoad) {
        $http.get(`../api/search-guard-multitenancy-dashboards/dashboards/`).then((response) => {
            onLoad(response);
        });
    };

    $scope.isLoadDashboards = false;
    $scope.loadTenantDashboards = function(tenant, onLoad) {
        let _tenant = tenant;
        let _onLoad = onLoad;
        if (!$scope.isLoadDashboards) {
            $scope.isLoadDashboards = true;
            $scope.selectTenant(tenant, (currentTenant) => {
                console.log("Tenant " + tenant + " is select");
                console.log("Start load dashboards for tenant " + _tenant);
                $scope.loadDashboards((dashboards) => {
                    console.log("Done load dashboards: ");
                    console.log(dashboards.data);

                    let dashboardsObj = [];
                    for (let i in dashboards.data) {
                        let dash = dashboards.data[i];
                        dashboardsObj.push({
                            tenant: currentTenant,
                            title: dash.title,
                            id: dash.id,
                        });
                    }

                    _onLoad(currentTenant, dashboardsObj);
                    $scope.isLoadDashboards = false;
                });
            });
        } else {
            setTimeout(() => {
                $scope.loadTenantDashboards(_tenant, _onLoad);
            }, 50);
        }
    };

    $scope.makeDashboardLink = function(dashboardId) {
        return "/app/kibana#/dashboard/" + dashboardId;
    };

    $scope.redirectDashboard = function(tenant, dashboardId) {
        let link = $scope.makeDashboardLink(dashboardId);
        $scope.selectTenant(tenant, (currentTenant) => {
            // window.location.href = link;
        });
    };

    /////////////////////////////////////////////////////////////////////
    $scope.loadTenants((tenants) => {
        for (let i in tenants) {
            let tenantId = tenants[i];
            $scope.tenants.push({
                tenant: tenantId,
                dashboards: [
                    {tenant:"tenant", title: "Dash 3 title", id: "asdasdasdasdasd"},
                    {tenant:"tenant", title: "Dash 2 title", id: "asdasdasdasdasd"},
                    {tenant:"tenant", title: "Dash 1 title", id: "asdasdasdasdasd"},
                ]
            });
        }
    });

    // $scope.loadTenantsApi((tenants) => {
    //     for (let i in tenants) {
    //         $scope.loadTenantDashboards(tenants[i], function(tenantId, dashboards) {
    //             if (dashboards.length > 0) {
    //                 let tenant = {
    //                     tenant: tenantId,
    //                     dashboards: dashboards,
    //                 };
    //
    //                 $scope.tenants.push(tenant);
    //                 console.log(tenant);
    //             }
    //         });
    //     }
    // });
});



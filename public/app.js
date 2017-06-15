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


let isLoad = false;

uiModules
.get('app/multitenancy-dashboards')
.controller('indexController', function($routeParams, $http, $scope, timefilter) {
    if (isLoad) {
        return;
    }
    isLoad = true;

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

    $scope.loadTenantsTest = (onLoad) => {
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
        $http.get(`../api/multitenancy-dashboards/dashboards/`).then((response) => {
            onLoad(response);
        });
    };

    $scope.isLoadDashboards = false;
    $scope.eachLoadTenantDashboards = function(tenants, onLoad, onFinish) {
        let _tenant = tenants.pop();
        let _tenants = tenants;
        let _onLoad = onLoad;
        let _onFinish = onFinish;

        $scope.selectTenant(_tenant, (currentTenant) => {
            $scope.loadDashboards((dashboards) => {
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
                if (_tenants.length > 0) {
                    $scope.eachLoadTenantDashboards(_tenants, _onLoad, _onFinish);
                } else {
                    _onFinish();
                }
            });
        });
    };

    $scope.makeDashboardLink = function(dashboardId) {
        return "/app/kibana#/dashboard/" + dashboardId;
    };

    $scope.redirectDashboard = function(tenant, dashboardId) {
        let link = $scope.makeDashboardLink(dashboardId);
        $scope.selectTenant(tenant, (currentTenant) => {
            window.location.href = link;
        });
    };

    $scope.changeTenant = function(tenant) {
        $scope.selectTenant(tenant, function(tenant) {
            $scope.currentTenant = tenant;
        });
    };

    /////////////////////////////////////////////////////////////////////
    // $scope.loadTenantsTest((tenants) => {
    //     for (let i in tenants) {
    //         let tenantId = tenants[i];
    //         $scope.tenants.push({
    //             tenant: tenantId,
    //             dashboards: [
    //                 {tenant:"tenant", title: "Dash 3 title", id: "asdasdasdasdasd"},
    //                 {tenant:"tenant", title: "Dash 2 title", id: "asdasdasdasdasd"},
    //                 {tenant:"tenant", title: "Dash 1 title", id: "asdasdasdasdasd"},
    //             ]
    //         });
    //     }
    // });

    $scope.loadTenantsApi((tenants) => {
        tenants.sort(function (a,b) {
            if (a.tenant < b.tenant)
                return -1;
            if (a.tenant > b.tenant)
                return 1;
            return 0;
        });

        $scope.eachLoadTenantDashboards(tenants, function(tenant, dashboards) {
            if (dashboards.length > 0) {
                $scope.tenants.push({
                    tenant: tenant,
                    dashboards: dashboards,
                });
            }
        }, function () {
            $scope.selectTenant($scope.currentTenant, function() {});
        });
    });
});



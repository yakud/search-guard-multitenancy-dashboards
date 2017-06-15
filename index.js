import api from './server/routes';

export default function (kibana) {
  return new kibana.Plugin({
    require: ['elasticsearch'],

    uiExports: {
      app: {
        title: 'Dashboards',
        description: 'All tenants dashboard on a single page',
        main: 'plugins/multitenancy-dashboards/app',
        icon: 'plugins/kibana/assets/dashboard.svg',
      }
    },

    init(server, options) {
      api(server);
    }
  });
};

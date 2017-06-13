// var https = require('https');

export default function (server) {
  const { callWithRequest } = server.plugins.elasticsearch.getCluster('data');
  const { callWithInternalUser } = server.plugins.elasticsearch.getCluster('data');

  server.route({
    path: '/api/search-guard-multitenancy-dashboards/dashboards',
    method: 'GET',
    handler(req, reply) {
      callWithRequest(req, 'search', {
        index: '.kibana',
        type: 'dashboard',
        body: {
          query:{match_all:{}},
        },
        size: 10000
      }).then(function (response) {
        let dashboards = [];
        for (let i in response.hits.hits) {
          let dash = response.hits.hits[i];
          dashboards.push({
            id: dash._id,
            title: dash._source.title,
          });
        }
        reply(dashboards);
      });
    }

  });

};

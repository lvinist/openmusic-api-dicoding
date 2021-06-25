const routes = require('./routes');
const ExportsHandler = require('./handler');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { producerService, playlistServices, validator }) => {
    const exportsHandler = new ExportsHandler(producerService, playlistServices, validator);

    server.route(routes(exportsHandler));
  },
};

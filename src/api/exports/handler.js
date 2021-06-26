/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
const ClientError = require('../../exceptions/ClientError');

class ExportsHandler {
  constructor(producerService, playlistServices, validator) {
    this._producerService = producerService;
    this._playlistServices = playlistServices;
    this._validator = validator;

    this.postExportSongsPlaylistHandler = this.postExportSongsPlaylistHandler.bind(this);
  }

  async postExportSongsPlaylistHandler(request, h) {
    try {
      this._validator.validateExportsPayload(request.payload);

      const { id: credentialId } = request.auth.credentials;
      const id = request.params.playlistId;

      const message = {
        id,
        targetEmail: request.payload.targetEmail,
      };

      console.log(id);

      await this._playlistServices.verifyPlaylistAccess(id, credentialId);
      await this._producerService.sendMessage('export:Songsplaylists', JSON.stringify(message));

      const response = h.response({
        status: 'success',
        message: 'Permintaan Anda sedang kami proses',
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = ExportsHandler;

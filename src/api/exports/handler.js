/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
const ClientError = require('../../exceptions/ClientError');

class ExportsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postExportSongsPlaylistHandler = this.postExportSongsPlaylistHandler.bind(this);
  }

  async postExportSongsPlaylistHandler(request, h) {
    try {
      this._validator.validateExportsPayload(request.payload);

      const message = {
        userId: request.auth.credentials,
        targetEmail: request.payload.targetEmail,
      };

      await this._service.sendMessage('export:Songsplaylists', JSON.stringify(message));

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

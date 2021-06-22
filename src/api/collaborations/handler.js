/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
const ClientError = require('../../exceptions/ClientError');

class CollaborationsHandler {
  constructor(collaborationsService, playlistServices, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistServices = playlistServices;
    this._validator = validator;

    this.postCollaborationsHandler = this.postCollaborationsHandler.bind(this);
    this.deleteCollaborationsHandler = this.deleteCollaborationsHandler.bind(this);
  }

  async postCollaborationsHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload);
      const { id: credentialId } = request.auth.credentials;
      const { playlistId: id, userId } = request.payload;

      await this._playlistServices.verifyPlaylistOwner(id, credentialId);
      const collaborationId = await this._collaborationsService.addCollaborations(id, userId);

      const response = h.response({
        status: 'success',
        message: 'Kolaborasi berhasil ditambahkan',
        data: {
          collaborationId,
        },
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
        message: 'Maaf, Server kami mengalami kegagalan',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteCollaborationsHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload);
      const { id: credentialId } = request.auth.credentials;
      const { playlistId, userId } = request.payload;

      this._playlistServices.verifyPlaylistOwner(playlistId, credentialId);
      await this._collaborationsService.deleteCollaborations(
        playlistId,
        userId,
      );

      const response = h.response({
        status: 'success',
        message: 'Kolaborasi berhasil dihapus',
      });
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
        message: 'Maaf, Server kami mengalami kegagalan',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = CollaborationsHandler;

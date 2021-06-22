/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { mapPlaylistDBtoModel, mapSongsPlaylistDBtoModel } = require('../../utils/index');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationsError = require('../../exceptions/AuthorizationsError');

class PlaylistServices {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylist(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username from playlists
      LEFT JOIN collaborations on collaborations.playlist_id = playlists.id
      INNER JOIN users on users.id = playlists.owner
      WHERE collaborations.user_id = $1 OR playlists.owner = $1`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapPlaylistDBtoModel);
  }

  async addSongToPlaylist({ playlistId, songId }) {
    const id = `songlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlistsongs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
  }

  async getSongsByPlaylistId({ playlistId }) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer FROM songs
            INNER JOIN playlistsongs ON playlistsongs.song_id = songs.id
            WHERE playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows.map(mapSongsPlaylistDBtoModel);
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlistsongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal dihapus dari playlist. Id tidak ditemukan');
    }
  }

  async deletePlaylistByPlaylistId(playlistId) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner(playlistId, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];

    if (playlist.owner !== owner) {
      throw new AuthorizationsError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistServices;

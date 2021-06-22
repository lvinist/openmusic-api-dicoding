/* eslint-disable camelcase */
const mapSongsDBtoModel = ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  inserted_at,
  updated_at,
}) => ({
  id,
  title,
  year,
  performer,
  genre,
  duration,
  insertedAt: inserted_at,
  updatedAt: updated_at,
});

const mapPlaylistDBtoModel = ({
  id,
  name,
  username,
}) => ({
  id,
  name,
  username,
});

const mapSongsPlaylistDBtoModel = ({
  id,
  title,
  performer,
}) => ({
  id,
  title,
  performer,
});

module.exports = { mapSongsDBtoModel, mapPlaylistDBtoModel, mapSongsPlaylistDBtoModel };

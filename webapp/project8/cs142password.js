const crypto = require('crypto');

/**
 * Return a salted and hashed password entry from a clear text password.
 * @param {string} clearTextPassword
 * @return {object} passwordEntry with properties { salt, hash }
 */
function makePasswordEntry(clearTextPassword) {
  const salt = crypto.randomBytes(8).toString('hex'); // 8 bytes -> 16 hex chars
  const shasum = crypto.createHash('sha1');
  shasum.update(salt + clearTextPassword);
  const hash = shasum.digest('hex'); // 40 hex chars
  return { salt, hash };
}

/**
 * Return true if the specified clear text password and salt generates the
 * specified hash.
 */
function doesPasswordMatch(hash, salt, clearTextPassword) {
  const shasum = crypto.createHash('sha1');
  shasum.update(salt + clearTextPassword);
  const computed = shasum.digest('hex');
  return computed === hash;
}

module.exports = {
  makePasswordEntry,
  doesPasswordMatch,
};

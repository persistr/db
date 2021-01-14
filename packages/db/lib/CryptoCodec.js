const crypto = require('crypto')

jwt.generate('PBES2-HS512+A256KW', 'A256GCM', { ...payload, iss: issuer }, secret, (error, token) => {


exports.generate = (alg, enc, payload, ...rest) => {
  // alg, enc, payload, key[, cb] or alg, enc, payload, keystore, kid[, cb]
  let key;
  let cb;
  let header = { alg: alg, enc: enc };
  if (rest[0].constructor !== Object) {
    key = rest[0];
    cb = typeof rest[1] === 'function' ? rest[1] : undefined;
  } else {
    header.kid = rest[1];
    key = rest[0][rest[1]];
    cb = typeof rest[2] === 'function' ? rest[2] : undefined;
    if (!key) {
      return responder(new TypeError('Invalid key identifier'), null, cb);
    }
  }
  let aMatch = typeof alg === 'string' ? alg.match(ALG_RE) : null;
  if (!aMatch || (aMatch[2] && +aMatch[2] !== aMatch[4] * 2)) {
    let error = new TypeError('Unrecognized key management algorithm');
    return responder(error, null, cb);
  }
  let eMatch = typeof enc === 'string' ? enc.match(ENC_RE) : null;
  if (!eMatch || (eMatch[3] && +eMatch[3] !== eMatch[1] * 2)) {
    let error = new TypeError('Unrecognized content encryption algorithm');
    return responder(error, null, cb);
  }
  let salt;
  if (aMatch[2]) {
    let p2s = crypto.randomBytes(16);
    header.p2c = 1024;
    header.p2s = buf2b64url(p2s);
    salt = Buffer.concat([Buffer.from(alg), Buffer.from([0]), p2s]);
    if (!cb) {
      let bits = Number(aMatch[2]);
      key = crypto.pbkdf2Sync(key, salt, header.p2c, bits >> 4, `sha${bits}`);
    }
  }
  let aad = buf2b64url(Buffer.from(JSON.stringify(header)));
  if (!aMatch[2] || !cb) {
    return generateJwe(aMatch, eMatch, aad, payload, key, cb);
  }
  let bits = Number(aMatch[2]);
  crypto.pbkdf2(key, salt, header.p2c, bits >> 4, `sha${bits}`, (err, key) => {
    if (err) return cb(err);
    generateJwe(aMatch, eMatch, aad, payload, key, cb);
  });
}


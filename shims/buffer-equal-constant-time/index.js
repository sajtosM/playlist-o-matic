'use strict';
var crypto = require('crypto');
var Buffer = require('buffer').Buffer;

module.exports = bufferEq;

function bufferEq(a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

bufferEq.install = function() {
  Buffer.prototype.equal = function equal(that) {
    return bufferEq(this, that);
  };
};

var origBufEqual = Buffer.prototype.equal;
bufferEq.restore = function() {
  Buffer.prototype.equal = origBufEqual;
};

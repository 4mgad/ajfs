"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.getFileExtension = getFileExtension;
exports.mkdirs = mkdirs;
exports.cp = cp;
exports.rm = rm;
exports.walk = walk;

var _fs = require("fs");

Object.keys(_fs).forEach(function (key) {
	if (key === "default" || key === "__esModule") return;
	Object.defineProperty(exports, key, {
		enumerable: true,
		get: function get() {
			return _fs[key];
		}
	});
});

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var noop = function noop() {};

var _copyFile = function _copyFile(src, dest) {
	var onFileCopy = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : noop;

	if (_fs2.default.existsSync(src)) {
		var rd = _fs2.default.createReadStream(src);
		rd.on("error", function (err) {
			onFileCopy(err);
		});
		var wr = _fs2.default.createWriteStream(dest);
		wr.on("error", function (err) {
			onFileCopy(err);
		});
		wr.on("close", function (err) {
			onFileCopy(err);
		});
		rd.pipe(wr);
	} else {
		onFileCopy(src + " does not exist");
	}
};

var _copyDir = function _copyDir(src, dest) {
	var onDirCopy = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : noop;
	var onFileCopy = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : noop;

	if (_fs2.default.existsSync(src)) {
		_fs2.default.mkdir(dest, function (err) {
			if (err) {
				onDirCopy(err);
			} else {
				var rsrc = _fs2.default.realpathSync(src);
				var rdest = _fs2.default.realpathSync(dest);
				if (rdest.substr(0, rsrc.length) === rsrc) {
					_deleteDir(rdest, function (err, deletedDir) {
						if (err) {
							onDirCopy(err);
						}
					});
					onDirCopy('Copying to a sub directory is not allowed');
				} else {
					_fs2.default.readdir(src, function (err, files) {
						if (err) {
							onDirCopy(err);
						} else {
							var count = files.length;
							var check = function check(decrement) {
								decrement && count--;
								if (count <= 0) {
									onDirCopy(null, src, dest);
								}
							};
							check();
							files.forEach(function (file) {
								var sf = src + "/" + file;
								var df = dest + "/" + file;
								if (_fs2.default.statSync(sf).isDirectory()) {
									// copy dir recuresively
									_copyDir(sf, df, function (err, sd, dd) {
										onDirCopy(err, sd, dd);
										if (!err && sf === sd && df === dd) {
											check(true);
										}
									}, onFileCopy);
								} else {
									_copyFile(sf, df, function (err) {
										if (err) {
											onFileCopy(err);
										} else {
											onFileCopy(null, sf, df);
											check(true);
										}
									});
								}
							});
						}
					});
				}
			}
		});
	} else {
		onDirCopy(src + " does not exist");
	}
};

var _deleteDir = function _deleteDir(dir) {
	var onDirDelete = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
	var onFileDelete = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : noop;

	if (_fs2.default.existsSync(dir)) {
		var files = _fs2.default.readdirSync(dir);
		var count = files.length;
		var check = function check(decrement) {
			decrement && count--;
			if (count <= 0) {
				_fs2.default.rmdir(dir, function (err) {
					if (err) {
						onDirDelete(err);
					} else {
						onDirDelete(null, dir);
					}
				});
			}
		};
		check();
		files.forEach(function (file) {
			var filePath = dir + "/" + file;
			if (_fs2.default.statSync(filePath).isDirectory()) {
				// delete dir recuresively
				_deleteDir(filePath, function (err, dPath) {
					onDirDelete(err, dPath);
					if (!err && dPath === filePath) {
						check(true);
					}
				}, onFileDelete);
			} else {
				// delete file
				_fs2.default.unlink(filePath, function (err) {
					if (err) {
						onFileDelete(err);
					} else {
						onFileDelete(null, filePath);
						check(true);
					}
				});
			}
		});
	} else {
		onDirDelete(dir + " does not exist");
	}
};

var _createDirs = function _createDirs(dir) {
	var onCreateDir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;

	var createDir = function createDir(dir) {
		if (!_fs2.default.existsSync(dir)) {
			_fs2.default.mkdirSync(dir);
			onCreateDir(null, dir);
		}
	};
	var dirArr = dir.split('/');
	var currDir = '';
	try {
		dirArr.forEach(function (dir, idx) {
			if (dir === '.') {
				currDir += dir + '/';
			} else if (dir === '..') {
				currDir += dir + '/';
			} else if (dir === '') {
				currDir += '/' + dir;
			} else {
				currDir += dir;
				if (idx < dirArr.length - 1) {
					currDir += '/';
				}
				createDir(currDir);
			}
		});
	} catch (err) {
		onCreateDir(err);
	}
};

var _traverseDir = function _traverseDir(dir) {
	var onDir = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : noop;
	var onFile = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : noop;

	if (_fs2.default.existsSync(dir)) {
		var files = _fs2.default.readdirSync(dir);
		var count = files.length;
		var check = function check(decrement) {
			decrement && count--;
			if (count <= 0) {
				onDir(null, dir);
			}
		};
		check();
		files.forEach(function (file) {
			var filePath = dir + "/" + file;
			if (_fs2.default.statSync(filePath).isDirectory()) {
				// traverse dir recuresively
				_traverseDir(filePath, function (err, dPath) {
					onDir(err, dPath);
					if (!err && dPath === filePath) {
						check(true);
					}
				}, onFile);
			} else {
				onFile(null, filePath);
				check(true);
			}
		});
	} else {
		onDir(dir + " does not exist");
	}
};

function getFileExtension(filePath) {
	var i = filePath.lastIndexOf('.');
	return i < 0 ? '' : filePath.substr(i + 1);
}

function mkdirs(_ref) {
	var path = _ref.path,
	    _ref$onDirCreate = _ref.onDirCreate,
	    onDirCreate = _ref$onDirCreate === undefined ? noop : _ref$onDirCreate,
	    _ref$onComplete = _ref.onComplete,
	    onComplete = _ref$onComplete === undefined ? noop : _ref$onComplete;

	if (_fs2.default.existsSync(path)) {
		onComplete(null, path);
	} else {
		_createDirs(path, function (err, createdDir) {
			if (err) {
				onComplete(err);
			} else {
				onDirCreate(null, createdDir);
				if (createdDir === path) {
					onComplete(null, createdDir);
				}
			}
		});
	}
}

function cp(_ref2) {
	var src = _ref2.src,
	    dest = _ref2.dest,
	    _ref2$onDirCopy = _ref2.onDirCopy,
	    onDirCopy = _ref2$onDirCopy === undefined ? noop : _ref2$onDirCopy,
	    _ref2$onFileCopy = _ref2.onFileCopy,
	    onFileCopy = _ref2$onFileCopy === undefined ? noop : _ref2$onFileCopy,
	    _ref2$onComplete = _ref2.onComplete,
	    onComplete = _ref2$onComplete === undefined ? noop : _ref2$onComplete;

	if (_fs2.default.existsSync(src)) {
		if (_fs2.default.lstatSync(src).isDirectory()) {
			_copyDir(src, dest, function (err, _src, _dest) {
				if (err) {
					onComplete(err);
				} else {
					onDirCopy(null, _src, _dest);
					if (dest === _dest) {
						onComplete(null, src, dest);
					}
				}
			}, onFileCopy);
		} else {
			_copyFile(src, dest, onComplete);
		}
	} else {
		onComplete(src + " does not exist");
	}
}

function rm(_ref3) {
	var dir = _ref3.dir,
	    _ref3$onDirDelete = _ref3.onDirDelete,
	    onDirDelete = _ref3$onDirDelete === undefined ? noop : _ref3$onDirDelete,
	    _ref3$onFileDelete = _ref3.onFileDelete,
	    onFileDelete = _ref3$onFileDelete === undefined ? noop : _ref3$onFileDelete,
	    _ref3$onComplete = _ref3.onComplete,
	    onComplete = _ref3$onComplete === undefined ? noop : _ref3$onComplete;

	_deleteDir(dir, function (err, deletedDir) {
		if (err) {
			onComplete(err);
		} else {
			onDirDelete(null, deletedDir);
			if (deletedDir === dir) {
				onComplete(null, deletedDir);
			}
		}
	}, onFileDelete);
}

function walk(_ref4) {
	var dir = _ref4.dir,
	    _ref4$onDir = _ref4.onDir,
	    onDir = _ref4$onDir === undefined ? noop : _ref4$onDir,
	    _ref4$onFile = _ref4.onFile,
	    onFile = _ref4$onFile === undefined ? noop : _ref4$onFile,
	    _ref4$onComplete = _ref4.onComplete,
	    onComplete = _ref4$onComplete === undefined ? noop : _ref4$onComplete;

	_traverseDir(dir, function (err, dirPath) {
		if (err) {
			onComplete(err);
		} else {
			onDir(null, dirPath);
			if (dirPath === dir) {
				onComplete(null, dirPath);
			}
		}
	}, onFile);
}

import fs from 'fs';

const noop = (() => {});

const _copyFile = (src, dest, onFileCopy = noop) => {
	if (fs.existsSync(src)) {
		let rd = fs.createReadStream(src);
		rd.on("error", (err) => {
			onFileCopy(err);
		});
		let wr = fs.createWriteStream(dest);
		wr.on("error", (err) => {
			onFileCopy(err);
		});
		wr.on("close", (err) => {
			onFileCopy(err);
		});
		rd.pipe(wr);
	} else {
		onFileCopy(src + " does not exist");
	}
};

const _copyDir = (src, dest, onDirCopy = noop, onFileCopy = noop) => {
	if (fs.existsSync(src)) {
		fs.mkdir(dest, (err) => {
			if (err) {
				onDirCopy(err);
			} else {
				let rsrc = fs.realpathSync(src);
				let rdest = fs.realpathSync(dest);
				if (rdest.substr(0, rsrc.length) === rsrc) {
					_deleteDir(rdest, (err, deletedDir) => {
						if (err) {
							onDirCopy(err);
						}
					});
					onDirCopy('Copying to a sub directory is not allowed');
				} else {
					fs.readdir(src, (err, files) => {
						if (err) {
							onDirCopy(err);
						} else {
							let count = files.length;
							let check = (decrement) => {
								decrement && count--;
								if (count <= 0) {
									onDirCopy(null, src, dest);
								}
							};
							check();
							files.forEach((file) => {
								let sf = src + "/" + file;
								let df = dest + "/" + file;
								if (fs.statSync(sf).isDirectory()) {// copy dir recuresively
									_copyDir(sf, df, (err, sd, dd) => {
										onDirCopy(err, sd, dd);
										if (!err && sf === sd && df === dd) {
											check(true);
										}
									}, onFileCopy);
								} else {
									_copyFile(sf, df, (err) => {
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

const _deleteDir = (dir, onDirDelete = noop, onFileDelete = noop) => {
	if (fs.existsSync(dir)) {
		let files = fs.readdirSync(dir);
		let count = files.length;
		let check = (decrement) => {
			decrement && count--;
			if (count <= 0) {
				fs.rmdir(dir, (err) => {
					if (err) {
						onDirDelete(err);
					} else {
						onDirDelete(null, dir);
					}
				});
			}
		};
		check();
		files.forEach((file) => {
				let filePath = dir + "/" + file;
				if (fs.statSync(filePath).isDirectory()) {// delete dir recuresively
					_deleteDir(filePath, (err, dPath) => {
						onDirDelete(err, dPath);
						if (!err && dPath === filePath) {
							check(true);
						}
					}, onFileDelete);
				} else { // delete file
					fs.unlink(filePath, (err) => {
						if (err) {
							onFileDelete(err);
						} else {
							onFileDelete(null, filePath);
							check(true);
						}
					});
				}
			}
		);
	} else {
		onDirDelete(dir + " does not exist");
	}
};

const _createDirs = (dir, onCreateDir = noop) => {
	let createDir = (dir) => {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
			onCreateDir(null, dir);
		}
	};
	let dirArr = dir.split('/');
	let currDir = '';
	try {
		dirArr.forEach((dir, idx) => {
			if (dir === '.') {
				currDir += dir + '/';
			} else if (dir === '..') {
				currDir += dir + '/';
			} else if (dir === '') {
				currDir += '/' + dir;
			} else {
				currDir += dir;
				if (idx < (dirArr.length - 1)) {
					currDir += '/';
				}
				createDir(currDir);
			}
		});
	} catch (err) {
		onCreateDir(err);
	}
};

const _traverseDir = (dir, onDir = noop, onFile = noop) => {
	if (fs.existsSync(dir)) {
		let files = fs.readdirSync(dir);
		let count = files.length;
		let check = (decrement) => {
			decrement && count--;
			if (count <= 0) {
				onDir(null, dir);
			}
		};
		check();
		files.forEach((file) => {
				let filePath = dir + "/" + file;
				if (fs.statSync(filePath).isDirectory()) {// traverse dir recuresively
					_traverseDir(filePath, (err, dPath) => {
						onDir(err, dPath);
						if (!err && dPath === filePath) {
							check(true);
						}
					}, onFile);
				} else {
					onFile(null, filePath);
					check(true);
				}
			}
		);
	} else {
		onDir(dir + " does not exist");
	}
};

export function getFileExtension(filePath) {
	let i = filePath.lastIndexOf('.');
	return (i < 0) ? '' : filePath.substr(i + 1);
}

export function mkdirs({path, onDirCreate = noop, onComplete = noop}) {
	if (fs.existsSync(path)) {
		onComplete(null, path);
	} else {
		_createDirs(path, (err, createdDir) => {
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

export function cp({src, dest, onDirCopy = noop, onFileCopy = noop, onComplete = noop}) {
	if (fs.existsSync(src)) {
		if (fs.lstatSync(src).isDirectory()) {
			_copyDir(src, dest, (err, _src, _dest) => {
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

export function rm({dir, onDirDelete = noop, onFileDelete = noop, onComplete = noop}) {
	_deleteDir(dir, (err, deletedDir) => {
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

export function walk({dir, onDir = noop, onFile = noop, onComplete = noop}) {
	_traverseDir(dir, (err, dirPath) => {
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

export * from 'fs';

const assert = require('assert');
const ajfs = require("..");

const currPath = __dirname + "/";

describe('ajfs', function () {

	describe('#mkdirs({path, onComplete, onDirCreate})', function () {
		it('should create directories recursively', function (done) {
			let numOfCreatedDirs = 0;
			ajfs.mkdirs({
				path: 'test1/./test2/../test2/../../test1/test2/test3/test4',
				onDirCreate: function (err, createdDir) {
					!err ? numOfCreatedDirs++ : done(err);
				},
				onComplete: function (err, dirPath) {
					if (!ajfs.existsSync('test1/test2/test3/test4')) {
						done('test1/test2/test3/test4 does not exist');
					} else if (numOfCreatedDirs !== 4) {
						done("number of created directories: Expected 4, Actual " + numOfCreatedDirs);
					} else {
						done();
					}
				}
			});
		});
	});

	describe('#cp({src, dest, onComplete, onDirCopy, onFileCopy})', function () {
		it('should copy css/styles.css to css/_styles.css and check if it exists', function (done) {
			if (ajfs.existsSync(currPath + 'css/_styles.css')) {
				ajfs.unlinkSync(currPath + 'css/_styles.css');
			}
			ajfs.cp({
				src: currPath + 'css/styles.css',
				dest: currPath + 'css/_styles.css',
				onComplete: function (err) {
					if (err) {
						done(err);
					} else {
						if (ajfs.existsSync(currPath + 'css/_styles.css')) {
							done();
						} else {
							done(currPath + 'css/_styles.css does not exist');
						}
					}
				}
			});
		});
	});

	describe('#cp({src, dest, onComplete, onDirCopy, onFileCopy})', function () {
		it('should copy directory from ' + currPath + 'js to ' + currPath + '_js and count number of copied directories and files', function (done) {
			let numOfCopiedDirs = 0;
			let numOfCopiedFiles = 0;
			ajfs.cp({
				src: currPath + 'js',
				dest: currPath + '_js',
				onDirCopy: function (err, sd, dd) {
					!err ? numOfCopiedDirs++ : done(err);
				},
				onFileCopy: function (err, sf, df) {
					!err ? numOfCopiedFiles++ : done(err);
				},
				onComplete: function (err, sd, dd) {
					if (err) {
						done(err);
					} else {
						if (!ajfs.existsSync(currPath + '_js')) {
							done(currPath + '_js does not exist');
						} else if (numOfCopiedDirs !== 3) {
							done("number of copied directories: Expected 3, Actual " + numOfCopiedDirs);
						} else if (numOfCopiedFiles !== 11) {
							done("number of copied files: Expected 11, Actual " + numOfCopiedFiles);
						} else {
							done();
						}
					}
				}
			});
		});
	});

	describe('#cp({src, dest, onComplete, onDirCopy, onFileCopy})', function () {
		it('should throw an error due to absence of src directory', function (done) {
			ajfs.cp({
				src: 'nosrcdir',
				dest: 'nodestdir',
				onComplete: function (err, dirPath) {
					!err ? done('no error was thrown') : done();
				}
			});
		});
	});

	describe('#cp({src, dest, onComplete, onDirCopy, onFileCopy})', function () {
		it('should throw an error because a directory can not be copied to one of its subdirectories', function (done) {
			ajfs.cp({
				src: currPath + 'js',
				dest: currPath + 'js/test',
				onComplete: function (err, dirPath) {
					!err ? done('no error was thrown') : done();
				}
			});
		});
	});

	describe('#rm({dir, onComplete, onDirDelete, onFileDelete})', function () {
		it('should delete ' + currPath + '_js directory and its subdirectories and count number of deleted directories and files', function (done) {
			let numOfDeletedDirs = 0;
			let numOfDeletedFiles = 0;
			ajfs.rm({
				dir: currPath + '_js',
				onDirDelete: function (err, deletedDir) {
					!err ? numOfDeletedDirs++ : done(err);
				},
				onFileDelete: function (err, deletedFile) {
					!err ? numOfDeletedFiles++ : done(err);
				},
				onComplete: function (err, dirPath) {
					if (err) {
						done(err);
					} else {
						if (ajfs.existsSync(currPath + '_js')) {
							done(currPath + '_js still exists');
						} else if (numOfDeletedDirs !== 3) {
							done("number of deleted directories: Expected 3, Actual " + numOfDeletedDirs);
						} else if (numOfDeletedFiles !== 11) {
							done("number of deleted files: Expected 11, Actual " + numOfDeletedFiles);
						} else {
							done();
						}
					}
				}
			});
		});
	});

	describe('#rm({dir, onComplete, onDirDelete, onFileDelete})', function () {
		it('should delete test1 directory and its subdirectories and count number of deleted directories', function (done) {
			let numOfDeletedDirs = 0;
			ajfs.rm({
				dir: 'test1',
				onDirDelete: function (err, deletedDir) {
					!err ? numOfDeletedDirs++ : done(err);
				},
				onComplete: function (err, dirPath) {
					if (err) {
						done(err);
					} else {
						if (ajfs.existsSync('test1')) {
							done('test1 still exists');
						} else if (numOfDeletedDirs !== 4) {
							done("number of deleted directories: Expected 4, Actual " + numOfDeletedDirs);
						} else {
							done();
						}
					}
				}
			});
		});
	});

	describe('#rm({dir, onComplete, onDirDelete, onFileDelete})', function () {
		it('should throw an error due to absence of directory', function (done) {
			ajfs.rm({
				dir: 'nodir',
				onComplete: function (err, dirPath) {
					!err ? done('no error was thrown') : done();
				}
			});
		});
	});

	after(function () {
		ajfs.unlinkSync(currPath + 'css/_styles.css');
	});

});

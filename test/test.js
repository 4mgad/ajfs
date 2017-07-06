var assert = require('assert');
var ajfs = require("..");

var currPath = __dirname + "/";

describe('ExtendFS', function () {

	describe('#copyFile(src, dest, onCopy)', function () {
		it('css/_styles.css should exist', function (done) {
			ajfs.copyFile(currPath + 'css/styles.css', currPath + 'css/_styles.css', function (err) {
				if (err) {
					done(err);
				} else {
					if (ajfs.existsSync(currPath + 'css/_styles.css')) {
						ajfs.unlinkSync(currPath + 'css/_styles.css');
						done();
					} else {
						done(currPath + 'css/_styles.css does not exist');
					}
				}
			});
		});
	});

	describe('#copyDir(src, dest, onCopy, onCopyDir, onCopyFile)', function () {
		it('should copy directory from ' + currPath + 'js to ' + currPath + '_js', function (done) {
			var numOfCopiedDirs = 0;
			var numOfCopiedFiles = 0;
			ajfs.copyDir(currPath + 'js', currPath + '_js',
				function (err, sd, dd) {
					if (err) {
						done(err);
					} else {
						if (!ajfs.existsSync(currPath + '_js')) {
							done(currPath + '_js does not exist');
						} else if (numOfCopiedDirs !== 3) {
							done("number of copied directories is " + numOfCopiedDirs + ", it should be 3");
						} else if (numOfCopiedFiles !== 11) {
							done("number of copied files is " + numOfCopiedFiles + ", it should be 11");
						} else {
							done();
						}
					}
				}, function (err, sd, dd) {
					if (err) {
						done(err);
					} else {
						numOfCopiedDirs++;
					}
				}, function (err, sf, df) {
					if (err) {
						done(err);
					} else {
						numOfCopiedFiles++;
					}
				});
		});
	});

	describe('#copyDir(src, dest, onCopy, onCopyDir, onCopyFile)', function () {
		it('should throw an error', function (done) {
			ajfs.copyDir('nosrcdir', 'dest',
				function (err, dirPath) {
					if (err) {
						done();
					} else {
						done('no error was thrown');
					}
				});
		});
	});

	describe('#copyDir(src, dest, onCopy, onCopyDir, onCopyFile)', function () {
		it('should throw an error', function (done) {
			ajfs.copyDir(currPath + 'js', currPath + 'js/test',
				function (err, dirPath) {
					if (err) {
						done();
					} else {
						done('no error was thrown');
					}
				});
		});
	});

	describe('#deleteDir(dirPath, onDelete, onDeleteDir, onDeleteFile)', function () {
		it('should delete ' + currPath + '_js directory and its subdirectories',
			function (done) {
				var numOfDeletedDirs = 0;
				var numOfDeletedFiles = 0;
				ajfs.deleteDir(currPath + '_js', function (err, dirPath) {
					if (err) {
						done(err);
					} else {
						if (!ajfs.existsSync(currPath + '_js') && numOfDeletedFiles === 11 && numOfDeletedDirs === 3) {
							done();
						} else {
							done(currPath + '_js does not exist');
						}
					}
				}, function (err, deletedDir) {
					if (err) {
						done(err);
					} else {
						numOfDeletedDirs++;
					}
				}, function (err, deletedFile) {
					if (err) {
						done(err);
					} else {
						numOfDeletedFiles++;
					}
				});
			});
	});

	describe('#deleteDir(dirPath, onDelete, onDeleteDir, onDeleteFile)', function () {
		it('should throw an error', function (done) {
			ajfs.deleteDir('nodir',
				function (err, dirPath) {
					if (err) {
						done();
					} else {
						done('no error was thrown');
					}
				});
		});
	});

	describe('#createDirs(dirPath, onComplete, onCreateDir)', function () {
		it('should create directories recursively', function (done) {
			var success = true;

			var testArr = [
				'test1/test2/test3/test4',
				'test1/test2/test3/test4/',
				'./test1/test2/test3/test4',
				'../test1/test2/test3/test4',
				'../../test1/test2/test3/test4'
			];

			var idx = 0;
			var test = function (index) {
				var num = 0;
				var dirPath = testArr[index];
				ajfs.deleteDir(dirPath.substr(0, dirPath.indexOf('test2')),
					function (err1, deletedDir) {
						ajfs.createDirs(dirPath,
							function (err2, createdDir) {
								if (err2) {
									done(err2);
								} else {
									if (createdDir === dirPath && num === 4) {
										ajfs.deleteDir(dirPath.substr(0, dirPath.indexOf('test2')),
											function (err) {
												if (err) {
													done(err);
													success = false;
												}
												if (idx >= (testArr.length - 1)) {
													if (success) {
														done();
													} else {
														done('couldn\'t delete ' + dirPath);
													}
												} else {
													test(++idx);
												}
											});
									} else {
										success = false;
									}
								}
							},
							function (err, createdDir) {
								num++;
							});
					});
			};
			test(idx);
		});
	});

});

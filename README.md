ajfs
========
ajfs is a module that extends Node's default File System (fs) module to recursively copy/delete/traverse directories with callbacks to notify the caller upon each successful copy/delete/encounter of a file or directory and upon completion of the whole process.


Example:

```
var ajfs = require("ajfs");

ajfs.mkdirs({path, onCreateDir, onComplete}); //create directories and subdirectories

ajfs.cp({src, dest, onDirCopy, onFileCopy, onComplete}); //copy directory and subdirectories

ajfs.rm({dir, onDirDelete, onFileDelete, onComplete}); //remove directory and subdirectories

```

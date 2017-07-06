ajfs
========
ajfs is a module that extends Node's default File System (fs) module to recursively copy/delete/traverse directories with callbacks to notify the caller upon each successful copy/delete/encounter of a file or directory and upon completion of the whole process.


Example:

```
var ajfs = require("ajfs");

ajfs.cp({src, dest, onComplete});

ajfs.cp({src, dest, onComplete, onDirCopy, onFileCopy});

ajfs.rm({dir, onComplete, onDirDelete, onFileDelete});

ajfs.mkdir({dirPath, onComplete, onCreateDir});
```

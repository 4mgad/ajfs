ajfs
========
ajfs is a module that extends node's default 'fs' package to recursively copy/delete/traverse directories, subdirectories and files while triggering callbacks to notify the caller upon each successful copy/delete/walk of a file or directory and upon completion of the whole process. All callbacks are optional though.


Example:

```


var ajfs = require("ajfs");

ajfs.mkdirs({path, onDirCreate, onComplete}); //create directories and subdirectories

ajfs.cp({src, dest, onDirCopy, onFileCopy, onComplete}); //copy directory, subdirectories and files

ajfs.rm({dir, onDirDelete, onFileDelete, onComplete}); //remove directory, subdirectories and files

ajfs.walk({dir, onDir, onFile, onComplete}); //traverse directory, subdirectories and files



```

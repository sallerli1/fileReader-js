
/*
* Author: saller
* Date：2017-70-24
*
* this code is written under ECMS2017
*
* this is a fileReader which could
*    1: read multiple files in a time
*    2: divide a file into pieces to avoid laging and waste of memory
*    3: store progresses of each file being read and the whole progress
*    4: process every line of text being read
*/

class fileReader {
    constructor() {
        const READ_AS_TEXT = 1;
        const READ_AS_BINARY_STRING = 2;
        const READ_AS_ARRAY_BUFFER = 3;
        const READ_AS_DATA_URL = 4;
        this.reader = [];
        this.flag = [];
        this.sizeMap = [];
        this.fileCount = 0;
        this.loadedMap = [];
        this.loaded = 0;
        this.total = 0;
        this.progress = 0;
        this.allProgress = [];

        //this is an HTML5 progress element created 
        //to display the curent progress of all files being red
        this.progressBar = this.createProcessBar();
    }

    //default encoding is set to uft-8
    //file: file to read; 
    //callback: function to process read data;
    //step: size of every patch of the divided file;
    readAsText(file, callback, step, encoding = "utf-8") {
        this.allProgress[++this.fileCount] = [];
        this.flag[this.fileCount] = [];
        this.loadedMap[this.fileCount] = [];
        this.total += file.size;
        this.reader[this.fileCount] = new FileReader();
        this.sizeMap[this.fileCount] = file.size;

        this.initReader(this.READ_AS_TEXT, this.fileCount, step, file, callback)
        this.reader[this.fileCount].readAsText(step === 0 ? file : this.blobSlice(file, 0, step*1024), encoding);
    }

    //file: file to read; 
    //callback: function to process read data;
    //step: size of every patch of the divided file;
    readAsBinaryString(file, callback, step) {
        this.allProgress[++this.fileCount] = [];
        this.flag[this.fileCount] = [];
        this.loadedMap[this.fileCount] = [];
        this.total += file.size;
        this.reader[this.fileCount] = new FileReader();
        this.sizeMap[this.fileCount] = file.size;

        this.initReader(this.READ_AS_BINARY_STRING, this.fileCount, step, file, callback)
        this.reader[this.fileCount].readAsBinaryString(step === 0 ? file : this.blobSlice(file, 0, step*1024));
    }

    //file: file to read; 
    //callback: function to process read data;
    //step: size of every patch of the divided file;
    readAsArrayBuffer(file, callback, step) {
        this.allProgress[++this.fileCount] = [];
        this.flag[this.fileCount] = [];
        this.loadedMap[this.fileCount] = [];
        this.total += file.size;
        this.reader[this.fileCount] = new FileReader();
        this.sizeMap[this.fileCount] = file.size;

        this.initReader(this.READ_AS_ARRAY_BUFFER, this.fileCount, step, file, callback)
        this.reader[this.fileCount].readAsArrayBuffer(step === 0 ? file : this.blobSlice(file, 0, step*1024));
    }

    //file: file to read; 
    //callback: function to process read data
    readAsDataURL(file, callback) {
        var Reader = this;
        var reader = this.reader[++this.fileCount] = new FileReader();

        reader.onload = function (event) {
            callback(event.target.result);
            delete Reader.reader[Reader.fileCount];
            Reader.fileCount--;
        }

        reader.readAsDataURL(file);
    }

    //initiate a reader
    //type: reading method;
    //index: the index of the current reader;
    //step: size of every patch of the divided file;
    //file: file to read;
    //callback: function to process read data;
    initReader(type, index, step, file, callback) {
        var start = 0,
            Reader = this, 

            resolveProcess = function (event) {
                Reader.loadedMap[index] = step * start * 1024 + event.loaded;
                Reader.loaded = 0;
                Reader.loadedMap.forEach(function (loaded) {
                    Reader.loaded += loaded;
                }, this);
                Reader.allProgress[index] = (Reader.loadedMap[index] / Reader.sizeMap[index] * 100).toFixed(2);
                Reader.progress = Reader.progressBar.value = (Reader.loaded / Reader.total * 100).toFixed(2);
                console.log("total: "+Reader.total);
                console.log("loaded: "+Reader.loaded);
                console.log(index+": "+Reader.allProgress[index]+"%");
                console.log("\n");
            }, 

            readBlob = function (type, index, step, file) {
                var blob = Reader.blobSlice(file, start * step * 1024, (start + 1) * step * 1024);
                if (type === Reader.READ_AS_TEXT) {
                    Reader.reader[index].readAsText(blob);
                }
                else if (type === Reader.READ_AS_BINARY_STRING) {
                    Reader.reader[index].readAsBinaryString(blob);
                }
                else if (type === Reader.READ_AS_ARRAY_BUFFER) {
                    Reader.reader[index].readAsArrayBuffer(blob);
                }
            };

        Reader.reader[index].onload = function(event) {

            //process every line of the read content if it's text
            if (type === this.READ_AS_TEXT) {
                var view = event.target.result,
                    charCount = 0;
                for (var i = 0; i < view.length; ++i) {
                    if (view[i] === '\n' || view[i] === '\r' || i === view.length - 1) {
                        callback(view.slice(charCount, i));
                        charCount = i;
                    }
                }
            } else {
                callback(event.target.result);
            }

            resolveProcess(event);
            if (step === 0) {
                return;
            }

            if (Reader.loadedMap[index] < Reader.sizeMap[index]) {
                start++
            } else {
                delete Reader.reader[index];
                Reader.fileCount--;
                return;
            }

            readBlob(type, index, step, file);
        };

        Reader.reader[index].onprogress = function(event) {
            resolveProcess(event);
        };
    }

    //read a file
    //type: reading method;
    //file: file to read;
    //callback: function to process the read data;
    //step: size of every patch of the divided file;
    read(type, file, callback, step) {

        this.allProgress[++this.fileCount] = [];
        this.flag[this.fileCount] = [];
        this.loadedMap[this.fileCount] = [];
        this.total += file.size;
        this.reader[this.fileCount] = new FileReader();
        this.sizeMap[this.fileCount] = file.size;

        if (type === this.READ_AS_TEXT) {
            this.initReader(this.READ_AS_TEXT, this.fileCount, step, file, callback)
            this.reader[this.fileCount].readAsText(step === 0 ? file : Reader.blobSlice(file, 0, step * 1024));
        } else if (type === this.READ_AS_BINARY_STRING) {
            this.initReader(this.READ_AS_BINARY_STRING, this.fileCount, step, file, callback)
            this.reader[this.fileCount].readAsBinaryString(step === 0 ? file : Reader.blobSlice(file, 0, step * 1024));
        } else if (type === this.READ_AS_ARRAY_BUFFER) {
            this.initReader(this.READ_AS_ARRAY_BUFFER, this.fileCount, step, file, callback)
            this.reader[this.fileCount].readAsArrayBuffer(step === 0 ? file : Reader.blobSlice(file, 0, step * 1024));
        } else if (type === this.READ_AS_DATA_URL) {

            var Reader = this;
            Reader.reader[Reader.fileCount].onload = function (event) {
                callback(event.target.result);
                delete Reader.reader[Reader.fileCount];
                Reader.fileCount--;
            }
    
            Reader.reader[Reader.fileCount].readAsDataURL(file);
        }
    }

    //taking differences among browsers into consideration while slicing a blob
    blobSlice(blob, start, length) {
        if(blob.slice) {
            return blob.slice(start, length);
        } else if (blob.webkitSlice) {
            return blob.webkitSlice(start, length);
        } else if (blob.mozSlice) {
            return blob.mozSlice(start, length);
        } else {
            return null;
        }
    }

    createProcessBar() {
        var bar = document.createElement("progress");
        bar.max = 100;
        return bar;
    }

    getProgress() {
        return this.progress;
    }

    getOneProgress(index) {
        return this.allProgress[index];
    }

    getProgressBar() {
        return this.progressBar;
    }
}


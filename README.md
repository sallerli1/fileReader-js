# fileReader-js
a fileReader to read files in a browser coded in javascript

two kinds of codes are provided, one is for engines that do not sopport ECMASCRIPT2015

### constructor

``
    var fr = new fileReader();
``

## member functions 

#### void readAsText(Blob file, function callback, int step, string encoding = "utf-8")
this function takes 4 paramaters  

    file: file to read(a blob object);  
callback: function to process read data;  
step: size of every patch of the divided file;

#### void readAsBinaryString(Blob file, function callback, int step)
this function takes 3 paramaters  

    file: file to read(a blob object);  
    callback: function to process read data;  
    step: size of every patch of the divided file;  

#### void readAsArrayBuffer(Blob file, function callback, int step)
this function takes 3 paramaters  

    file: file to read(a blob object);  
    callback: function to process read data;  
    step: size of every patch of the divided file;  
    
#### void readAsDataURL(Blob file, function callback) 
this function takes 2 paramaters  

    file: file to read;  
    callback: function to process read url  
    
#### void read(int type, Blob file, function callback, int step)
this function takes 4 paramaters

    read a file
    type: reading method;
    file: file to read;
    callback: function to process the read data;
    step: size of every patch of the divided file;
    
#### float getProgress()
this function returns the progress of all file reading

#### float getOneProgress(int index)
this function returns the progress of one file being read

#### HTMLElement getProgressBar()
this function returns a html5 progress element to display the progress of all files being read


## Exemple
```

<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
        <link rel="stylesheet" href="button.css" />
        <script type="text/javascript" src="fileReader_oldstyle.js" ></script>
    </head>
    <body>
        <form>
            <input id="file" type="file" name="file_upload" multiple style="visibility:hidden" />
        </form>
        <a id="trigger" class="button">trigger</a>
        <p id="text"></p>
    </body>
    <script>
        var fileUpload = document.getElementById("file");
        var trigger = document.getElementById("trigger");

        fileUpload.onchange = function() {
        
            var file = this.files,
                len = file.length,
                reader = new fileReader();
                
            for (var i=0; i<len; i++) {
                document.body.insertBefore(reader.getProgressBar(),document.getElementById("text"));
                var secquence = Promise.resolve();
                secquence.then(
                reader.readAsText(file[i],function(buffer) {
                    document.getElementById("text").innerHTML+=(buffer+"<br/>");
                },10));
            }
        }

        trigger.onclick = function() {
            fileUpload.click();
        }
    </script>
</html>

```

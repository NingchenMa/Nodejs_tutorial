/**
 * Library for stroing and editing data
 */

//Dependencies
var fs = require('fs');
var path = require('path');

//Conatiner for the module (to be exported)
var lib = {};

//Base directory of the data folder
lib.baseDir = path.join(__dirname, '/../.data/'); // __dirname is the curDir name where we live right now

// 1. Write the data to a file
 lib.create = function(dir,file,data,callback) {

    //Try to open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','wx',function(err,fileDescriptor){

        if(!err && fileDescriptor){
            //Convert data to string
            var stringData = JSON.stringify(data);
            //Write to file and close it
            fs.writeFile( fileDescriptor , stringData,function(err){
                if(!err){
                    fs.close(fileDescriptor,function(err){
                        if(!err){
                            callback(false); // fasle -> no error occured
                        }else{
                            callback('Error closing new file');
                        }
                    });
                }else{
                    callback('Error writing to new file');
                }
            } );
        }else{
            callback('Could not create new file, it may already exist!');
        }

    });
 };

 // 2. Read data from a file
 lib.read = function(dir,file,callback){

    fs.readFile(lib.baseDir+dir+'/'+file+'.json','utf8',function(err,data){
        callback(err,data);
    })

 };

 /**
  * Difference between wx and r+ is that wx will flag error if the file already existed, 
  * whereas r+ will flag error if the file has not existed yet.
  */

 // 3. Update data inside an existing file
 lib.update = function(dir,file,data,callback){
    //Open the file for writing
    fs.open(lib.baseDir+dir+'/'+file+'.json','r+',function(err,fileDescriptor){

        if(!err && fileDescriptor){

            //Convert data to string
            var stringData = JSON.stringify(data);
            //Truncate the file first
            fs.truncate(fileDescriptor,function(err){
                if(!err){
                    //Write to the file and close it
                    fs.writeFile(fileDescriptor,stringData,function(err){
                        if(!err){
                            fs.close(fileDescriptor,function(err){
                                if(!err){
                                    callback(false);
                                }else{
                                    callback('Error when closing the file.');
                                }
                            })
                        }else{
                            callback('Error writing to existing file.');
                        }
                    });
                }else{
                    callback('Error when truncating file.');
                }
            })

        }else{
            callback('Could not open the file for updating, it may not exist yet.');
        }
    })
 }

// 4. Delete a file
lib.delete = function(dir,file,callback){
    //Unlink the file from filesystem
    fs.unlink(lib.baseDir+dir+'/'+file+'.json',function(err){
        if(!err){
            callback(false);
        }else{
            callback('Trouble deleting file.');
        }
    })
}

// ------------- Export the module ----------------
module.exports = lib;

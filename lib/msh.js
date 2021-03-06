var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var geo = require('./geo.js');
var fs = require('fs');

function makePipeForce(name, next) {
  var cb = function(err, stdout, stderr) {
    if (err) {
      console.error(err);
      return;
    } else {
      exec('mkfifo ' + name, next);
    }
  };
  fs.exists(name, function(exists) {
    if (exists) {
      fs.unlink(name, function(err) {
        if(err) {
          console.error(err);
          return;
        }
        cb();
      });
    } else {
      cb();
    }
  });
}

function mesh(obj, opt, cb) {
  var options = Array.isArray(opt) ? opt : parseOptions(opt);
  var inFifo = __dirname + '/../tmp/gmsh.in.geo';
  var outFifo = __dirname + '/../tmp/gmsh.out.msh';
  var geoStr = typeof obj === 'string' ? obj : geo.parseObject(obj);

  makePipeForce(inFifo, function(err, stdout, stderr) {
    if (err) {
      console.error(err);
      return;
    } else {
      makePipeForce(outFifo, function(err, stdout, stderr) {
        if (err) {
          console.error(err);
          return;
        } else {
          runGmsh();
        }
      });
    }
  });

  var runGmsh = function() {
    var inStream = fs.createWriteStream(inFifo);
    var outStream  = fs.createReadStream(outFifo);
    
    outStream.on('data', cb);

    exec(
      ['gmsh']
        .concat(options)
        .concat([inFifo, '-o', outFifo])
        .join(' '),
      function(err, stdout, stderr){
        debugger;
        if (err) {
          console.error(err);
          return;
        } else {
          // debugger;
          // cb(mshOut, stdout, stderr);
        }
      }
    );

    inStream.write(geoStr);
    // inStream.end();
    inStream.end(geoStr);

    // expors.geoIn
    

  };
  

  // makePipeForce(outFifo, function(err, stdout, stderr){
  //     // debugger;
  //     if (err) {
  //         console.error(err);
  //         return;
  //     } else {
  //         var child = spawn('gmsh', options.concat([inFileName, '-o', outFileName]));
  //         // exports.child = child;
  //         var str = typeof obj === 'string' ? obj : geo.parseObject(obj);
  //         debugger;

  //         child.stdout.on('data', cb);
  
  
  //         child.on('exit', function(code) {
  //             if (code !== 0) {
  //                 console.log('gmsh process exited with code ' + code);
  //             }
  //             fs.unlinkSync(outFileName);
  //         });

  //         child.stdin.write(str);
  
  //         child.stdin.end();
  
  //     }
  // });

  
  

}

function parseOptions(opt) {
  var arr = [];

  // arr = ['-3','-format','msh'];
  
  return arr;
}


exports.mesh = mesh;
exports.makePipeForce = makePipeForce;
exports.parseOptions = parseOptions;


exports.in = function(source, format) {
  
  if (typeof source === 'string') {
    this.inStream = fs.createWriteStream(source);
  } else if (source instanceof fs.WriteStream) {
    this.inStream = source;
  }
  
  return this;
};

// exports.mesh = function(options, cb, stdout_cb, stderr_cb) {
  
// };

// exports.mesh = function(source, format) {
  
// };
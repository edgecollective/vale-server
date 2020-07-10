var express = require("express")
var app = express()
var db = require("./database.js")
var md5 = require("md5")
const sqliteToCsv = require("sqlite-to-csv");
const stringify = require('csv-stringify');
var moment = require("moment");

'use strict';

function downloadCsv(posts, req, res) {
  // adding appropriate headers, so browsers can start downloading
  // file as soon as this request starts to get served
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=\"' + 'download-' + Date.now() + '.csv\"');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Pragma', 'no-cache');

  // ta-da! this is cool, right?
  // stringify return a readable stream, that can be directly piped
  // to a writeable stream which is "res" (the response object from express.js)
  // since res is an abstraction over node http's response object which supports "streams"
  stringify(posts, { header: true })
    .pipe(res);
};

var args = { filePath : "db.sqlite", outputPath : "./mycsv" };

const fs = require('fs');

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// https://www.npmjs.com/package/csv-export

var HTTP_PORT = 8100


// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});

app.get("/api/users", (req, res, next) => {
    
    var sql = "select * from user"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            //"message":"success",
            "data":rows
            //rows
        })
      });
});

app.use(express.static('plotting'))

app.get("/api/user/id", (req, res, next) => {
    console.log('id');
    var sql = "select * from user where id = ?"
    var params = [req.params.id]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
});



app.get("/api/user/latest", (req, res, next) => {
    //console.log('all')
    //var sql = "select * from user order by timestamp desc LIMIT 10"
    //var sql = "select * from user order by id asc LIMIT 100"


 var N = 1000;
    if (req.query.limit) {
            N = parseInt(req.query.limit);
    }

        console.log(req.query.limit);
    var sql = "select * from user order by id desc LIMIT "
    var sql = sql.concat(N.toString());


    var params = []
    db.all(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
}); 


function downloadCsv(req, res) {
  stringify(posts, { header: true })
    .pipe(res);
};


app.get("/api/csv", (req, res, next) => {
        console.log('csv');

         var N = 1000;
    if (req.query.limit) {
            N = parseInt(req.query.limit);
    }

    //var sql = "headers on mode csv output data.csv select * from user order by timestamp desc LIMIT 10"
    //sqliteToCsv.toCSV(args,
     //    (err) => {console.log(err); });

//var sql = "select * from user order by timestamp desc LIMIT 10"
    //var sql = "select * from user order by id desc LIMIT 1000"
    var sql = "select * from user order by id desc LIMIT "
    var sql = sql.concat(N.toString());
    var params = [];
    //var fields = ['dateTime','rssi'];
    //var fieldNames = ['Time','RSSI'];
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        //console.log(JSON.stringify(rows));
            posts=rows;
        downloadCsv(JSON.stringify(rows),res,req);
        });
});


app.post("/api/user/", (req, res, next) => {
    var errors=[]

	console.log(req.body);

        var deviceName = req.body.deviceName;
        var devEUI = req.body.devEUI;
        var rssi = req.body.rxInfo[0].rssi;

        console.log(deviceName,devEUI,rssi);


    var object = req.body.object;

    console.log(object)

   var temp = object.temperatureSensor[1]; // temp 
   var humid = object.humiditySensor[2]; // humid 
   var press = object.barometer[3]; // press

   var date = new Date();
            var ts = Math.round(( date ).getTime() / 1000);
            var timestamper = moment().format();

   var alt = 2.;
   
    var data = {
	    temp:temp,
	    humid:humid,
	    press:press,
	    deviceName:deviceName,
            devEUI:devEUI,
            rssi:rssi
    }

	console.log(data);

	var sql = 'INSERT INTO user (dateTime,timestamp,temp,humid,press,deviceName,devEUI,rssi) VALUES (?,?,?,?,?,?,?,?)'

	//var insert = 'INSERT INTO user (dateTime,vwc,temp,permit,bulk,pore,batt,deviceName,devEUI,rssi) VALUES (?,?,?,?,?,?,?)'

	//var sql = 'INSERT INTO user (dateTime,timestamper,vwc,temp,permit,bulk,pore,batt) VALUES (?,?,?,?,?,?,?)'
	
	var params =[ts,timestamper,data.temp,data.humid,data.press,data.deviceName,data.devEUI,data.rssi]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})



app.patch("/api/user/:id", (req, res, next) => {
    var data = {
        name: req.body.name,
        email: req.body.email,
        password : req.body.password ? md5(req.body.password) : undefined
    }
    db.run(
        `UPDATE user set 
           name = coalesce(?,name), 
           email = COALESCE(?,email), 
           password = coalesce(?,password) 
           WHERE id = ?`,
        [data.name, data.email, data.password, req.params.id],
        (err, result) => {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({
                message: "success",
                data: data
            })
    });
})


app.delete("/api/user/:id", (req, res, next) => {
    db.run(
        'DELETE FROM user WHERE id = ?',
        req.params.id,
        function (err, result) {
            if (err){
                res.status(400).json({"error": res.message})
                return;
            }
            res.json({"message":"deleted", rows: this.changes})
    });
})


// Root path
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});


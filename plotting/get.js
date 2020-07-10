function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
//      console.log(a);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  //var month = months[a.getMonth()];
  var month = a.getMonth()+1;
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
//var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  var time = year + '-' + month + '-' + date + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}



var urlParams = new URLSearchParams(window.location.search);

var limit = 3000;

var param_limit = urlParams.get('limit');

if (param_limit !== null) {
limit = parseInt(param_limit);
}


var base_url = 'http://64.227.0.108:8100/api/user/latest?limit='
var fetch_url = base_url.concat(limit.toString())



	 //fetch('http://localhost:8000/api/users/')
//fetch('http://64.227.0.108:8100/api/user/latest')
fetch(fetch_url)
  .then((response) => {
    return response.json();
  })
  .then((myJson) => {
    //console.log("hallo");
    //console.log(myJson);

var data = myJson.data;
var xvals = [];	  
var timestamp = [];
var temp = [];
var humid = [];
var press = [];
var deviceName = [];
var rssi = [];


// get the data
for (i in data) {
  //xvals.push(i);
  //xvals.push(data[i].id);
//  xvals.push(data[i].id);
  xvals.push(timeConverter(data[i].dateTime));
  timestamp.push(data[i].dateTime);
  temp.push(data[i].temp);
  humid.push(data[i].humid);
  press.push(data[i].press);
   rssi.push(data[i].rssi);
}

// flip b/c of way we got the data form sql:

xvals=xvals.reverse();
timestamp=timestamp.reverse();
temp=temp.reverse();
humid=humid.reverse();
press=press.reverse();
rssi=rssi.reverse();

//console.log(xvals);
//console.log(xvals.length);
// reference for plotly graphing: https://plot.ly/javascript/line-and-scatter/
// example for plotly graphing in a page: https://codepen.io/pen/?&editable=true
// reference for styles: https://plot.ly/javascript/line-and-scatter/

//console.log(xvals);
//console.log(temp);

var temp_points = [];
var humid_points = [];
var rssi_points = [];
for (var i=0; i<temp.length && i<xvals.length; i++) {

 temp_points[i]= {t:xvals[i],y:temp[i]};
 rssi_points[i]= {t:xvals[i],y:rssi[i]};
 humid_points[i] = {t:xvals[i],y:humid[i]};

// temp_points[i]= {t:new Date(xvals[i]),y:temp[i]};
}

console.log(temp_points);


var temp_trace = {
  //x: xvals.reverse(),
  x: xvals,  
 // x: timestamp,
  y: temp, 
  //mode: 'markers',
  mode: 'lines+markers',
  type: 'scatter',
	//connectgaps: true
  //marker: { size: 6, color: 'red'}
};

var rssi_trace = {
  //x: xvals.reverse(),
  x: xvals,
 // x: timestamp,
  y: rssi,
  //mode: 'markers',
  mode: 'lines+markers',
  type: 'scatter',
  //marker: { size: 6, color: 'red'}
};


var layout_temp = {
/*   xaxis: {
    range: [ 15, 25 ]
  },
  
  yaxis: {
    range: [15, 25]
  }, 
*/
  title:'Temperature',
  yaxis: {
	  fixedrange:true,
    title: {
      text: 'Temp (F)',
    },
	  range: [-40,130]
  },
  xaxis: {
	  fixedrange:true,
    title: {
      text: 'Time',
    }
  }
};

var layout_rssi = {
/*   xaxis: {
    range: [ 15, 25 ]
  },
  
  yaxis: {
    range: [15, 25]
  }, 
*/
  title:'Signal Strength',
  yaxis: {
	  fixedrange:true,
    title: {
      text: 'RSSI',
    },
          //range: [15,32]
  },
  xaxis: {
	  fixedrange:true,
    title: {
      text: 'Time',
    },
  }
};

//var temp_traces = [temp_trace];
//var rssi_traces = [rssi_trace];

//Plotly.newPlot('myDiv_b', temp_traces,layout_temp,{displayModeBar: false});
/*Plotly.newPlot('myDiv_a', vwc_traces,layout_vwc,{displayModeBar: false});
Plotly.newPlot('myDiv_c', rssi_traces,layout_rssi,{displayModeBar: false});
Plotly.newPlot('myDiv_d', batt_traces, layout_batt,{displayModeBar: false});
*/


var ctx_temp = document.getElementById('tempChart').getContext('2d');
var tempChart = new Chart(ctx_temp, {
  type: 'line',
  data: {
    labels: xvals,
    datasets: [{
	    borderColor: "#bae755",
   borderDash: [5, 5],
            pointRadius: 1,
   backgroundColor: "#e755ba",
   pointBackgroundColor: "#55bae7",
   pointBorderColor: "#55bae7",
   pointHoverBackgroundColor: "#55bae7",
   pointHoverBorderColor: "#55bae7",
      label: 'Temp (C)',
      data: temp_points,
      borderWidth: 1
    }]
  },
  options: {
	  responsive:false,
    scales: {
      xAxes: [{
        type: 'time',
	/*time: {
		unit: 'hour'
	}*/
      }]
    }
  }
});

var ctx_rssi = document.getElementById('rssiChart').getContext('2d');
var rssiChart = new Chart(ctx_rssi, {
  type: 'line',
  data: {
    labels: xvals,
    datasets: [{
            borderColor: "#bae755",
   borderDash: [5, 5],
            pointRadius: 1,
   backgroundColor: "#e755ba",
   pointBackgroundColor: "#55bae7",
   pointBorderColor: "#55bae7",
   pointHoverBackgroundColor: "#55bae7",
   pointHoverBorderColor: "#55bae7",
      label: 'RSSI (dB)',
      data: rssi_points,
      borderWidth: 1
    }]
  },
  options: {
          responsive:false,
    scales: {
      xAxes: [{
        type: 'time',
        /*time: {
                unit: 'hour'
        }*/
      }]
    }
  }
});


var ctx_humid = document.getElementById('humidChart').getContext('2d');
var humidChart = new Chart(ctx_humid, {
  type: 'line',
  data: {
    labels: xvals,
    datasets: [{
            borderColor: "#bae755",
   borderDash: [5, 5],
            pointRadius: 1,
   backgroundColor: "#e755ba",
   pointBackgroundColor: "#55bae7",
   pointBorderColor: "#55bae7",
   pointHoverBackgroundColor: "#55bae7",
   pointHoverBorderColor: "#55bae7",
      label: 'Humidity (%)',
      data: humid_points,
      borderWidth: 1
    }]
  },
  options: {
          responsive:false,
    scales: {
      xAxes: [{
        type: 'time',
        /*time: {
                unit: 'hour'
        }*/
      }]
    }
  }
});


  });




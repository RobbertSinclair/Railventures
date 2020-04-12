
let l;
let m;
let response_text;
let station_name;
let station_code;
let stations = [];
let station_codes = [];
let journey_time = [];
let time;
let train_uids = [];
let journey_times = [];
let shortest_time;
let suggested_stations = [];
let suggested_stations_code = [];
let stations_lat = [];
let stations_long = [];
let local_lat;
let local_long;
let suggested_lat = [];
let suggested_long = [];

getValues = function() {
    let correct = false;
    let p;
    var fname = document.getElementById("first_name");
    var lname = document.getElementById("last_name");
    var station = document.getElementById("local_station");
    var age = document.getElementById("Age");
    time = document.getElementById("Time");



    let len = validate_station(station.value);
    if (validate_values(fname, lname, age) == false) {
        alert("INVALID DATA");
    }
    else if(len == 0)
    {
        alert("Invalid station");
    }
    else {




            document.write("<!DOCTYPE html>");
            document.write('<link rel="stylesheet" href="https://unpkg.com/leaflet@1.0.3/dist/leaflet.css" />');
            document.write("<link rel=\"stylesheet\" id = 'style_2' href=\"suggestion_form.css\"/>");

            document.write("<h1 id ='suggested_label'>We found " + len + " results. Please select the station you meant from the list</h1>")


            document.write("<select id=station_choice>");

            for(i = 0; i < len; i++)
            {
                document.write("<option value =" + suggested_stations_code[i] +">"+ suggested_stations[i] + "</option>");
            }
            document.write("</select>");
            document.write("<br><br>");
            document.write("<button type = 'button' id = 'station_choice_submit' >Click to submit</button>");
            document.getElementById('station_choice_submit').addEventListener("click", function() {set_station(fname.value, lname.value, time.value);
            var suggested_label = document.getElementById('suggested_label');
            var suggested_choice = document.getElementById('station_choice');
            var button = document.getElementById('station_choice_submit');
            var style_2 = document.getElementById('style_2');
            suggested_label.parentNode.removeChild(suggested_label);
            suggested_choice.parentNode.removeChild(suggested_choice);
            button.parentNode.removeChild(button);
            style_2.setAttribute("href", "output.css");
            }, true);




    }

}

set_station= function(fname, lname, max_time)
{
    document.write("<h2>Loading</h2>");
    let station_suggestion = document.getElementById("station_choice").value;
    for(i = 0; i < suggested_stations.length; i++)
    {
        if(suggested_stations_code[i] == station_suggestion)
        {
            station_name = suggested_stations[i];
            station_code = suggested_stations_code[i];
            local_lat = suggested_lat[i];
            local_long = suggested_long[i];
        }

    }

    get_request(station_suggestion, fname, lname, max_time);
}


validate_values = function(first, last, i){
    if(first.value == "" || first.value.length > 30)
    {
        return false;
    }
    else if (last.value == "" || last.value.length > 30) {
        return false;
    }
    else if (i.value == "default")
    {
        return false;
    }
    else
    {
        return true;
    }
}

validate_station = function(station) {
    let count = 0;
    let ourRequest = new XMLHttpRequest();
    ourRequest.open("GET", 'https://transportapi.com/v3/uk/places.json?query='+ station +'&type=train_station&app_id='+API_KEY, false);
    ourRequest.onload = function() {
        var data_1 = JSON.parse(ourRequest.responseText);
        console.log(data_1);
        l = data_1.member.length;
        for(i = 0; i < l; i++)
        {
            suggested_stations.push(data_1.member[i].name);
            suggested_stations_code.push(data_1.member[i].station_code);
            suggested_lat.push(data_1.member[i].latitude);
            suggested_long.push(data_1.member[i].longitude);
        }



    }
    ourRequest.send();

    return l;
    
}


get_request = function(station, fname, lname, max_time) {
    let station_box = document.getElementById("station_box");
    let flag = false;
    var start_time;
    var end_time;
    console.log(station);
    console.log("Yes");


    document.write("<h1>" + fname + " " + lname + ", here are the stations that you can get to from " + station_name + " in the next two hours</h1>");
    document.write('<div class = "map" id = "map"></div>');



    let second_request = new XMLHttpRequest();
    second_request.open("GET", "https://transportapi.com/v3/uk/train/station/" + station + "///timetable.json?app_id="+API_KEY+"&train_status=passenger", false);
    second_request.onload = function () {
        var data_2 = JSON.parse(second_request.responseText);
        var i;
        let k;

        let request_3 = new XMLHttpRequest();
        data_2.departures.all.forEach(function (listItem) {


            request_3.open("GET", "https://transportapi.com/v3/uk/train/service/train_uid:" + listItem.train_uid + "///timetable.json?app_id=8a247cdd&app_key=9e9645bc611d43785491c64665bbe300&darwin=false&live=false", false);
            request_3.onload = function () {
                var data_3 = JSON.parse(request_3.responseText);
                var j;
                var station_index = 0
                var htmlString;
                console.log(data_3.stops.length);
                console.log(data_3);
                for (j = 0; j < data_3.stops.length; j++) {
                    if (data_3.stops[j].station_name == data_2.station_name) {
                        station_index = j;
                        start_time = data_3.stops[j].aimed_departure_date + ":" + data_3.stops[j].aimed_departure_time;
                        console.log(start_time);
                        break;
                    }

                }

                for (j = station_index + 1; j < data_3.stops.length; j++) {
                    flag = false;
                    end_time = data_3.stops[j].aimed_arrival_date + ":" + data_3.stops[j].aimed_arrival_time;
                    if (calculate_time(start_time, end_time) > max_time || data_3.stops[j].aimed_arrival_time == null && data_3.stops[j].station_code.length == 3) {
                        flag = true;
                    }
                    else {
                        for (k = 0; k < stations.length; k++) {
                            if (stations[k] == data_3.stops[j].station_name) {
                                flag = true;
                                break;
                            }
                        }
                    }
                    if (flag == false) {
                        stations.push(data_3.stops[j].station_name);
                        station_codes.push(data_3.stops[j].station_code);
                        journey_time.push(calculate_time(start_time, end_time));
                    }


                }


            }
            request_3.send();
            //console.log("Platform " + data_2.departures.all[i].platform + " for the " + data_2.departures.all[i].aimed_departure_time + " " + data_2.departures.all[i].operator_name + " service to " + data_2.departures.all[i].destination_name);

        });

    }
    second_request.send();


    if (stations.length == 0) {
        console.log("There are no stations");
        document.write("<h2>" + "We are sorry but there are no scheduled departures in the next 2 hours, please check again later." + "</h2>");
        create_map();

    }
    else {


        let hours = 0;
        let minutes = 0;
        for (m = 0; m < stations.length; m++) {
            hours = 0;
            if (journey_time[m] < 60) {
                var htmlString = "<h2>" + stations[m] + " Journey time:  " + journey_time[m] + " minutes </h2>";
            }
            else {
                hours = parseInt(journey_time[m] / 60);
                minutes = journey_time[m] - (hours * 60);
                var htmlString = "<h2>" + stations[m] + " Journey time: " + hours + " hrs and " + minutes + "mins</h2>";
            }

            document.write(htmlString);
        }
        document.write("<form>");
        document.write('<select id = "stations">');
        for (m = 0; m < stations.length; m++) {
            document.write('<option value = ' + station_codes[m] + '>' + stations[m] + '</option>');
        }
        document.write("</select>");
        document.write("</form>");
        document.write('<input type="submit" id="destination_finder" onclick = get_services(station_code)>');
        create_map();
    }
}






calculate_time = function(start_time, end_time)
{
    var start = Math.round((new Date(start_time).getTime())/60000);
    var end = Math.round((new Date(end_time).getTime())/60000);
    var time_to_travel = end-start;

    return time_to_travel;


}

get_services = function(local_station) {
    var destination = document.getElementById("stations").value;
    train_uids = [];
    journey_times = [];
    var m;
    var destination_name;
    var start_index;
    let start_time;
    if(local_station == "SPX")
    {
        local_station = "STP";
    }
    let end_time;
    for (m = 0; m < station_codes.length; m++) {
        if (station_codes[m] == destination) {
            destination_name = stations[m];
            break;
        }

    }

    console.log(destination);
    var request_4 = new XMLHttpRequest();
    request_4.open("GET", "https://transportapi.com/v3/uk/train/station/" + local_station +
        "///timetable.json?app_id=8a247cdd&app_key=9e9645bc611d43785491c64665bbe300&calling_at="
        + destination + "&train_status=passenger", false);
    request_4.onload = function () {
        var data_4 = JSON.parse(request_4.responseText);

        console.log(data_4);
        document.write("<h1>Here are all the services to " + destination_name + " from " + station_name + "</h1>");
        if(destination_name == "Bruxelles Midi")
        {
            document.write("<h1>De volgende vetrekken vanuit " + station_name + " naar Brussel Zuid</h1>");
            document.write("<h1>Le prochaine d&eacute;parts depuis " + station_name + " &agrave; Bruxelles Midi");

        }
        else if(destination_name == "Amsterdam Cs")
        {
            document.write("<h1>De volgende vetrekken vanuit " + station_name + " naar Amsterdam Centraal</h1>");

        }
        else if(destination_name == "Paris Nord" || destination_name == "Marne La Vallee")
        {
            document.write("<h1>Le prochaine d&eacute;parts depuis " + station_name + " &agrave; " + destination_name);


        }

        for (m = 0; m < data_4.departures.all.length; m++) {
            if((data_4.departures.all[m].operator == "SE" || data_4.departures.all[m].operator == "ES") && local_station == "STP")
            {
                local_station = "SPX";
            }

            var request_5 = new XMLHttpRequest();
            request_5.open("GET", "https://transportapi.com/v3/uk/train/service/train_uid:" + data_4.departures.all[m].train_uid
                + "///timetable.json?app_id=8a247cdd&app_key=9e9645bc611d43785491c64665bbe300&darwin=false&live=false", false);
            request_5.onload = function () {
                var data_5 = JSON.parse(request_5.responseText);
                console.log(data_5);
                var destination_index;
                var a;
                console.log(station_name);
                for(a = 0; a < data_5.stops.length; a++)
                {
                    if(data_5.stops[a].station_code == local_station)
                    {
                        start_index = a;
                        start_time = data_5.stops[a].aimed_departure_date + ":" + data_5.stops[a].aimed_departure_time;
                        break;
                    }
                }
                console.log(start_index);
                console.log(start_time);
                //let start_time = data_5.stops[start_index].aimed_departure_date + ":" + data_5.stops[start_index].aimed_departure_time;
                for (a = 0; a < data_5.stops.length; a++) {
                    if (data_5.stops[a].station_code == destination) {
                        destination_index = a;
                        break;
                    }
                }
                let end_time = data_5.stops[destination_index].aimed_arrival_date + ":" + data_5.stops[destination_index].aimed_arrival_time;
                console.log(end_time);
                if (calculate_time(start_time, end_time) <= time.value) {
                    train_uids.push(data_5.train_uid);
                    journey_times.push(calculate_time(start_time, end_time));
                }


            }
            request_5.send();




    }
    shortest_time = journey_times[0];
    for(m = 0; m < journey_times.length; m++)
    {
        if(journey_times[m] < shortest_time)
        {
            shortest_time = journey_times[m];
        }
    }
    for(m = 0; m < data_4.departures.all.length; m++)
    {
        console.log("Loop");
        var a;

        for(a = 0; a < train_uids.length; a++)
        {
            if(data_4.departures.all[m].train_uid == train_uids[a])
            {
                if (data_4.departures.all[m].platform == null) {
                    console.log("Another Loop");
                    if(journey_times[m] == shortest_time)
                    {
                        var htmlstring = '<h2>The ' + data_4.departures.all[m].aimed_departure_time +
                            ' ' + data_4.departures.all[m].operator_name + ' service to '
                            + data_4.departures.all[m].destination_name + '</h2>';
                    }
                    else
                    {
                        var htmlstring = '<h2>The ' + data_4.departures.all[m].aimed_departure_time +
                            ' ' + data_4.departures.all[m].operator_name + ' service to '
                            + data_4.departures.all[m].destination_name + ' SHORTEST TIME</h2>';
                    }


                }
                else {
                    console.log("Another Loop");
                    if(journey_times[m] != shortest_time)
                    {

                        var htmlstring = '<h2>The ' + data_4.departures.all[m].aimed_departure_time + ' '
                            + data_4.departures.all[m].operator_name
                            + ' service to ' + data_4.departures.all[m].destination_name
                            + ' departing from Platform ' + data_4.departures.all[m].platform + '</h2>';
                    }
                    else
                    {
                        var htmlstring = '<h2>The ' + data_4.departures.all[m].aimed_departure_time + ' '
                            + data_4.departures.all[m].operator_name
                            + ' service to ' + data_4.departures.all[m].destination_name
                            + ' departing from Platform ' + data_4.departures.all[m].platform + ' SHORTEST TIME</h2>';
                    }

                }

                document.write(htmlstring);

            }
        }

    }


    }
    request_4.send();
}

create_map = function()
{

    console.log(stations);
    var request_7 = new XMLHttpRequest;
    if(stations.length < 30)
    {
        for(i = 0; i < stations.length; i++)
        {

            if(stations[i] == "Brighton")
            {
                request_7.open("GET", 'https://transportapi.com/v3/uk/places.json?query=BTN&type=train_station&app_id=8a247cdd&app_key=9e9645bc611d43785491c64665bbe300', false);
                request_7.onload = function()
                {
                    var data_7 = JSON.parse(request_7.responseText);
                    if(data_7.member.length > 0)
                    {

                        console.log(data_7);

                        stations_lat.push(data_7.member[0].latitude);
                        stations_long.push(data_7.member[0].longitude);
                    }

                }
                request_7.send();
            }
            else {
                request_7.open("GET", 'https://transportapi.com/v3/uk/places.json?query=' + stations[i] + '&type=train_station&app_id=8a247cdd&app_key=9e9645bc611d43785491c64665bbe300', false);
                request_7.onload = function () {
                    var data_7 = JSON.parse(request_7.responseText);
                    if (data_7.member.length > 0) {

                        console.log(data_7);
                        stations_lat.push(data_7.member[0].latitude);
                        stations_long.push(data_7.member[0].longitude);
                    }
                    else
                    {
                        stations_lat.push(0);
                        stations_long.push(0);
                    }


                }
                request_7.send();
            }

        }
    }
    else
    {
        for(i = 0; i < 30; i++)
        {
            if(stations[i] == "Brighton")
            {
                request_7.open("GET", 'https://transportapi.com/v3/uk/places.json?query=BTN&type=train_station&app_id=8a247cdd&app_key=9e9645bc611d43785491c64665bbe300', false);
                request_7.onload = function()
                {
                    var data_7 = JSON.parse(request_7.responseText);
                    if(data_7.member.length > 0)
                    {

                        console.log(data_7);

                        stations_lat.push(data_7.member[0].latitude);
                        stations_long.push(data_7.member[0].longitude);
                    }

                }
                request_7.send();
            }
            else
            {
                request_7.open("GET", 'https://transportapi.com/v3/uk/places.json?query='+ stations[i] +'&type=train_station&app_id=8a247cdd&app_key=9e9645bc611d43785491c64665bbe300', false);
                request_7.onload = function()
                {
                    var data_7 = JSON.parse(request_7.responseText);
                    if(data_7.member.length > 0)
                    {

                        console.log(data_7);
                        console.log(data_7.member[0].latitude);
                        console.log(data_7.member[0].longitude);

                        stations_lat.push(data_7.member[0].latitude);
                        stations_long.push(data_7.member[0].longitude);
                    }
                    else {
                        stations_lat.push(0);
                        stations_long.push(0);
                    }

                }
                request_7.send();
            }

        }

    }
    const key = '5e8368d318410e';
    const streets = L.tileLayer.Unwired({key: key, scheme: "streets"});
    let map = L.map('map', {
        center: [local_lat, local_long],
        zoom:10,
        layers: [streets]

    });
    var local_icon = L.icon({
        iconUrl: 'local_station.png',
        iconSize: [32, 48],
        iconAnchor: [16, 48],
        popupAnchor: [0, -48]
    });
    var calling_icon = L.icon({
       iconUrl: 'calling_at_station.png',
        iconSize: [32, 48],
        iconAnchor: [16, 48],
        popupAnchor: [0, -48]
    });
    let marker = L.marker([local_lat, local_long], {icon:local_icon}).addTo(map);
    marker.bindPopup(station_name);
    if(stations_lat.length > 0)
    {
        for(i = 0; i < stations_lat.length; i++)
        {
            if(stations_lat[i] == 0 && stations_long[i] == 0)
            {
                console.log("No Pointer");
            }
            else
            {
                marker = L.marker([stations_lat[i], stations_long[i]], {icon:calling_icon}).addTo(map);
                marker.bindPopup(stations[i]);
            }

        }
    }



    L.control.scale().addTo(map);


    document.write("<style> #map{height: 500px; width : 1000px; float : right;} </style>");
    map.invalidateSize(true);



}






















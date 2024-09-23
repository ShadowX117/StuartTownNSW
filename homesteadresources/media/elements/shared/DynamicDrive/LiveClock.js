///////////////////////////////////////////////////////////
//Live Clock Script-
//By Mark Plachetta (astro@bigpond.net.au©) based on code from DynamicDrive.com
//For full source code, 100's more DHTML scripts, and Terms Of Use,
//visit http://www.dynamicdrive.com
///////////////////////////////////////////////////////////

	var dn = "";
	var mn = "th";

	var DaysOfWeek = new Array(7);
		DaysOfWeek[0] = "Sunday";
		DaysOfWeek[1] = "Monday";
		DaysOfWeek[2] = "Tuesday";
		DaysOfWeek[3] = "Wednesday";
		DaysOfWeek[4] = "Thursday";
		DaysOfWeek[5] = "Friday";
		DaysOfWeek[6] = "Saturday";

	var MonthsOfYear = new Array(12);
		MonthsOfYear[0] = "January";
		MonthsOfYear[1] = "February";
		MonthsOfYear[2] = "March";
		MonthsOfYear[3] = "April";
		MonthsOfYear[4] = "May";
		MonthsOfYear[5] = "June";
		MonthsOfYear[6] = "July";
		MonthsOfYear[7] = "August";
		MonthsOfYear[8] = "September";
		MonthsOfYear[9] = "October";
		MonthsOfYear[10] = "November";
		MonthsOfYear[11] = "December";

// This array controls how often the clock is updated,
// based on your selection in the configuration.
	var ClockUpdate = new Array(3);
		ClockUpdate[0] = 0;
		ClockUpdate[1] = 1000;
		ClockUpdate[2] = 60000;

// The main part of the script:
// myTimeFormat: 0 -> 12hr hh:mm , 1 -> 12hr hh:mm:ss , 2 24hr hh:mm , 3 24hr hh:mm:ss
// myDateFormat: 0 -> none , 1 -> month day, 2 -> month day, year , 3 -> day month, year, 4 -> mm/dd/yyyy , 5 -> dd/mm/yyyy
function show_clock(elementID, mypre_text, myfont_face, myfont_size, myfont_color, myBold, myItalic, myTimeFormat, myDateFormat, DisplayWeekDay) {	
	var my12_hour;
	if (myTimeFormat == "0" || myTimeFormat == "1"){
		my12_hour = 1;
	}
	else{
		my12_hour = 0;
	}
	
	var myupdate;
	if (myTimeFormat == "1" || myTimeFormat == "3"){
		myupdate = 1;
	}
	else{
		myupdate = 2;
	}
		
	if (!dom) return;
	// Get all our date variables:
		var Digital = new Date();
		var day = Digital.getDay();
		var mday = Digital.getDate();
		var month = Digital.getMonth();
		var hours = Digital.getHours();
		var year = Digital.getFullYear();

		var minutes = Digital.getMinutes();
		var seconds = Digital.getSeconds();

	// Fix the "mn" variable if needed:
		if (mday == 1) { mn = "st"; }
		else if (mday == 2) { mn = "nd"; }
		else if (mday == 3) { mn = "rd"; }
		else if (mday == 21) { mn = "st"; }
		else if (mday == 22) { mn = "nd"; }
		else if (mday == 23) { mn = "rd"; }
		else if (mday == 31) { mn = "st"; }

	// Set up the hours for either 24 or 12 hour display:
		if (parseInt(my12_hour)) {
			dn = "AM";
			if (hours >= 12) { dn = "PM"; hours = hours - 12; }
			if (hours == 0) { hours = 12; }
		} else {
			dn = "";
		}
		if (minutes <= 9) { minutes = "0"+minutes; }
		if (seconds <= 9) { seconds = "0"+seconds; }

	// This is the actual HTML of the clock. If you're going to play around
	// with this, be careful to keep all your quotations in tact.
		var myclock = '';
		myclock += mypre_text;
		myclock += hours+':'+minutes;
		if (myupdate == 1) { myclock += ':'+seconds; }
		myclock += ' '+dn;
		var nDateFormat = parseInt(myDateFormat);
		if (nDateFormat != 0){
			myclock += ' on '
			if (parseInt(DisplayWeekDay)){ myclock += DaysOfWeek[day] + ', ';}
			var dates;
			switch (nDateFormat){
				case 1:{
					dates = MonthsOfYear[month] + ' ' + mday+mn;
				}break;
				case 3:{
					dates = mday+' '+MonthsOfYear[month] + ', ' + year;
				}break;
				case 4:{
					dates = (month+1) + '/' + mday + '/' + year;
				}break;
				case 5:{
					dates = mday +'/'+ (month + 1) + '/' + year;
				}break;
				default:{
					dates = MonthsOfYear[month] + ' ' + mday + ', ' + year;
				}
			}
			myclock += dates;
		}
		
		if (parseInt(myBold)) {myclock = '<b>' + myclock + '</b>';}
		if (parseInt(myItalic)) {myclock = '<i>' + myclock + '</i>';}
       	myclock = '<font style="color:'+myfont_color+'; font-family:'+myfont_face+'; font-size:'+myfont_size+'pt;">' + myclock + '</font>';
		
       	document.getElementById(elementID).innerHTML = myclock;

		setTimeout("show_clock('" + elementID + "', '" + mypre_text + "', '" + myfont_face + "', '" + myfont_size + "', '" + myfont_color + "', '" + myBold + "', '" + myItalic + "', '" + myTimeFormat + "', '" + myDateFormat + "', '" + DisplayWeekDay + "')",ClockUpdate[myupdate]);
	}

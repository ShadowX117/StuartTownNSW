/////////////////////////////////////////////////
// Basic Calendar-By Brian Gosselin at http://scriptasylum.com/bgaudiodr/
// Script featured on Dynamic Drive (http://www.dynamicdrive.com)
// This notice must stay intact for use
// Visit http://www.dynamicdrive.com/ for full source code
/////////////////////////////////////////////////
function buildCal(m, y, showCurrent, w, h, mainBorderBgColor, borderThickness, 
	monthBgColor, monthTextColor, monthTextFont, monthTextSize, monthTextStyle, monthUnderline, 
	weekBgColor, weekTextColor, weekTextFont, weekTextSize, weekTextStyle, weekUnderline, 
	dayBgColor, dayTextColor, dayTextFont, dayTextSize, dayTextStyle, dayUnderline, 
	todayBgColor, todayTextColor, todayTextStyle, todayUnderline, align, valign){
	
	var todaydate=new Date() //DD added
	if (parseInt(showCurrent)){
		m = todaydate.getMonth()+ 1;
		y= todaydate.getFullYear();
	}	
	
	var curMonth = parseInt(m);
	var curYear = parseInt(y);
	var mn=['January','February','March','April','May','June','July','August','September','October','November','December'];
	var dim=[31,0,31,30,31,30,31,31,30,31,30,31];
	
	var oD = new Date(y, m-1, 1); //DD replaced line to fix date bug when current day is 31st
	oD.od=oD.getDay()+1; //DD replaced line to fix date bug when current day is 31st
	
	var scanfortoday=(y==todaydate.getFullYear() && m==todaydate.getMonth()+1)? todaydate.getDate() : 0 //DD added
	
	dim[1]=(((oD.getFullYear()%100!=0)&&(oD.getFullYear()%4==0))||(oD.getFullYear()%400==0))?29:28;
	var t='<table style="width:'+w+'; height:'+h+'px; border:'+borderThickness+'px solid '+mainBorderBgColor+';" cols="7" cellpadding="0" border="1" cellspacing="0"><tr align="center">';
	t+='<td colspan="7" align="center" style="background-color:'+monthBgColor+'; font:'+monthTextStyle+' '+monthTextSize+'pt \''+monthTextFont+'\'; text-decoration:'+monthUnderline+'; color:'+monthTextColor+';">'+mn[m-1]+' - '+y+'</td></tr><tr align="center">';
	for(s=0;s<7;s++)
		t+='<td style="background-color:'+weekBgColor+'; font:'+weekTextStyle+' '+weekTextSize+'pt \''+weekTextFont+'\'; text-decoration:'+weekUnderline+';color:'+weekTextColor+';">'+"SMTWTFS".substr(s,1)+'</td>';
	t+='</tr><tr align="center">';
	
	for(i=1;i<=42;i++){
		var x=((i-oD.od>=0)&&(i-oD.od<dim[m-1]))? i-oD.od+1 : '&nbsp;';
		var underline = dayUnderline;
		if (x == '&nbsp;' && dayUnderline == 'underline')
			underline = 'none';
		if (x==scanfortoday) //DD added
			t+='<td style="background-color:'+todayBgColor+'; font:'+todayTextStyle+' '+dayTextSize+'pt \''+dayTextFont+'\'; text-decoration:'+todayUnderline+'; color:'+todayTextColor+'; text-align:'+align+'; vertical-align:'+valign+';" padding: 2px;">'+x+'</td>';
		else
			t+='<td style="background-color:'+dayBgColor+'; font:'+dayTextStyle+' '+dayTextSize+'pt \''+dayTextFont+'\'; text-decoration:'+underline+'; color:'+dayTextColor+'; text-align:'+align+'; vertical-align:'+valign+';" padding: 2px;">'+x+'</td>';
		
		if(((i)%7==0)&&(i<36))t+='</tr><tr align="center">';
	}
	return t+='</tr></table>';
}


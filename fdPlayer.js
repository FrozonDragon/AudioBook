(function ($) {
    "use strict";
 
    $.fdPlayer = function(el, options) {
		 // parsing the Lyrics from http://stackoverflow.com/questions/11510012/any-javascript-parser-for-lrc
		function parseLyric(allText) { // This will only divide with respect to new lines 
			
			var allTextLines = " ";
			var line = " ";
			var j=0;
			var duration=0;
			var lyrics = [];
			var tim = [] ;
			allTextLines = allText.split(/\r\n|\n/);	
			$('div[name="fdLyric"]').empty();
			for (var i=0;i<allTextLines.length;i++){		
				if (allTextLines[i].search(/^(\[)(\d*)(:)(.*)(\])(.*)/i)>=0 )// any line without the prescribed format wont enter this loop 
				{
					line = allTextLines[i].match(/^(\[)(\d*)(:)(.*)(\])(.*)/i);
					tim[j] = (parseInt(line[2])*60)+ parseInt(line[4]); // will give seconds 
					duration = j>0? tim[j]-tim[j-1]: 0; //!!!!TODO: Something wrong here.. the duration is next - current.
					lyrics[j]= line[6] ;//will give lyrics 
					$('div[name="fdLyric"]').append("<p id=\"fdt_"+tim[j]+"\" fdLyricPos=\""+tim[j]+"\"  fdLyricDur=\""+duration+"\" >"+lyrics[i]+"</p>" );
					j++;
				}
			} 
		} 

        // Global Private Variables
        var MAX_WIDTH = 200;
		var timer = null;
		var iPos = 0;
        var base = this;
 
        base.$el = $(el);
        base.el = el;
 
        base.$el.data('fdPlayer', base);
 
        base.init = function(){
            var totalButtons = 0;
 
            // This Was missing
            base.options = $.extend({},$.fdPlayer.defaultOptions, options);            
            

			base.$el.append('<audio name="fdAudio" id="fdAudio" controls="controls"  style="'+base.options.audioStyle+'"><source name="fbAudioSource_mp3" type="audio/mpeg" src="'+base.options.audioUrl+'" /></audio>');

            base.$el.append('<div name="fdLyric" id="fdLyric" style="'+base.options.lyricStyle+'"></div>');

			$('audio[id="fdAudio"]').on("play",function(){     
				var pos = $('audio[id="fdAudio"]').currentTime == 0 ? 0 : iPos;
				//alert($('audio[id="fdAudio"]')[0].currentTime);
				base.play(pos);
			});
			$('audio[id="fdAudio"]').on("pause",function(){		
			//	clearTimeout(timer);
				base.pause();
			});
			$('audio[id="fdAudio"]').bind("seeked",function(){		
				//alert($('audio[id="fdAudio"]')[0].currentTime);
				base.seeked();
			});
        };
		
		base.play =  function (iSeconds) {
			if(base.options.lineByLine == true){
				var nextSentence = $( "#fdt_"+iSeconds ).next("p");	
				var duration = parseInt(nextSentence.attr("fdLyricDur"));
				$( "#fdt_"+iSeconds ).fadeIn(1000).delay(duration*1000).fadeOut(1000);
				if(duration>0){
					timer = setTimeout( function() { base.play(iSeconds+duration); }, duration*1000);
				}	
			}else{
				iPos = iSeconds;
				$( "#fdt_"+iSeconds ).css( "color", "blue" );
				if(base.options.goneAfterPlay==true){
					$( "#fdt_"+iSeconds ).prev("p").hide();
				}
				
				var nextSentence = $( "#fdt_"+iSeconds ).next("p");	
				var duration = parseInt(nextSentence.attr("fdLyricDur")); 
				
				if(duration>0){
					timer = setTimeout( function() { base.play(iSeconds+duration); }, duration*1000);
				}				
				
			}
			
			

		}
		
		base.pause =  function () {
			clearTimeout(timer);
		}
		
		base.seeked =  function () {
			var curPos = parseInt($('audio[id="fdAudio"]')[0].currentTime);
			//alert(curPos);
			$( "#fdLyric p" ).filter(function() { return parseInt($(this).attr("fdLyricPos")) < curPos; }).css( "color", "blue" );
			$( "#fdLyric p" ).filter(function() { return parseInt($(this).attr("fdLyricPos")) > curPos; }).css( "color", "black" );
		}
        base.loadLyric = function() {
			if(base.options.lyricUrl !== ""){
				$.ajax({
					type: "GET",
					url: base.options.lyricUrl,
					dataType: "text",
					success: function (data) {
						parseLyric(data);
						if(base.options.lineByLine == true){
							$( "#fdLyric p" ).hide();
						}
					}
				});
			}
        };
		base.loadAudio = function() {
			if(base.options.audioUrl !== ""){
				$('source[name="fbAudioSource_mp3"]').attr('src', base.options.audioUrl);
				$('audio[name="fdAudio"]')[0].load();			
			}
        };

        base.getAudio = function() {
            return $('audio[id="fdAudio"]');
        };
 
        base.init();
    };

    /* Dont forget to add the options! */
	$.fdPlayer.defaultOptions = {
		//width: 300px;
        audioUrl: "",
        lyricUrl: "",
        audioStyle: "width:100%; ",
		goneAfterPlay: true,
		lineByLine:true,
        lyricStyle: "border: 1px solid #DDD; width:100%; height:100%; background-color:#AAA; color:#333; padding:10px",
        buttonStyle: "border: 1px solid #fff; background-color:#000; color:#fff; padding:20px 50px",
        buttonPress: function () {}
    };
    $.fn.fdPlayer = function(options){
        return this.each(function(){
            var fdp = new $.fdPlayer(this, options);
			fdp.loadLyric();
            fdp.loadAudio();
        });
    };
})(jQuery);


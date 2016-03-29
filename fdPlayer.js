(function ($) {
    "use strict";
 
    $.fdPlayer = function(el, options) {
		 // parsing the Lyrics from http://stackoverflow.com/questions/11510012/any-javascript-parser-for-lrc
		function parseLyric(allText) { // This will only divide with respect to new lines 
			
			var allTextLines = " ";
			var line = " ";
			var j=0;
			var duration=0;
			
			allTextLines = allText.split(/\r\n|\n/);	
			$('div[name="fdLyric"]').empty();
			for (var i=0;i<allTextLines.length;i++){		
				if (allTextLines[i].search(/^(\[)(\d*)(:)(.*)(\])(.*)/i)>=0 )// any line without the prescribed format wont enter this loop 
				{
					line = allTextLines[i].match(/^(\[)(\d*)(:)(.*)(\])(.*)/i);
					tim[j] = (parseInt(line[2])*60)+ parseInt(line[4]); // will give seconds					
					lyrics[j]= line[6] ;//will give lyrics 					
					j++;
				}
			} 
		} 

		var lyrics = [];
		var tim = [] ;
		var timer = null;
		var iPos = 0;
        var base = this;
		var _FD_AUDIO = null;
		var _PREVIOUS_LINE = -1;
		var _CURRENT_LINE = 0;
        base.$el = $(el);
        base.el = el;
 
        base.$el.data('fdPlayer', base);
 
        base.init = function(){

			_FD_AUDIO = null;
			_PREVIOUS_LINE = -1;
			_CURRENT_LINE = 0;
            // This Was missing
            base.options = $.extend({},$.fdPlayer.defaultOptions, options);            
            

			base.$el.append('<audio name="fdAudio" id="fdAudio" controls="controls"  style="'+base.options.audioStyle+'"><source name="fbAudioSource_mp3" type="audio/mpeg" src="'+base.options.audioUrl+'" /></audio>');

            base.$el.append('<div name="fdLyric" id="fdLyric" style="'+base.options.lyricStyle+'"></div>');

			$('audio[id="fdAudio"]').bind("seeked",function(){		
				base.seeked();
			});
			$('audio[id="fdAudio"]').on("timeupdate", function(){	
				base.timeupdate(this);
			});	
			$('audio[id="fdAudio"]').on("loadeddata", function(){	
				base.loadeddata(this);
			});
			
			
        };
		
	
		base.loadeddata =  function (objAudio) {
			_FD_AUDIO = objAudio; //save as the globle variable
			//console.log(objAudio.duration);
			base.loadLyric(); //load Lyric file after audio is loaed.
		}
				
		base.timeupdate =  function (objAudio) {
			var curPos = parseInt(objAudio.currentTime);
			var indTimer = jQuery.inArray( curPos, tim );
			if(indTimer == -1){
				return;
			}
			_CURRENT_LINE = curPos;
			
			if(base.options.lineByLine == true ){
				if(_PREVIOUS_LINE != _CURRENT_LINE){									
					var duration = indTimer==tim.length-1 ? parseInt(_FD_AUDIO.duration)-tim[indTimer+1] : tim[indTimer+1]-tim[indTimer];
					$('div[name="fdLyric"]').html("<p id=\"fdt_"+tim[indTimer]+"\" fdLyricPos=\""+tim[indTimer]+"\"  fdLyricDur=\""+duration+"\" >"+lyrics[indTimer]+"</p>" ).fadeIn(100);
				}				
			}else{
				if(_PREVIOUS_LINE != _CURRENT_LINE){	
					$( "#fdt_"+curPos ).css( "color", "blue" );
					if(base.options.goneAfterPlay==true){
						$( "#fdt_"+curPos ).prev("p").hide();
					}else{
						$( "#fdLyric p" ).filter(function() { return parseInt($(this).attr("fdLyricPos")) < curPos; }).css( "color", "black" );
					}
				}
			}
			_PREVIOUS_LINE = _CURRENT_LINE;
		}
		
		base.seeked =  function () {
			var curPos = parseInt($('audio[id="fdAudio"]')[0].currentTime);

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
												
						if(base.options.lineByLine == false){
							var duration = 0;
							for(var i=1; i<=tim.length; i++){							
								duration = i==tim.length ? parseInt(_FD_AUDIO.duration)-tim[i-1] : tim[i]-tim[i-1];
								$('div[name="fdLyric"]').append("<p id=\"fdt_"+tim[i-1]+"\" fdLyricPos=\""+tim[i-1]+"\"  fdLyricDur=\""+duration+"\" >"+lyrics[i-1]+"</p>" );
							}
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
            return _FD_AUDIO;
        };
 
        base.init();
    };

    /* Dont forget to add the options! */
	$.fdPlayer.defaultOptions = {
		//width: 300px;
        audioUrl: "",
        lyricUrl: "",
        audioStyle: "width:100%; ",
		goneAfterPlay: false,
		lineByLine:false,
        lyricStyle: "border: 1px solid #DDD; width:100%; height:100%; background-color:#AAA; color:#333; padding:10px",
        buttonStyle: "border: 1px solid #fff; background-color:#000; color:#fff; padding:20px 50px",
        buttonPress: function () {}
    };
    $.fn.fdPlayer = function(options){
        return this.each(function(){
            var fdp = new $.fdPlayer(this, options);
			fdp.loadAudio();

        });
    };
})(jQuery);


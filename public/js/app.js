"use strict";
var browserWidth=void 0,browserHeight=void 0,screenWidth=void 0,screenHeight=void 0,distance=void 0,target=void 0,device_type=void 0,device_name=void 0;
var screenSize=function screenSize(){screenWidth=screen.width;screenHeight=screen.height;
void 0};
var browser={width:window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth,height:window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight};
var scrollToAnchor=function scrollToAnchor(aid){var aTag=document.querySelectorAll("a[name='"+aid+"']");aTag.forEach(function(obj){document.querySelector("html,body").animate({scrollTop:obj.offset().top},900)})};
var enableButton=function enableButton(target){document.querySelector(target).prop("disabled",false)};
var disableButton=function disableButton(target){document.querySelector(target).prop("disabled",true)};
var destroyElement=function destroyElement(element){document.querySelector(element).outerHTML=""};
var getURLParameter=function getURLParameter(sParam){var sPageURL=window.location.search.substring(1);var sURLVariables=sPageURL.split("&");sURLVariables.forEach(function(object,index){var sParameterName=sURLVariables[index].split("=");if(sParameterName[0]==sParam){
void 0;return sParameterName[1]}})};var urlContains=function urlContains(needle){var haystack=window.location.href;return haystack.includes(needle)?true:false};var isAdult=function isAdult(data){return data.age>=18};function scrollTo(element,to,duration){var start=element.scrollTop,change=to-start,increment=20;var animateScroll=function animateScroll(elapsedTime){elapsedTime+=increment;var position=easeInOut(elapsedTime,start,change,duration);element.scrollTop=position;if(elapsedTime<duration){setTimeout(function(){animateScroll(elapsedTime)},increment)}};animateScroll(0)}function easeInOut(currentTime,start,change,duration){currentTime/=duration/2;if(currentTime<1){return change/2*currentTime*currentTime+start}currentTime-=1;return-change/2*(currentTime*(currentTime-2)-1)+start}"use strict";window.onload=function(){axios.get("data/data.json").then(function(response){var data=response.data;document.querySelector("main").innerHTML+="<br /><br /><strong>Adults</strong><br /><ul></ul>";data.filter(isAdult).forEach(function(user){document.querySelector("main ul").innerHTML+="<li>"+user.name+"</li>"});
void 0}).catch(function(error){
void 0});document.querySelector("main").innerHTML+="<br />width: "+browser.width+"<br />height: "+browser.height;document.querySelector("#nudge").addEventListener("click",function(){void 0;scrollTo(document.body,browser.height,600)})};
//# sourceMappingURL=app.js.map

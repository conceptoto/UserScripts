// ==UserScript==
// @name         Turmy pet change
// @namespace    http://tampermonkey.net/
// @version      2024-08-26
// @description  allows you to change pets in the Turmaculus page
// @author       toto but it was gurase's idea (sese helped too teehee)
// @match        https://www.neopets.com/medieval/turmaculus.phtml
// @match        https://www.neopets.com/home/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';

    //Title Values!
    const diffpettext = document.createElement('h3');
    diffpettext.style.fontFamily = "'MuseoSansRounded700', 'Arial', sans-serif";
    diffpettext.style.textAlign = 'center';
    diffpettext.textContent = "Send a different petpet?";
    var pets = [];

    //1:   If on the homepage, update stored value PP_LIST
    if (document.URL === 'https://www.neopets.com/home/') pullPpFromHome();

    //2:   If on Turmy's page:
    else if (document.URL === 'https://www.neopets.com/medieval/turmaculus.phtml')
    {
        //2.1: Make sure Pp isnt empty.
        const ppList = GM_getValue("PP_LIST",null);

        //2.2: If Pp is null, ajax it!
        if (ppList===null) pullPpFromTurmy();
        else console.log("Petpet List loaded from storage :3");


        //2.3: Actually add all the stuff to the petpage - all of this is toto!
            var targetButton = $("button:contains('Wake Up!')");

            // Create a container for the pet images
            var buttonContainer = $("<div></div>").css({
                "text-align": "center", // Center div lmao
                "margin-top": "10px",
            });

            // Append container after wake up button
            targetButton.parent().after(buttonContainer);
            targetButton.parent().after(diffpettext);


            // Create as many buttons as there are pets, use name and image attributes
            for (let i = 0; i < ppList.length; i++){
                if(typeof ppList[i].petpetimg !== 'undefined'){
                    buttonContainer.append('<a id="pet1" href="https://www.neopets.com/process_changepet.phtml?new_active_pet=' + ppList[i].ownName + '" target="_blank"><img title="' +ppList[i].petpetName+ '" id="petimg1" src="' + ppList[i].petpetimg + '" style="margin-left: 10px;"></a>')
                }
                else{
                    buttonContainer.append('<a id="pet1" href="https://www.neopets.com/process_changepet.phtml?new_active_pet=' + ppList[i].ownName + '" target="_blank"><img title="' + ppList[i].ownName +' does not have a petpet..." id="petimg1" src="https://images.neopets.com/halloween/gravedanger/poof.gif" style="margin-left: 10px;"></a>')
                }
            }
            console.log(buttonContainer)

            // Add event listener to close the new tab after a delay, recycled code is my best friend
            $("a[id^='pet']").on("click", function() {
                var newTab = window.open($(this).attr("href"), "_blank");
                setTimeout(function() {
                    newTab.close();
                    location.reload(); // Reload the page after clicking on the pet
                }, 200); // This is the delay in milisecs, no idea if it can be shorter
                return false; // Prevent default link behavior
            });

        //2.4: Get the Brownhound Turmy Time for today
        getTurmyTimes();
    }




    //---------------FUNCTIONZ---------------

    //On Turmy page, get the Petpet info if we need it - toto's ajax code
    function pullPpFromTurmy(){
    
        $.ajax({
            url: "https://www.neopets.com/home/index.phtml", // Shoutouts to Luxittarius
            method: "GET",
            success: function(data) {
                console.log("succesful query")
                $(data).find(".hp-carousel-pet").each(function() { //find petpet and owner data
                    let petpetImg = $(this).attr("data-petpetimg");
                    let petpetName = $(this).attr("data-petpet");
                    let ownName = $(this).attr("data-name");
                    pets.push({petpetimg: petpetImg, petpetName: petpetName, ownName: ownName});
                });
                GM_setValue("PP_LIST",pets);
                //console.log(GM_getValue("PP_LIST",null));
            }

        });

        //Set ppList
        const ppList = GM_getValue("PP_LIST",null);
        console.log("Petpet list pulled from Home :3");
    }

    //On the home page, update the Petpet info - sese's run-of-the-mill js code
    function pullPpFromHome(){
        $(".hp-carousel-pet").each(function() { //find petpet and owner data
                let petpetImg = $(this).attr("data-petpetimg");
                let petpetName = $(this).attr("data-petpet");
                let ownName = $(this).attr("data-name");
                pets.push({petpetimg: petpetImg, petpetName: petpetName, ownName: ownName});
            });
        GM_setValue("PP_LIST",pets);
        //console.log(GM_getValue("PP_LIST",null)); //For dev purposes
        console.log("Petpet list updated :3");
    }

    //Get recent Turmy times from ~Brownhownd - sese's attempt to copy toto's ajax code
    function getTurmyTimes(){
    var todayTime; var dailyTitle;
    $.ajax({
        url: "https://www.neopets.com/~Brownhownd",
        method: "GET",
        success: function(data){
            $(data).find(".title").each(function() {
                if (dailyTitle=="Daily Due Up Times") {todayTime = $(this).html(); dailyTitle="Awake today at: ";}
                else if ($(this).html() == "Daily Due Up Times") dailyTitle = $(this).html();
            });
            //Trim off the extra lines and whitespace, we only want the most recent one!
            todayTime = todayTime.slice(0,todayTime.indexOf("<p>")).trim().replace(":"," at");
            //console.log(todayTime);

            //Find the Turmy Header <p> and place the next wakeup time underneath!
            var turmHeader = $("#turmaculus_container p:contains('wake him up??')");

            var wakeUpTime = $("<p></p>");

            wakeUpTime.append('His next wake up time is <b>' + todayTime + '</b> according to <a href="https://www.neopets.com/~Brownhownd">Brownhownd</a>.');
            turmHeader.after(wakeUpTime);


        }
    });
    console.log("Got turmy times :D");
    }

})();



// ==UserScript==
// @name         Quickstock Auto Deposit
// @version      2025-12-20
// @description  automatically check all items in quickstock to be deposited, except for one of each: Blue Short Hair Brush, Red Bouncy Ball, The Cowardly Tuskaninny and any Omelette
// @author       toto
// @match        https://www.neopets.com/quickstock.phtml/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @grant        none
// ==/UserScript==

check_all(2);//gotta love neopets magic numbers! checks all deposit radio buttons, 1 is 'Stock', 3 is 'Donate', yada yada

(function() {

    //feel free to change any of these, 
    //i just like that theyre from the general store 
    //or an omelette, if youre anoying)
    var hbText = "Blue Short Hair Brush";
    var bbText = "Red Bouncy Ball";
    var tctText = "The Cowardly Tuskaninny";
    var oText = "Omelette";

    var blueShortHairBrushTD, redBouncyBallTD, theCowardlyTuskaninnyTD, omeletteTD;

    const tds = document.querySelectorAll('td'); // Select all div elements

    //there must be a better way to do this idc im going backwards to get maintain the oldest item
    for(let x = tds.length - 1 ; x >= 0; x--){
        if (tds[x].textContent.includes(hbText) && !(tds[x].className == "content")){
            //console.log("there's a shorthair", tds[x]);
            blueShortHairBrushTD = tds[x].parentNode;
        }
        if (tds[x].textContent.includes(bbText) && !(tds[x].className == "content")){
            //console.log("there's a ball");
            redBouncyBallTD = tds[x].parentNode;
        }
        if (tds[x].textContent.includes(tctText) && !(tds[x].className == "content")){
            //console.log("there's a book");
            theCowardlyTuskaninnyTD = tds[x].parentNode;
        }
        if (tds[x].textContent.includes(oText) && !(tds[x].className == "content")){
            //console.log("there's a food");
            omeletteTD = tds[x].parentNode;
        }
    }

    var b = blueShortHairBrushTD.querySelector('[value="deposit"]');//get the deposit button 
    if (b) {b.checked = false;}//if its there, uncheck it
    var r = redBouncyBallTD.querySelector('[value="deposit"]');//yada yada yada jerry
    if (r) {r.checked = false;}
    var t = theCowardlyTuskaninnyTD.querySelector('[value="deposit"]');
    if (t) {t.checked = false;}
    var o = omeletteTD.querySelector('[value="deposit"]');
    if (o) {o.checked = false;}

})();

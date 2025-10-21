// ==UserScript==
// @name         Wishing Well - Faster Wishing
// @namespace    http://tampermonkey.net/
// @version      2025-10-20
// @description  cheat!!!!! (by neocord definitions, i.e. one click does more than one action)
// @author       Me :3
// @match        https://www.neopets.com/wishing.phtml
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const wishButton = document.querySelector('input[type="submit"][value="Make a Wish"]');
    if (!wishButton) return;

    const newButton = wishButton.cloneNode(true);
    newButton.value = "I like to live dangerously!"
    wishButton.parentElement.appendChild(newButton);

    newButton.addEventListener("click", (e) => {
        e.preventDefault();

        if (!confirm("Are you sure you want to make 7 wishes in a row???")) return;

        const form = document.querySelector('form[action="process_wishing.phtml"]');
        if (!form) return;

        const formData = new FormData(form);
        const action = form.action;

        let count = 0;

        function makeWish() {
            count++;
            confirm(`Wish number ${count} sent!`);//comment this line if you want to go faster
            fetch(action, {
                method: "POST",
                body: formData
            }).then(() => {
                if (count < 7) {
                    var fuzzyPickles = Math.floor(Math.random()*200);
                    setTimeout(makeWish, 600 + fuzzyPickles);//and feel free to edit these time values too :)
                }
                else {
                    alert("7 wishes sent!!!!");
                }
            }).catch(err => console.error("Wish failed:", err));
        }

        makeWish();
    });



})();

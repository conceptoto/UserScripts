// ==UserScript==
// @name         Igloo Garage Sale Tracker
// @namespace    http://tampermonkey.net/
// @version      2026-01-25
// @description  Tracks Igloo Garage Sale Purchases
// @author       You
// @match        https://www.neopets.com/winter/igloo.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==


(function () {
    'use strict';

    const GARAGE_KEYS = 'igs_buys';//I love being cute

    let counter = GM_getValue(GARAGE_KEYS, 0);//get or default to 0, womp womp

    let lastVisibility = false

    function addCounter(thanks) {

        const paragraphs = document.querySelectorAll('p');

        const counterP = document.createElement('p');
        counterP.setAttribute('id', 'counterP');
        counterP.innerHTML = `<br>Btw, you've bought <b>${counter}</b> items :)`;

        for (const p of paragraphs) {
            if (p.innerText.includes('Click on the item you wish to buy!')) {//if there are items
                if (!thanks){//but you dont see thanks
                    p.appendChild(counterP);
                    return;
                }

                else if (thanks){//and you were thanked
                    var oldCounter = document.getElementById('counterP');
                    oldCounter.replaceWith(counterP);//replace the existing pee
                    return;
                }
            }

            else if (p.innerText.includes(' - We just ran out of items.')) {//no items, you suck
                p.appendChild(counterP);
                return;
            }

            else if (p.innerText.includes('Please try again tomorrow')){//you bought 10 items today, so cool
                p.appendChild(counterP);
                return;
            }
        }
        return false;
    }

    function hasThanks(element) {
        return Array.from(element.querySelectorAll('p'))//out of all the guys inside the big guy
            .some(p => p.textContent.includes('Thanks for buying'));//one has a pee with thanks maybe i should do this instead of the pee for earlier :-)
    }

    function isVisible(element) {
        return getComputedStyle(element).display === 'block';
    }

    const observer = new MutationObserver(() => {
        const popup = document.getElementById('IGSResultPopup');
        if (!popup) return;//if no popup kill asap

        const visibility = isVisible(popup);//check visibility
        thanks = hasThanks(popup);//check thanks, declared outside scope maybe im a dummy idk
        if (!lastVisibility && visibility && thanks) {
            counter++;
            addCounter(thanks);
            GM_setValue(GARAGE_KEYS, counter);//like leaving ur keys at the counter, waka waka!!⍝ʕ •ᴥ• ʔ⍝
        }

        lastVisibility = visibility;
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });

    let thanks = false;

    addCounter(thanks);//run when page loads

})();

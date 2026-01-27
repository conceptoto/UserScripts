// ==UserScript==
// @name         Igloo Garage Sale Tracker
// @namespace    http://tampermonkey.net/
// @version      2026-01-25
// @description  show how much shit youve bought
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

    function scheduleRefresh(minutes) {

        const waitTime = minutes* 60 * 1000;
        const fuzzedTime = waitTime + Math.floor(Math.random() * 20 * 1000);
        const nextRefresh = new Date(Date.now() + fuzzedTime);

        const timerP = document.createElement('p');
        timerP.innerHTML = `<br>Next refresh set for <b>${nextRefresh.toLocaleTimeString()}</b> (your time!)`;

        setTimeout(() => location.reload(), fuzzedTime);
        return timerP;
    }

    function beep() {
        const ctx = new AudioContext();
        for (let i = 0; i < 3; i++) {
            const osc = ctx.createOscillator();
            if (i%2 == 0) osc.frequency.value = 500;
            else osc.frecuency.value = 300;
            osc.connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.1); // 0.1s apart
            osc.stop(ctx.currentTime + i * 0.1 + 0.05); // 0.05s duration per beep
        }
    }

    function addCounter(thanks) {

        const paragraphs = document.querySelectorAll('p');

        const counterP = document.createElement('p');
        counterP.setAttribute('id', 'counterP');
        counterP.innerHTML = `<br>Btw, you've bought <b>${counter}</b> items :)`;

        for (const p of paragraphs) {
            if (p.innerText.includes('Click on the item you wish to buy!')) {//if there are items

                if (!thanks){//but you dont see thanks
                    p.appendChild(counterP);
                    const timerP = scheduleRefresh(2); //so the page refreshes in 2 minutes, maybe its not enough time?
                    p.appendChild(timerP);
                    
                    beep();

                    return;
                }

                else if (thanks){//and you were thanked

                    var oldCounter = document.getElementById('counterP');
                    oldCounter.replaceWith(counterP);

                    return;
                }
            }

            else if (p.innerText.includes(' - We just ran out of items.')) {//no items, you suck

                p.appendChild(counterP);
                const timerP = scheduleRefresh(1);
                p.appendChild(timerP);
                return;
            }

            else if (p.innerText.includes('Please try again tomorrow')){//you bought 10 items today

                p.appendChild(counterP);
                return;
            }
        }
        return false;
    }

    function hasThanks(element) {
        return Array.from(element.querySelectorAll('p'))//out of all the guys inside the big guy
            .some(p => p.textContent.includes('Thanks for buying'));//one has a pee with thanks maybe i should do this instead of the for earlier :-)
    }

    function isVisible(element) {
        return getComputedStyle(element).display === 'block';
    }

    const observer = new MutationObserver(() => {
        const popup = document.getElementById('IGSResultPopup');
        if (!popup) return;

        const visibility = isVisible(popup);
        thanks = hasThanks(popup);
        if (!lastVisibility && visibility && thanks) {
            counter++;
            addCounter(thanks);
            GM_setValue(GARAGE_KEYS, counter);
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

    addCounter(thanks);

})();

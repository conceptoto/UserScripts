// ==UserScript==
// @name         Grave Danger Refresh Buddy (Non-Kosher)
// @match        https://www.neopets.com/halloween/gravedanger/
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    const waitTime = 10 * 60 * 1000; //600 THOUSAND milliseconds (10 minutes)
    const fuzzedTime = waitTime + Math.floor(Math.random() * 20 * 1000) //plus a random time between 0 and 20 seconds
    console.log(`${fuzzedTime/1000} seconds left to refresh`)
    const now = Date.now();
    console.log(`next rf by ${new Date(fuzzedTime + now).toLocaleTimeString()}`)
    setTimeout(() => {
        location.reload();
    }, fuzzedTime);
})();

// ==UserScript==
// @name         Grave Danger Refresh Buddy (Non-Kosher)
// @match        https://www.neopets.com/halloween/gravedanger/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    if (document.body.textContent.toLowerCase().includes("something has happened")) {
        console.log("Found 'Something Has Happened' on the page, not refreshing anymore");
        return;
    }

    const waitTime = 10 * 60 * 1000; //10 minutes
    const fuzzedTime = waitTime + Math.floor(Math.random() * 20 * 1000);
    const nextRefresh = new Date(Date.now() + fuzzedTime);

    console.log(`Next refresh by ${nextRefresh.toLocaleTimeString()}`);

    setTimeout(() => location.reload(), fuzzedTime);
})();

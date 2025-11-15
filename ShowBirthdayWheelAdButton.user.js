// ==UserScript==
// @name         Show birthday wheel ad button
// @namespace    http://tampermonkey.net/
// @version      2025-11-15
// @description  What it says in the tin
// @author       toto
// @match        https://www.neopets.com/np26birthday/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @grant        none
// ==/UserScript==

(function() {
    function showButton() {
        const btn = document.querySelector('#watchAdButtonContainer');
        if (btn) {
            btn.style.display = "block";
        }
    }

    const obs = new MutationObserver(showButton);
    obs.observe(document.body, { childList: true, subtree: true, attributes: true });
})();

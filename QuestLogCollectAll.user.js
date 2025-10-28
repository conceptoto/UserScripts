// ==UserScript==
// @name         Quest Log Collect-All
// @namespace    https://neopets.com/
// @version      2025.10.27
// @description  Adds a button that collects all claimable rewards
// @match        https://www.neopets.com/questlog/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

    function adjustDailyChunks(){//code straight plundered from Harvey's Neopets Daily Quest Helper
    // Only activate when on the 'Daily Quests' tab
        if (sessionStorage.tabActive != 2) return;
        var results = document.getElementsByClassName("questlog-quest");
        for (var i = 0; i < results.length; i++){
            var buttons = results[i].getElementsByClassName("ql-quest-buttons")[0];
        }

        document.querySelectorAll('.questlog-missed-day').forEach(el => el.remove());

        const timerSection = document.querySelector('.questlog-timer');
        if (!timerSection) return;
        const allButton = document.createElement('button');
        allButton.classList.add("button-default__2020");
        allButton.classList.add("btn-single__2020");
        allButton.classList.add("button-yellow__2020");
        allButton.innerHTML = "Go!";
        allButton.id = 'collectAllRewardsBtn';
        allButton.textContent = 'Collect All Rewards';
        timerSection.insertAdjacentElement('afterend', allButton);

        allButton.addEventListener('click', async () => {
            const claimBtns = Array.from(document.querySelectorAll('button, input[type="button"]')).filter(b => /claim reward/i.test(b.textContent || b.value));
            const clickableBtns = new Array();

            claimBtns.forEach(btn => {
                const hasClick = btn.hasAttribute('onclick') && btn.getAttribute('onclick').includes('claimReward');
                if(hasClick){
                    clickableBtns.push(btn);
                }
            })

            if (clickableBtns.length === 0) {
                alert('No claimable rewards found.');
                return;
            }

            allButton.disabled = true;
            allButton.textContent = `Collecting ${clickableBtns.length} rewards...`;

            for (const b of clickableBtns) {
                b.click();
                await new Promise(r => setTimeout(r, 1000));//idk man if your internet is slow or the site is chugging tweek this :)
            }

            allButton.textContent = 'All Done!';
            setTimeout(() => {
                allButton.disabled = false;
                allButton.textContent = 'Collect All Rewards';
            }, 3000);

        })
    }

    function observeChanges(){
        const targetNode = document.getElementById("QuestLogContent");
        const config = { childList: true };
        //create a MutationObserver to detect changes
        const contentObserver = new MutationObserver(adjustDailyChunks);
        contentObserver.observe(targetNode, config);
    }

    observeChanges();

})();

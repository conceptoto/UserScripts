// ==UserScript==
// @name         Wishing Well - Faster Wishing
// @namespace    http://tampermonkey.net/
// @version      2026-03-24
// @description  spawns a quickwishTM button and shows itemDB's most expensive collectible, Also autofills the form for you.
// @author       Me :3
// @match        https://www.neopets.com/wishing.phtml
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const wishButton = document.querySelector('input[type="submit"][value="Make a Wish"]');
    if (!wishButton) return;

    const newButton = wishButton.cloneNode(true);
    newButton.value = "I like to live dangerously!"
    wishButton.parentElement.appendChild(newButton);

    const wishCountLabel = Array.from(document.querySelectorAll('b')).find(b => b.textContent.startsWith('Wish Count:'));
    let baseCount = 0;

    newButton.addEventListener("click", (e) => {
        e.preventDefault();

        if (!confirm("Are you sure you want to make 7 wishes in a row???")) return;

        const form = document.querySelector("form[action='process_wishing.phtml']");
        if (!form) return;

        const formData = new FormData(form);
        const action = form.action;

        if (wishCountLabel) {
            const match = wishCountLabel.textContent.match(/\d+/);
            if (match) baseCount = parseInt(match[0], 10);
        }

        let count = 0;

        function makeWish() {
            count++;
            if (wishCountLabel) {
                wishCountLabel.textContent = `Wish Count: ${baseCount + count}`;
            }
            //confirm(`Wish number ${count} sent...`);
            fetch(action, {
                method: "POST",
                body: formData
            }).then(() => {
                if (count < 7) {
                    var fuzzyPickles = Math.floor(Math.random()*200);
                    setTimeout(makeWish, 600 + fuzzyPickles);
                }
                else {
                    alert("7 wishes sent!!!!");
                }
            }).catch(err => console.error("Wish failed: ", err));
        }

        makeWish();

    });

    let wishableItems, wishableItemsNoInflation, mostExpensive, mostExpensiveNoInflation, inflationMoment;

    function getPrice() {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: "GET",
                url: `https://itemdb.com.br/api/v1/lists/official/all-collectibles/itemdata`,
                onload: (response) => {
                    try {
                        console.log("succesful query");
                        const data = JSON.parse(response.responseText);

                        let sortable = []

                        for (var item in data) {
                            sortable.push(data[item]);
                        }

                        wishableItems = sortable.filter((item) => item.rarity<=89);

                        wishableItemsNoInflation = wishableItems.filter((item) => !item.price.inflated);
                        mostExpensive = wishableItems.sort((a, b) => b.price.value - a.price.value)[0];//b-a is descending order, take the first element
                        mostExpensiveNoInflation = wishableItemsNoInflation.sort((a, b) => b.price.value - a.price.value)[0];

                        inflationMoment = (mostExpensiveNoInflation.name != mostExpensive.name);//true if theyre different names :-)


                        if(inflationMoment){
                            resolve([mostExpensive, mostExpensiveNoInflation]);
                        }
                        else{
                            resolve([mostExpensive, null]);
                        }
                    }
                    catch (e) {
                        reject(e);
                    }
                },
                onerror: (err) => {
                    console.error("ItemDB API req failed:", err);
                    resolve(null);
                }
            });
        });
    }

    async function createDivs() {

        const displayDiv = document.createElement("div");
        displayDiv.style.cssText = `
                display: flex;
                justify-content: center;
                gap: 40px;
                flex-wrap: wrap;
                text-align: center;
                font-family: arial;
                color: #333;
                margin-top: 20px;
            `;

        const shownStamp = await getPrice();

        const mostExpensiveDiv = document.createElement("div");
        mostExpensiveDiv.innerHTML = `
                <h4>Most Expensive Stamp</h4>
                <div>
                    <img src="${shownStamp[0].image}" width="100" height="100">
                    <p>${shownStamp[0].name}</p>
                </div>
            `;
        displayDiv.appendChild(mostExpensiveDiv);

        if (shownStamp[1]) {
            const nonInflatedDiv = document.createElement("div");
            nonInflatedDiv.innerHTML = `
                    <h4>Most Expensive (Non-Inflated) Stamp:</h4>
                    <div>
                        <img src="${shownStamp[1].image}" width="100" height="100">
                        <p>${shownStamp[1].name}</p>
                    </div>
                `;
            displayDiv.appendChild(nonInflatedDiv);
        }

        const form = document.querySelector("form[action='process_wishing.phtml']");
        form.insertAdjacentElement("afterend", displayDiv);
        const donationInput = document.querySelector('input[name="donation"]');
        if(donationInput){donationInput.value = 21;}
        const wishInput = document.querySelector('input[name="wish"]');
        if(wishInput){wishInput.value = shownStamp[0].name;}
    }

    createDivs();

})();

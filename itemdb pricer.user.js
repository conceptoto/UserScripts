// ==UserScript==
// @name         Neopets - itemdb pricer
// @version      2025-12-25
// @description  Indicates itemdb's item prices on various pages
// @author       Original script by senerio
// @icon         https://itemdb.com.br/logo_icon.svg
// @match        *://*.neopets.com/inventory.phtml
// @match        *://*.neopets.com/safetydeposit.phtml*
// @match        *://*.neopets.com/objects.phtml?type=shop&obj_type=*
// @match        *://*.neopets.com/quickstock.phtml*
// @match        *://*.neopets.com/island/tradingpost.phtml*
// @match        *://*.neopets.com/auctions.phtml*
// @match        *://*.neopets.com/market.phtml*type=your*
// @match        *://*.neopets.com/market_your.phtml*
// @match        *://*.neopets.com/genie.phtml*
// @match        *://*.neopets.com/faerieland/darkfaerie.phtml*
// @match        *://*.neopets.com/medieval/earthfaerie.phtml*
// @match        *://*.neopets.com/winter/snowfaerie*.phtml*
// @match        *://*.neopets.com/island/kitchen*.phtml*
// @match        *://*.neopets.com/halloween/witchtower*.phtml*
// @match        *://*.neopets.com/halloween/esophagor*.phtml*
// @match        *://*.neopets.com/space/coincidence.phtml*
// @match        *://*.neopets.com/winter/igloo2.phtml*
// @match        *://*.neopets.com/halloween/garage.phtml*
// @match        *://*.neopets.com/faerieland/employ/employment.phtml*
// @match        *://*.neopets.com/games/kadoatery/*
// @match        *://*.neopets.com/island/training.phtml*
// @match        *://*.neopets.com/pirates/academy.phtml*
// @match        *://*.neopets.com/island/fight_training.phtml*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

// fetching data
(function() {
    let itemsInInventory = [];

    function getPrice(itemName) {
        return new Promise((resolve, reject) => {
            const slug = encodeURIComponent(itemName);

            GM_xmlhttpRequest({
                method: "GET",
                url: `https://itemdb.com.br/api/v1/items/${slug}`,
                onload: (response) => {
                    try {
                        const data = JSON.parse(response.responseText);
                        if (data?.price?.value) {
                            resolve(data.price.value);
                        } else {
                            resolve(null);
                        }
                    } catch (e) {
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

    // pages

    async function markItems(page) {
        const intl = new Intl.NumberFormat();
        const style = 'font-size: x-small; color: #5088d1; margin: auto; white-space: nowrap; font-weight: normal;';

        let itemNameObject;

        if (typeof page.itemNameObject === 'string') {
            itemNameObject = $(page.itemNameObject);
        } else {
            itemNameObject = page.itemNameObject;
        }

        for (const el of itemNameObject.toArray()) {
            const item = $(el);

            if (item.parent().find('.value').length) continue;

            const itemName = (page.itemNameMatch? item.text().match(page.itemNameMatch)?.[1]: item.text())?.trim();

            console.log("[ITEMS SEARCHED]: ", itemsInInventory)
            console.log("[CHECK] checking if: ", `"${itemName},"`, "is in that list: ", itemsInInventory.includes(itemName));

            if (!itemName) continue;

            if (!itemsInInventory.includes(itemName)){

                itemsInInventory.push(itemName);

                const price = await getPrice(itemName);

                console.log("[GETPRICE] price:", price);

                if (price) {
                    const priceHTML = `<p style="${style}" class="value">ItemDB: ${intl.format(price)} NP</p>`;

                    if (page.insert) {
                        page.insert(item, priceHTML);
                    }
                    else {
                        item.parent().append(priceHTML);
                    }
                    if (page.style) {
                        GM_addStyle(page.style);
                    }
                }
            }
            else {
                console.log(itemName, " was already searched for, maybe i should cache it :clueless:");
            }
        }
    }

    const pages = [
        {
            name: 'inventory',
            pageMatcher: /inventory/,
            itemNameObject: '.item-name'
        },
        {
            name: 'neopian shop',
            pageMatcher: /type=shop|donations/,
            itemNameObject: $('.item-name')
        },
        {
            name: 'user shop',
            pageMatcher: /browseshop/,
            itemNameObject: $('a[href*=buy_item] + br + b'),
            insert: (e, insert) => { return e.parent().find('br').eq(-2).after(insert); }
        },
//        ITEMDB ALREADY HAS A BETTER SCRIPT FOR SOURCING PRICES THAN THIS, if you dont want to use it for whatever reason feel free to uncomment these lines
//        {
//            name: 'sdb',
//            pageMatcher: /safetydeposit/,
//            itemNameObject: $('.content form>table').eq(1).find('tr:not(:first-child):not(:last-child) td:nth-child(2) > b').map((i,v) => v.firstChild)
//        },
        {
            name: 'quick stock',
            pageMatcher: /quickstock/,
            itemNameObject: $('form[name=quickstock] tr:not(:nth-last-child(2)) td:first-child:not([colspan])'),
            insert: (e, insert) => { return e.parent().find('td:nth-of-type(2)').append(insert); }
        },
        {
            name: 'trading post',
            pageMatcher: /tradingpost/,
            itemNameObject: $('img[src*="/items/"]').parent(),
            insert: (e, insert) => { return e.parent().find('td:nth-of-type(2)').append(insert); }
        },
        {
            name: 'auctions',
            pageMatcher: /auctions|genie/,
            itemNameObject: $('.content a[href*=auction_id]:not(:has(img))'),
            insert: (e, insert) => { return e.parent().parent().find('td:nth-last-of-type(2)').append(insert); }
        },
        {
            name: 'shop stock',
            pageMatcher: /market/,
            itemNameObject: $('form table').eq(0).find('tbody > tr').slice(1, -1 - 2*$('#pin_field').length).find('td:first-child b'),
            insert: (e, insert) => { return e.eq(0).parent().parent().find('td:nth-of-type(5)').append(insert); }
        },
        {
            name: 'ingredients',
            pageMatcher: /snowfaerie|kitchen|witchtower|esophagor/,
            itemNameObject: $('.ingredient-grid p b')
        },
        {
            name: 'illusen',
            pageMatcher: /earthfaerie/,
            itemNameObject: $('#earth-container div+p b')
        },
        {
            name: 'jhudora',
            pageMatcher: /darkfaerie/,
            itemNameObject: $('#dark-container div+p b')
        },
        {
            name: 'coincidence',
            pageMatcher: /coincidence/,
            itemNameObject: $('#questItems td'),
            itemNameMatch: /(.*)x\d+.*/,
            insert: (e, insert) => { return e.find('b').after(insert); }
        },
        {
            name: 'igloo',
            pageMatcher: /igloo/,
            itemNameObject: $('form[name=items_for_sale] td b')
        },
        {
            name: 'attic',
            pageMatcher: /garage/,
            itemNameObject: $('#items li b'),
            insert: (e, insert) => { return e.parent().find('br').eq(-2).after(insert); },
            style: '#items li { height: 180px !important; }'
        },
        {
            name: 'secondhand',
            pageMatcher: /thriftshoppe/,
            itemNameObject: $('.content table td a div:nth-child(2)')
        },
        {
            name: 'employment',
            pageMatcher: /employment/,
            itemNameObject: $('.content table td[colspan=2]'),
            itemNameMatch: / of: (.*)Time:/,
            insert: (e, insert) => { return e.parent().find('br').eq(1).before(insert); }
        },
        {
            name: 'kadoatery',
            pageMatcher: /kadoatery/,
            itemNameObject: $('.content strong:nth-of-type(2)')
        },
        {
            name: 'island training',
            pageMatcher: /training/,
            itemNameObject: $('img[src*="/items/"]').parent().find('b').map((i, v) => v.firstChild),
            insert: (e, insert) => { return e.parent().next().after(insert); }
        },
        {
            name: 'pirate academy',
            pageMatcher:/academy/,
            itemNameObject: $('img[src*="/items/"]').parent().parent().find('b')
        }
    ]

    //////////////////////////////////////////////////////

    const loc = window.location.href;

    // Display price
    const page = pages.find((i) => {
        return loc.match(i.pageMatcher)
    });
    if( ['inventory'].includes(page?.name) ) { // for pages that fetch items with ajax call
        if (page?.name === 'inventory') {
            const observer = new MutationObserver(() => {
                markItems(page);
            });
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
        else if (page) {
            markItems(page);
        };
    }
    else if(page) {
        markItems(page);
    }
})();

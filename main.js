var SUN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sun" viewBox="0 0 16 16">
<path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
</svg>`;

var MOON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-moon-stars" viewBox="0 0 16 16">
<path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 0 1 .81.316.733.733 0 0 1-.031.893A8.349 8.349 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 0 1 6 .278zM4.858 1.311A7.269 7.269 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.316 7.316 0 0 0 5.205-2.162c-.337.042-.68.063-1.029.063-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286z"/>
<path d="M10.794 3.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387a1.734 1.734 0 0 0-1.097 1.097l-.387 1.162a.217.217 0 0 1-.412 0l-.387-1.162A1.734 1.734 0 0 0 9.31 6.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387a1.734 1.734 0 0 0 1.097-1.097l.387-1.162zM13.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.156 1.156 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.156 1.156 0 0 0-.732-.732l-.774-.258a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732L13.863.1z"/>
</svg>`;

var AUTO_UPDATE = [
    'bitcoin',
    'ethereum'
]

var tableData = [];
var itemsToRetrieve = [];
var idsToRetrieve = [];

// create xmlhttprequest object (no jQuery available)
function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        xhr = null;
    }
    return xhr;
}

// sets up refresh rate for altcoins on dashboard and performance page
function setAltCoinsRefreshRate() {

    if (tableData == undefined) {
        return;
    }

    var getPrices = function () {
        let url = "https://api.coingecko.com/api/v3/simple/price?ids=" + idsToRetrieve.join(',') + "&vs_currencies=usd";
        let xhr = createCORSRequest('GET', url);
        if (!xhr) {
            return;
        }

        xhr.onload = function () {
            let response = xhr.responseText

            if (response) {
                var responseJson = JSON.parse(response);

                for (var i = 0; i < itemsToRetrieve.length; i++) {

                    let price = '$' + parseFloat(responseJson[itemsToRetrieve[i].id].usd);
                    let ele = tableData.children[itemsToRetrieve[i].index].children[1].children[0];

                    ele.classList.remove('blink-price-down', 'blink-price-up');

                    ele.classList.add(
                        ele.innerText > price
                            ? 'blink-price-down'
                            : 'blink-price-up'
                    );

                    ele.innerText = price;
                }
            }
        };

        xhr.onerror = function () {
            return;
        };

        xhr.send();
    }

    setInterval(getPrices, 15000);
}

// collects the altcoins present in the dashboard and add them to the refreshable items list
function setAltCoinsToBeRefreshed() {
    tableData = document.querySelector('.table-responsive.expanded-performance-table table tbody');

    if (tableData == undefined) {
        return;
    }

    for (var i = 0; i < tableData.childElementCount; i++) {
        let id = tableData.children[i].children[0].dataset.href.split('/')[2];

        if (AUTO_UPDATE.indexOf(id) < 0) {
            idsToRetrieve.push(id);
            itemsToRetrieve.push({
                index: i,
                id: id
            });
        }
    }
}

// on performance page, gets the average cost + shib price and udpates the grid, similar can be done for other coins.
function setShibOnPerformancePage() {

    if (window.location.href.indexOf('performance') <= 0 ||
        localStorage.getItem('api-key') == undefined) {
        return;
    }

    /* 
        You can find out what's your api key just watching the graphql requests made.
        Once you know the key, just add it to your localstorage like this:  localStorage.setItem('api-key', 'xxx')
        After that, this method will execute the call to the api and set up the shib avg price
    */
    let apiKey = localStorage.getItem('api-key');
    let url = 'https://www.cointracker.io/api/' + apiKey + '/graphql';
    let xhr = createCORSRequest('POST', url);
    if (!xhr) {
        return;
    }

    xhr.onload = function () {
        let data = JSON.parse(xhr.responseText).data;
        let shibData = data.portfolio.currencies.find(x => x.currency.symbol === 'SHIB');

        for (var i = 0; i < itemsToRetrieve.length; i++) {
            if (itemsToRetrieve[i].id !== 'shiba-inu')
                continue;

            let priceEle = tableData.children[itemsToRetrieve[i].index].children[1].children[0];
            priceEle.innerText = '$' + parseFloat(shibData.currency.price).toFixed(6);

            let avgCostEle = tableData.children[itemsToRetrieve[i].index].children[3].children[0].children[1];
            avgCostEle.innerText = '$ ' + parseFloat(shibData.averageCostBasis).toFixed(6) + ' per SHIB';
        }
    };

    xhr.onerror = function (error) {
        console.log(error);
    };

    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(JSON.stringify({
        operationName: "PortfolioQuery",
        query: "query PortfolioQuery($performanceDuration: PerformanceDuration, $toDate: DateTime, $limit: Int) {\n  userInfo {\n    baseCurrency {\n      type\n      symbol\n      priceUsd\n      __typename\n    }\n    __typename\n  }\n  portfolio(performanceDuration: ALL_TIME, toDate: $toDate, limit: $limit) {\n    marketValue\n    netFiat\n    costBasis\n    allTimeReturn\n    allTimeReturnPercent\n    totalReturnOnInvestment\n    totalReturnOnInvestmentPercent\n    oneDayReturn\n    oneDayReturnPercent\n    netTotalDeposits\n    netTotalWithdrawals\n    hasSubscription\n    exchangeFunds {\n      value\n      percent\n      __typename\n    }\n    currencies {\n      currency {\n        type\n        cmcId\n        symbol\n        name\n        price\n        marketCap\n        percentChange24h\n        iconUrlFromInfo\n        __typename\n      }\n      quantity\n      marketValue\n      costBasis\n      averageCostBasis\n      allTimeReturn\n      allTimeReturnPercent\n      totalReturnOnInvestment\n      totalReturnOnInvestmentPercent\n      netTotalWithdrawals\n      netTotalDeposits\n      portfolioPercent\n      error\n      __typename\n    }\n    fiats {\n      currency {\n        symbol\n        name\n        price\n        __typename\n      }\n      quantity\n      __typename\n    }\n    userAssets {\n      currency {\n        symbol\n        name\n        price\n        __typename\n      }\n      quantity\n      __typename\n    }\n    __typename\n  }\n  performanceHistory(performanceDuration: $performanceDuration) {\n    hasAccess\n    noAccessMessage\n    edges {\n      date\n      marketValue\n      costBasis\n      netTotalDeposits\n      netTotalWithdrawals\n      totalReturnOnInvestment\n      totalReturnOnInvestmentPercent\n      returnOnInvestment\n      returnOnInvestmentPercent\n      __typename\n    }\n    __typename\n  }\n  taxLossHarvest {\n    taxLossTotals {\n      potentialSavings\n      unrealizedLoss\n      __typename\n    }\n    __typename\n  }\n}",
        variables: {
            limit: null,
            performanceDuration: "ALL_TIME",
            toDate: null
        }
    }));
}

// sets the icon of the switch theme button (moon or sun)
function updateSwitchThemeButton(icon) {
    let themeButton = document.getElementById('dark-theme-button');
    themeButton.innerHTML = icon;
}

// changes the theme and updates the button icon
function changeTheme() {

    let icon = '';

    if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('dark-theme');
        localStorage.removeItem('theme');
        icon = MOON_SVG;
    } else {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark-theme')
        icon = SUN_SVG;
    }

    updateSwitchThemeButton(icon);
}

// creates the button on the screen (bottom right)
function addThemeButton() {

    var button = document.createElement("div");
    button.id = "dark-theme-button-wrapper";
    button.title = "Dark Theme On/Off";
    button.innerHTML =
        `<a id="dark-theme-button">` +
        MOON_SVG +
        `</a>`;

    var body = document.getElementsByTagName("body")[0];
    body.appendChild(button);

    button.addEventListener("click", function () {
        changeTheme();
    });
}

// once the pages load, retrieves last theme selction and applies to the page
function loadCustomerTheme() {

    if (localStorage.getItem('theme') != undefined) {
        document.body.classList.add('dark-theme');
        updateSwitchThemeButton(SUN_SVG);
    }
}

// after the page is loaded, sets up app
document.onreadystatechange = function () {

    if (document.readyState == "complete") {

        setTimeout(function () {

            setAltCoinsToBeRefreshed();
            setAltCoinsRefreshRate();

            setShibOnPerformancePage();
        }, 1000);
    }
}

// immediately runs
addThemeButton();
loadCustomerTheme();
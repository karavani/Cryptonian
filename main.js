const TWO_MINUTES = 120000;
let allCoinsMap = new Map();
let allCoinsMapBySymbol = new Map();
let coinMoreInfoMap = new Map();
let checkBoxSet = new Set();
let checkBoxTempSetModal;
let dataPoints = [];
loadAllCoins();
singlePageApplication();



// <---------creat all coins cards------------->
function creatCoinsCard(singleCoin) {
    let singleCoinDiv = $('<div class="singleCoinDiv">' + '<strong>' + singleCoin.name + '</strong>' + '</br>' + singleCoin.symbol + '<div/>');
    singleCoinDiv.prepend("<label class='switch'><input id='checkBox' name=" + singleCoin.symbol + " class=" + singleCoin.symbol + " type='checkbox'><span class='slider round'></span></label>");
    singleCoinDiv.append('<img src="' + singleCoin.image + '" class="coinsImg"/>');
    singleCoinDiv.append("<button class='moreInfoBtn'></button></br></br>");
    singleCoinDiv.attr('id', singleCoin.id);
    singleCoinDiv.attr('name', singleCoin.symbol);
    $('#homePageDiv').append(singleCoinDiv);
}
// <----------------------------------->



// <-----------load all coins cards from the server---------------->
function loadAllCoins() {
    $.get("https://api.coingecko.com/api/v3/coins").then(
        function (data) {
            for (let i = 0; i < data.length; i++) {
                let singleCoin = {
                    id: data[i].id,
                    symbol: data[i].symbol,
                    name: data[i].name,
                    image: data[i].image.small
                }
                creatCoinsCard(singleCoin);
                allCoinsMap.set(singleCoin.id, singleCoin);
                allCoinsMapBySymbol.set(singleCoin.symbol, singleCoin);
            }
            //<------------------Toggle Button-------------------------->
            $('.switch input[type="checkbox"]').on('change', function () {
                if (this.checked) {
                    if (checkBoxSet.size < 5) {
                        checkBoxSet.add(this.name);
                    }
                    else {
                        checkBoxTempSetModal = new Set(checkBoxSet);
                        checkBoxTempSetModal.add(this.name);
                        openModalValidate();
                    }
                }
                else {
                    checkBoxSet.delete(this.name);
                }
            });
            //<------------------More Info Button-------------------------->
            $('.moreInfoBtn').click(function () {
                if (coinMoreInfoMap.has($(this).parent().attr('id'))) {
                    let CoinMoreInfoDetails = coinMoreInfoMap.get($(this).parent().attr('id'));
                    if ($(this).hasClass("moreInfoBtn")) {
                        $(this).removeClass("moreInfoBtn").addClass("lessInfoBtn");
                        $(this).parent().css("height", "200px");
                        $(this).parent().append('<div class="showMoreInfoDiv">' + '₪' + CoinMoreInfoDetails.ils + '<br>' + '€' + CoinMoreInfoDetails.eur + '<br>' + '$' + CoinMoreInfoDetails.usd + '</div>');
                    }

                    else {
                        $(this).removeClass("lessInfoBtn").addClass("moreInfoBtn");
                        $(this).parent().children(".showMoreInfoDiv").remove();
                        $(this).parent().css("height", "130px");
                    }
                }
                else {
                    // <-----------Add progress bar------------->
                    let loadingGif = document.createElement("img");
                    loadingGif.src = "spin-1s-200px.gif";
                    loadingGif.style = "width : 50%";
                    loadingGif.style = "height : 40%";
                    let thisDiv = $(this).parent();
                    thisDiv.append(loadingGif);
                    let thisBtn = $(this);
                    $.get("https://api.coingecko.com/api/v3/coins/" + $(this).parent().attr('id')).then(
                        function (data) {
                            let moreInfoDetails = {
                                id: data.id,
                                image: data.image.small,
                                ils: data.market_data.current_price.ils,
                                eur: data.market_data.current_price.eur,
                                usd: data.market_data.current_price.usd
                            }
                            saveCoinMoreInfoInCach(moreInfoDetails);
                            if (thisBtn.hasClass("moreInfoBtn")) {
                                thisBtn.removeClass("moreInfoBtn").addClass("lessInfoBtn");
                                thisDiv.css("height", "200px");
                                thisDiv.append('<div class="showMoreInfoDiv">' + '₪' + moreInfoDetails.ils + '<br>' + '€' + moreInfoDetails.eur + '<br>' + '$' + moreInfoDetails.usd + '</div>');
                            }

                            else {
                                thisBtn.removeClass("lessInfoBtn").addClass("moreInfoBtn");
                                thisDiv.children(".showMoreInfoDiv").remove();
                                thisDiv.css("height", "130px");
                            }

                            // <---Remove progress bar---->
                            loadingGif.remove();


                        })
                        .catch(() => console.log("Failedddd", +'status:' + status));
                }
            });
        })
}
// <----------------------------------------------------------------------------->



// <------------------save in cache more info details---------------------->
function saveCoinMoreInfoInCach(moreInfoDetails) {
    coinMoreInfoMap.set(moreInfoDetails.id, moreInfoDetails);
    setTimeout(function () {
        coinMoreInfoMap.delete(moreInfoDetails.id);
    }, TWO_MINUTES);
}
// <---------------------------------------------->



// <------------------------creat coins to modal function---------------------------->
function creatCoinsToModal(symbol) {
    let singleCoinDiv = $('<div class="modalCoinsDiv">' + '<strong>' + symbol + '</strong>' + '<div/>');
    let label = $("<label class='switchModal'>")
    let checkBox = $("<input id='checkBox' name=" + symbol + " class=" + symbol + " type='checkbox' checked=true>");
    let span = $("<span class='slider round'></span>");
    label.append(checkBox, span);
    singleCoinDiv.append(label);
    checkBox.on('change', function () {
        if (this.checked) {
            checkBoxTempSetModal.add(symbol);
        }
        else {
            checkBoxTempSetModal.delete(symbol);
        }
        if (checkBoxTempSetModal.size > 5) {
            $("#saveChangesBtn").prop("disabled", true);
        }
        else {
            $("#saveChangesBtn").prop("disabled", false);
        }
    });
    $(".modal-body").append(singleCoinDiv);
}
// <--------------------------------------------------->



// <--------------------modal functions------------------->
function openModalValidate() {
    modal.style.display = "block";
    for (let coin of checkBoxTempSetModal) {
        creatCoinsToModal(coin);
    }
}

function saveChangesInModal() {
    $(".switch input[type='checkbox']:checked").each(function () {
        if (!checkBoxTempSetModal.has($(this).attr('name'))) {
            $(this).prop('checked', false);
        }
    })
    checkBoxSet = checkBoxTempSetModal;
    modal.style.display = "none";
    $('.modal-body').empty();
}
// <--------------------------------------------------->



// <--------------------Get the modal----------------->
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
    $(".switch input[type='checkbox']:checked").each(function () {
        if (!checkBoxSet.has($(this).attr('name'))) {
            $(this).prop('checked', false);
        }
    })
    $('.modal-body').empty();
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
        $(".switch input[type='checkbox']:checked").each(function () {
            if (!checkBoxSet.has($(this).attr('name'))) {
                $(this).prop('checked', false);
            }
        })
        $('.modal-body').empty();
    }
}
// <---------------------------------------------------------->



// <--------Single Page application to manipulate DOM---------->

function singlePageApplication() {
    $('#homePageBtn').on('click', function () {
        $('#searchDisplayDiv').empty();
        $('#homePageDiv').css('display', 'block');
        $('#homePageDiv > div').css('display', 'inline-block');
        $('#liveReportsPageDiv').css('display', 'none');
        $('#aboutPageDiv').css('display', 'none');
    })
    $('#liveReportsPageBtn').on('click', function () {
        if (!checkBoxSet.size) {
            return alert('You must select some coins first...');
        }
        else {
            liveReports();
            $('#searchDisplayDiv').empty();
            $('#liveReportsPageDiv').css('display', 'block');
            $('#homePageDiv').css('display', 'none');
            $('#aboutPageDiv').css('display', 'none');
        }
    })
    $('#aboutPageBtn').on('click', function () {
        $('#searchDisplayDiv').empty();
        $('#aboutPageDiv').css('display', 'block');
        $('#liveReportsPageDiv').css('display', 'none');
        $('#homePageDiv').css('display', 'none');
    })
}
// <----------------------------------------------->



// <---------------------slide Show ---------------------->

var slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
    showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
    showSlides(slideIndex = n);
}
function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("mySlides");
    var dots = document.getElementsByClassName("dot");
    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";
}
// <------------------------------------------------>



//  <---------------------Coins currencies chart script--------------------->
function liveReports() {
    // Create a string of the coins for the API get request
    let coinsSymbolsText = "";
    checkBoxSet.forEach(symbol => {
        coinsSymbolsText += symbol + ",";
    });
    coinsSymbolsText = coinsSymbolsText.slice(0, -1).toUpperCase();


    // Chart options
    let options = {
        exportEnabled: true,
        animationEnabled: true,
        title: {
            text: coinsSymbolsText + " to USD"
        },
        axisX: {
            title: "Time",
            valueFormatString: "HH:mm:ss"
        },
        axisY: {
            title: "Coin Value"
        },
        toolTip: {
            shared: true
        },
        legend: {
            cursor: "pointer",
            itemclick: toggleDataSeries
        },
        data: []
    };
    let chart = new CanvasJS.Chart("chartContainer", options);

    // Creating data from the list of coins choosen
    checkBoxSet.forEach(symbol => {
        options.data.push(createCoinGraphData(symbol.toUpperCase()));
    });
    let loadingGif = document.createElement("img");
    loadingGif.src = "https://media0.giphy.com/media/U7PN1wu5ucnhUvOBSV/giphy.gif";
    loadingGif.style = "width : 30%";
    loadingGif.classList.add('loadingGif');
    let thisDiv = $("#chartContainer");
    thisDiv.append(loadingGif);
    let updateData = function () {
        $.get("https://min-api.cryptocompare.com/data/pricemulti?fsyms=" + coinsSymbolsText + "&tsyms=USD").then(
            function (coins) {
                let time = new Date();

                options.data.forEach(coin => {
                    let newDataPoint = { x: time, y: coins[coin.name].USD };
                    coin.dataPoints.push(newDataPoint);
                });
                loadingGif.remove();
                chart.render();
            })
            .catch(() => console.log("Failed to retrieve coins' reports from server"));
    };
    // update chart's data every two second
    setInterval(function () { updateData() }, 2000);

    function createCoinGraphData(coinSymbol) {
        let dataPoints = [];
        let newCoinGraphData = {
            type: "spline",
            name: coinSymbol,
            showInLegend: true,
            xValueFormatString: "HH:mm:ss",
            dataPoints: dataPoints
        };
        return newCoinGraphData;
    }

    function toggleDataSeries(e) {
        if (typeof (e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
            e.dataSeries.visible = false;
        } else {
            e.dataSeries.visible = true;
        }
        e.chart.render();
    }
}

// <---------------------------------------------------------------------------->



// <---------------------Search function--------------------------->
$('#searchBtn').click(function () {
    let searchTextInput = $('#searchInput').val().toLowerCase().trim();
    if (allCoinsMap.has(searchTextInput)) {
        $('#homePageDiv > div').css('display', 'none');
        $('#homePageDiv').css('display', 'block');
        $('#liveReportsPageDiv').css('display', 'none');
        $('#aboutPageDiv').css('display', 'none');
        $('#homePageDiv > #' + searchTextInput + '').css('display', 'block');
        $('#homePageDiv > #' + searchTextInput + '> div').css('display', 'block');
    }
    else if (allCoinsMapBySymbol.has(searchTextInput)) {
        $('#homePageDiv > div').css('display', 'none');
        $('#homePageDiv').css('display', 'block');
        $('#liveReportsPageDiv').css('display', 'none');
        $('#aboutPageDiv').css('display', 'none');
        $('#homePageDiv > div[name= ' + searchTextInput + '] ').css('display', 'block');
        $('#homePageDiv > div[name= ' + searchTextInput + '] div').css('display', 'block');
    }
    else {
        alert('invalid search');
    }
    $('#searchInput').val('');
});
// <---------------------------------------------------->

/*
    Intergalactic Highway Demo

    Some Support Functions
    Christopher Caleb
    http://www.yeahbutisitflash.com
*/

var spinnerRotation = 0;
var spinnerId = null;
var keyOverlayOpacity = 1;

function setupLoadingSpinner() {
    spinnerId = setInterval(updateSpinner, 1000/60);
    //rotateSpinner(90);
    resizeUI();
}

function updateSpinner() {
    spinnerRotation += 4;
    rotateSpinner(spinnerRotation);
}

function rotateSpinner(d) {
    $("#spinner").css({'top': (window.innerHeight - 261) / 2});
    $("#spinner").css({'left': (window.innerWidth - 261) / 2});
    $("#spinner").css({
        '-moz-transform': 'rotate(' + d + 'deg)',
        '-webkit-transform': 'rotate(' + d + 'deg)',
        '-o-transform': 'rotate(' + d + 'deg)',
        '-ms-transform': 'rotate(' + d + 'deg)',
        'transform': 'rotate(' + d + 'deg)'
    });
}

function removeSpinner() {
    $("#spinner").css({'visibility': 'hidden'});
    $("#rotateLeft").css({'visibility': 'visible'});
    $("#rotateRight").css({'visibility': 'visible'});
    $("#shoot").css({'visibility': 'visible'});
    $("#boost").css({'visibility': 'visible'});
    clearInterval(spinnerId);
}

function reduceKeyOverlayOpacity() {
    keyOverlayOpacity -= 0.05;
    if (keyOverlayOpacity < 0) keyOverlayOpacity = 0;
    $("#rotateLeft").css({'opacity':keyOverlayOpacity});
    $("#rotateRight").css({'opacity':keyOverlayOpacity});
    $("#shoot").css({'opacity':keyOverlayOpacity});
    $("#boost").css({'opacity':keyOverlayOpacity});
}

function resizeUI() {
    var w = $("#shoot").css('width');
    w = parseInt(w);
    var posX = (window.innerWidth - w) / 2;
    $("#shoot").css({'left':posX + 'px'});

    w = $("#boost").css('width');
    w = parseInt(w);
    posX = (window.innerWidth - w) / 2;
    $("#boost").css({'left':posX + 'px'});
}

$(document).ready(function ($) {
    debugger
    var userId = sessionStorage.getItem("token");
    if (userId == null || userId == '') {
        var url = '../index.html'
        $(location).attr("href", url);

    }

});
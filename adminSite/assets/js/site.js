$(document).ready(function($) {

    var token = localStorage.getItem("token");
    if (token == null || token == '') {
        var url = '../index.html';
        $(location).attr("href", url);
    }
});
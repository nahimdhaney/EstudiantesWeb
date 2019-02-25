$(document).ready(function($) {
    var userId = localStorage.getItem("token");
    if (userId == null || userId == '') {
        var url = '../index.html'
        $(location).attr("href", url);
    }
});
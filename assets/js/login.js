$(document).ready(function ($) {
    var key = 'A10BB4B705310FB670185286C2B2367365A1CA2C';
    $("#loginButton").click(function () {
        var registro = $("#registroNumber").val()
        var ping = $("#pingNumber").val()
        debugger
        var usuario = new Object();
        usuario.username = registro;
        usuario.password = ping;
        if (registro != '' && ping != '') {
            jQuery.ajax({
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                'type': 'POST',
                'url': "http://sisnur.nur.edu:8085/api/Registros/Login",
                'data': JSON.stringify(usuario),
                'dataType': 'json',
                'success': resultado
            });
        }

    });

    function resultado(resultado) {
        if (resultado != '') {
            var url = 'adminSite/dashboard.html'
            sessionStorage.setItem("token", resultado);
            sessionStorage.setItem("usrLog", JSON.stringify(resultado.Message));
            $(location).attr("href", url);
        } else {
            $('#alertError').show();
        }
    }

})
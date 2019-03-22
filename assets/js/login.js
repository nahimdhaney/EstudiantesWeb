$(document).ready(function($) {
    var userId = localStorage.getItem("token");
    if (userId != null && userId != '') {
        var url = 'adminSite/dashboard.html'
        $(location).attr("href", url);
    }

    var key = 'A10BB4B705310FB670185286C2B2367365A1CA2C';
    $("#loginButton").click(function() {
        var registro = $("#registroNumber").val()
        var ping = $("#pingNumber").val()
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
                'success': resultado,
                'error': errorLogin
            });
        }
        return false
    });

    function resultado(resultado) {
        if (resultado.includes("Bloqueo") || resultado.includes("error") || resultado == '') {
            swal("Bloqueo", "Tiene deuda pendiente.", "error")
        } else {
            localStorage.setItem("token", resultado);
            localStorage.setItem("usrLog", JSON.stringify(resultado.Message));
            var url = 'adminSite/dashboard.html'
            $(location).attr("href", url);
        }
    }

    function errorLogin() {
        swal("Error", "Usuario o Pin incorrectos.", "error")
    }

})
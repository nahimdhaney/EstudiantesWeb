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
                'url': "http://wsnotas.nur.edu:8880/api/Registros/Login",
                'data': JSON.stringify(usuario),
                'dataType': 'json',
                'success': resultado,
                'error': errorLogin
            });
        }
        return false
    });

    function resultado(resultado) {
        if ( resultado == '') {
            swal("Error", "Usuario o Pin incorrectos.", "error")
            return;
        }
        localStorage.setItem("token", resultado);
        obtenerBloqueo(resultado)
        var url = 'adminSite/dashboard.html'
        $(location).attr("href", url);
    }
    function obtenerBloqueo(token)
        {
            $.ajax({
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                'type': 'POST',
                 async: false,
                'url': "http://sisnur.nur.edu:8085/api/Registros/GetAlumnoBloqueo",
                'dataType': 'json',
            }).done(function(response) {
                
                var data = response.Data.toLowerCase();
                localStorage.setItem("tieneBloqueo", data.includes('bloqueo') ?  1 :0);
            });
        }
    function errorLogin() {
        swal("Error", "Usuario o Pin incorrectos.", "error")
    }

})
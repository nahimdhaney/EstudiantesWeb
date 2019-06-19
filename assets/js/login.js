$(document).ready(function($) {
    var userId = localStorage.getItem("token");
    if (userId != null && userId != "") {
        var url = "adminSite/dashboard.html";
        $(location).attr("href", url);
    }

    $("#loginButton").click(function() {
        $("#loader").removeAttr("style");
        $("#loginButton").attr("style", "display:none");

        var registro = $("#registroNumber").val();
        var ping = $("#pingNumber").val();
        var usuario = new Object();
        usuario.username = registro;
        usuario.password = ping;

        if (registro != "" && ping != "") {
            jQuery.ajax({
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                type: "POST",
                url: "http://wsnotas.nur.edu:8880/api/Registros/Login",
                data: JSON.stringify(usuario),
                dataType: "json",
                success: resultado,
                error: errorLogin
            });
        }
        return false;
    });

    function resultado(resultado) {
        if (resultado == "") {
            $("#loader").attr("style", "display:none");
            $("#loginButton").removeAttr("style");
            swal("Error", "Usuario o Pin incorrectos.", "error");
            return;
        }
        localStorage.setItem("token", resultado);
        obtenerBloqueo(resultado);
        var url = "adminSite/dashboard.html";
        $(location).attr("href", url);
    }

    function obtenerBloqueo(token) {
        $.ajax({
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            type: "POST",
            async: false,
            url: "http://sisnur.nur.edu:8085/api/Registros/GetAlumnoBloqueo",
            dataType: "json"
        }).done(function(response) {
            var data = response.Data.toLowerCase();
            localStorage.setItem("tieneBloqueo", data.includes("bloqueo") ? 1 : 0);
        });
    }

    function errorLogin() {
        $("#loader").attr("style", "display:none");
        $("#loginButton").removeAttr("style");
        swal("Error", "Usuario o Pin incorrectos.", "error");
    }
});
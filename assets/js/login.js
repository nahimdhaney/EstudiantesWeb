var boolModoDevLocal = 0;

$(document).ready(function() {

    if (location.protocol !== 'https:' && boolModoDevLocal == 0) {
        location.replace(`https:${location.href.substring(location.protocol.length)}`);
    }

    var token = localStorage.getItem("token");
    if (token != null && token != "") {
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
                    "Content-Type": "application/json",
                },
                type: "POST",
                url: "https://nurssl.nur.edu:8182/api/Registros/Login",
                data: JSON.stringify(usuario),
                dataType: "json",
                success: function(resultado) {
                    if (resultado == "") {
                        $("#loader").attr("style", "display:none");
                        $("#loginButton").removeAttr("style");
                        swal("Error", "Usuario o Pin incorrectos.", "error");
                        return;
                    }
                    localStorage.setItem("token", resultado);
                    obtenerBloqueo(resultado);
                    window.location = "adminSite/dashboard.html";
                },
                error: function() {
                    $("#loader").attr("style", "display:none");
                    $("#loginButton").removeAttr("style");
                    swal("Error", "Usuario o Pin incorrectos.", "error");
                },
            });
        }
        return false;
    });


});

function obtenerBloqueo(token) {
    $.ajax({
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
        type: "POST",
        url: "https://nurssl.nur.edu:8182/api/Registros/GetAlumnoBloqueo",
        dataType: "json",
    }).done(function(response) {
        var data = response.Data.toLowerCase();
        localStorage.setItem("tieneBloqueo", data.includes("bloqueo") ? 1 : 0);
    });
}
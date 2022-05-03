var boolModoDevLocal = 0;

$(document).ready(function() {

    if (location.protocol !== 'https:' && boolModoDevLocal == 0) {
        location.replace(`https:${location.href.substring(location.protocol.length)}`);
    }

    var datos = new Object();
    datos.pLlave = findGetParameter("key");
    jQuery.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        'type': 'POST',
        'url': "https://nurssl.nur.edu:8182/api/Registros/ValidarEmail",
        'dataType': 'json',
        'data': JSON.stringify(datos),
        'success': function(response) {
            $("#ConfirmacionDiv").show();
            if (response.Status)
                $("#Mensaje_txt").html("<h5>Confirmación completada</h5> Gracias por confirmar su correo electrónico. <br><br><a href='https://notas2.nur.edu/'>www.notas2.nur.edu/</a>");
            else
                $("#Mensaje_txt").html("Lo sentimos, esta dirección de verificación ha expirado. <br><br><a href='https://notas2.nur.edu/'>www.notas2.nur.edu/</a>");
        },
        "error": function() {
            $("#ConfirmacionDiv").show();
            $("#Mensaje_txt").html("No fue posible verificar su correo, intente registrarlo nuevamente. <br><br><a href='https://notas2.nur.edu/'>www.notas2.nur.edu/</a>");
        }
    });

    terminarMainCargado();
});

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function(item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

function comenzarMainCargado() {
    $("#mainContainer").attr("style", "display:none");
    $("#mainLoader").removeAttr("style");
}

function terminarMainCargado() {
    $("#mainLoader").attr("style", "display:none");
    $("#mainContainer").removeAttr("style");
}
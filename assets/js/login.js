$(document).ready(function ($) {
    var key = 'A10BB4B705310FB670185286C2B2367365A1CA2C';
    $("#loginButton").click(function () {
        console.log('hola Mundo')
        var registro = $("#registroNumber").val()
        var ping = $("#pingNumber").val()
        var usuario = new Object();
        usuario.Registro = registro;
        usuario.Pin = ping;
        if (registro != '' && ping != '') {
            jQuery.ajax({
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                'type': 'POST',
                'url': "http://biblio.nur.edu/NurServices/api/NotasWeb/Login",
                'data': JSON.stringify(usuario),
                'dataType': 'json',
                'success': resultado
            });
        }
    });

    function resultado(resultado) {
        var iDUsuario = $("#registroNumber").val()
        var id = resultado.response.id;
        var tipo = resultado.response.type;
        if (resultado.success) {
            sessionStorage.setItem("usuarioId", iDUsuario);
            sessionStorage.setItem("idUser", id); // este es el ID
            sessionStorage.setItem("usuarioTipo", tipo);
            sessionStorage.setItem("usrLog", JSON.stringify(resultado.response));
            var url = "index.html";
            $(location).attr('href', url);
        } else {
            $("#respuesta").html(resultado.message);
        }
    }

})
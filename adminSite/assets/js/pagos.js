var botonPagoVisible = 1;

$(document).ready(function($) {

    terminarCargado();

});

function comenzarCargado() {
    $('.loader').css('display', 'block');
}

function terminarCargado() {
    $('.loader').css('display', 'none');
}


function showPuntosPago() {
    $('.formapago').css('display', 'none');
    $('.puntospago').css('display', 'block');
}

function showPagoOnline() {
    var token = localStorage.getItem("tokenPagosNur");
    $('.formapago').css('display', 'none');
    if (token != null && token != "") {
        $('.pagosdiv').css('display', 'block');
        consultarCXC();
        return;
    }
    $('.logindiv').css('display', 'block');
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
        comenzarCargado();
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
                    swal("Error", "Usuario o Pin incorrectos.", "info");
                    return;
                }
                localStorage.setItem("tokenPagosNur", resultado);
                consultarCXC();
                $('.logindiv').css('display', 'none');
                $('.pagosdiv').css('display', 'block');
            },
            error: function() {
                $("#loader").attr("style", "display:none");
                $("#loginButton").removeAttr("style");
                swal("Error", "Usuario o Pin incorrectos.", "info");
                terminarCargado();
            },
        });
    }
    return false;
});

function obtenerNombre() {
    var token = localStorage.getItem("tokenPagosNur");
    if (token != "") {
        $.ajax({
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            type: "POST",
            url: "https://nurssl.nur.edu:8182/api/Registros/GetAlumnoInfo",
            dataType: "json",
            success: function(resultado) {
                const {
                    SREGISTRO,
                    SAPELLIDOP,
                    SAPELLIDOM,
                    SNOMBRES,
                    SCELULAR,
                    STELEFONO,
                    SEMAIL,
                    LHORASERVICIO
                } = resultado.Data;
                var NombreCompleto = SREGISTRO + " " + SNOMBRES + " " + SAPELLIDOP + " " + SAPELLIDOM;
                $(".nombreEstudiante").text(NombreCompleto);
            },
            error: errorSesion,
        });
    }
}

function consultarCXC() {
    var token = localStorage.getItem("tokenPagosNur");
    var data = new Object();
    data.pPeriodoId = 0;
    comenzarCargado();
    jQuery.ajax({
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
        type: "POST",
        data: JSON.stringify(data),
        url: "https://nurssl.nur.edu:8182/api/Registros/GetPlanPagos",
        dataType: "json",
        success: mostrarResultadoCxc,
        error: errorSesion,
    });
}

function mostrarResultadoCxc(response) {
    var planes = response.Data;
    var carrera = "";
    var centro = "";
    var periodo = "";
    var datos = [];

    for (let index = 0; index < planes.length; index++) {
        var detalles = planes[index].DETALLE;
        var cuotas = detalles.length;
        var rowPlan = [];
        var arrayPlanes = [];
        var saldoTotal = 0;
        var pagadoTotal = 0;
        var cuotaTotal = 0;
        for (let aux = 0; aux < detalles.length; aux++) {
            var rowDetalles = detalles[aux];
            var nroCuota = rowDetalles.LNROCUOTA;
            var fecha = rowDetalles.DTFECHAVENC;
            fecha = formatearFecha(fecha);
            var cuota = rowDetalles.DMONTO;
            var pagado = rowDetalles.DPAGADO;
            var saldo = rowDetalles.SALDO;
            var estado = rowDetalles.SESTCUOTA_DSC;
            saldoTotal = saldo + saldoTotal;
            pagadoTotal = pagado + pagadoTotal;
            cuotaTotal = cuota + cuotaTotal;

            rowPlan = {
                nroCuota,
                fecha,
                cuota,
                pagado,
                saldo,
                estado
            };
            arrayPlanes.push(rowPlan);
        }

        var datosPlanAlumno = planes[index].PLAN;
        planpagosId = datosPlanAlumno.LPLANPAGOS_ID;
        carrera = datosPlanAlumno.SCARRERA_DSC;
        centro = datosPlanAlumno.SCENTRO_DSC;
        centro = titleCase(centro);
        periodo = datosPlanAlumno.SPERIODO_DSC;

        var items = {
            planpagosId,
            carrera,
            centro,
            cuotas,
            arrayPlanes,
            saldoTotal,
            pagadoTotal,
            cuotaTotal,
            periodo
        };

        if (saldoTotal > 0) {
            datos.push(items);
        }
    }
    datos = sortByKey(datos, "carrera");
    var final = "";

    for (let index = 0; index < datos.length; index++) {
        var planRow = datos[index].arrayPlanes;
        var detalleRow = "";
        var html =
            '<div class="row"><div class="col-md-12"><div class="card"><div class="header"><h3 class="nombreEstudiante"></h3><h4 class="title"><strong>Plan de pagos ' + datos[index].periodo + `</strong></h4>
      <p class="title">` +
            datos[index].carrera +
            `</p><p class="title">` +
            datos[index].centro +
            `</p></div>
      <div class="content table-responsive table-full-width"><table id="` + datos[index].planpagosId + `" class="table table-hover table-striped">
      <thead><th>#</th><th>Fecha Vencimiento</th><th>Cuota (Bs)</th><th>Pagado (Bs)</th><th>Saldo (Bs)</th><th>Estado</th>
      </thead><tbody>`;
        var htmlEnd =
            `<tr class="filaFinal"><td colspan="2"><strong>Total</strong></td><td><strong>` +
            fnDosDigitos(datos[index].cuotaTotal) +
            `</strong></td><td><strong>` +
            fnDosDigitos(datos[index].pagadoTotal) +
            `</strong></td><td><strong>` +
            fnDosDigitos(datos[index].saldoTotal) +
            `</strong></td><td></td></tr></tbody></table></div></div></div></div>`;

        var botonPagoPuesto = 0;
        for (let aux = 0; aux < planRow.length; aux++) {
            detalleRow +=
                "<tr><th>" +
                planRow[aux].nroCuota +
                "</th><td>" +
                planRow[aux].fecha +
                "</td><td>" +
                fnDosDigitos(planRow[aux].cuota) +
                "</td><td>" +
                fnDosDigitos(planRow[aux].pagado) +
                "</td><td>" +
                fnDosDigitos(planRow[aux].saldo) +
                "</td><td>";

            if (planRow[aux].saldo > 0 && botonPagoPuesto == 0 && botonPagoVisible == 1) {
                detalleRow += "<a id='pago_btn_" + datos[index].planpagosId + "' class='btn btn-primary' href='javascript:tieneEmailValidoPago(" + datos[index].planpagosId + "," + fnDosDigitos(planRow[aux].saldo) + ")'><i class='fas fa-money-check-alt'></i> Pagar cuota</a>";
                botonPagoPuesto = 1;
            } else {
                detalleRow += planRow[aux].estado;
            }
            detalleRow += "</td></tr>";
        }
        final += html + detalleRow + htmlEnd;
    }

    if (final == "") {
        final = `<div class="row"><div class="col-md-12"><div class="card text-center"><div role="alert"><h2 class="alert-heading">No tiene planes de pago</h2>
<p>No tiene deudas pendientes en esta gestión.</p></div></div></div></div>`;
    }
    var parrafo = "<p>Para mas información sobre los planes de pago apersonarse por las oficinas Edificio Nur Central 4to piso <b>Dpto. Cuentas por cobrar</b>.</p>";
    $("#containerPlanPagos").append(final);
    $("#containerPlanPagos").append(parrafo);
    obtenerNombre();
    terminarCargado();
}

function formatearFecha(fecha) {
    var fechaFormat = new Date(fecha);
    return ("0" + fechaFormat.getDate()).slice(-2) + "/" + ("0" + (fechaFormat.getMonth() + 1)).slice(-2) + "/" + fechaFormat.getFullYear();
}

function titleCase(str) {
    var splitStr = str.toLowerCase().split(" ");
    for (var i = 0; i < splitStr.length; i++) {
        splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(" ");
}

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];

        if (typeof x == "string") {
            x = ("" + x).toLowerCase();
        }
        if (typeof y == "string") {
            y = ("" + y).toLowerCase();
        }

        return x < y ? -1 : x > y ? 1 : 0;
    });
}

function fnDosDigitos(numero) {
    if (numero == 0) {
        return 0;
    }
    return Number(numero).toFixed(2);
}


function errorSesion() {
    terminarCargado();
    localStorage.clear();
    location.reload();
}

function tieneEmailValidoPago(pPlanPagosId, pSaldo) {
    $('#nextPagoId_hf').val(pPlanPagosId);
    $('#nextPagoSaldo_hf').val(pSaldo);
    var token = localStorage.getItem("tokenPagosNur");
    jQuery.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        'type': 'POST',
        'url': "https://nurssl.nur.edu:8182/api/Registros/TieneEmailValido",
        'dataType': 'json',
        'success': function(response) {
            var esValido = response.Data;
            if (esValido == 1) {
                $("#campoMonto").html('Bs. <input type="number" id="montoPago_txt" min="' + fnDosDigitos(pSaldo) + '" value="' + fnDosDigitos(pSaldo) + '" class="text-center">');
                $('#MontoaPagarModal').modal('show');
            } else {
                //verPerfil();
                swal("Debe verificar su correo electrónico", "Esta verificación es indispensable para continuar con el proceso de Pago. Para verificar su correo electrónico: <br><br>" +
                    "   1. ingresar a <a href='https://notas2.nur.edu/' target='_blank'>https://notas2.nur.edu/</a>. <br>" +
                    "   2. Ir a 'Mi perfil'. <br>" +
                    "   3. Llenar el campo 'Email'. <br>" +
                    "   4. Presiona 'Guardar'. <br>" +
                    "   5. Revisar la bandeja de entreda de su correo electrónico, recibirá un mensaje para concluir la verificación.", "info");
            }
        },
        'error': function() {
            swal("", "No fue posible verificar su correo electrónico, intente mas tarde.", "info");
        }
    });
}

function GetLinkPago() {
    var pPlanPagosId = $('#nextPagoId_hf').val();
    var pSaldo = parseFloat($('#nextPagoSaldo_hf').val());
    var pMontoPago = parseFloat($('#montoPago_txt').val());
    if (pMontoPago < pSaldo) {
        swal("", "Para realizar el pago en línea su monto mínimo es " + fnDosDigitos(pSaldo) + ".", "info");
        return;
    } else {
        pSaldo = pMontoPago;
    }
    var datos = new Object();
    datos.pPlanPagosId = pPlanPagosId;
    datos.pSaldo = pSaldo;
    var token = localStorage.getItem("tokenPagosNur");
    jQuery.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        'type': 'POST',
        'url': "https://nurssl.nur.edu:8182/api/Registros/GetLinkPago",
        'dataType': 'json',
        'data': JSON.stringify(datos),
        'success': function(response) {
            var pPlanPagosId = $('#nextPagoId_hf').val();
            if (response.Data != "") {
                // Abrir ventana de PAGO
                $('#pago_btn_' + pPlanPagosId).text("En proceso...");
                $('#pago_btn_' + pPlanPagosId).attr("disabled", "disabled");
                $('#pago_btn_' + pPlanPagosId).prop("onclick", null).off("click");
                //setTimeout(window.open(response.Data, '_blank'), 3000);
                window.location.href = response.Data;
            } else {
                swal("", "No sentimos, no se pudo solicitar el pago en línea.", "info");
            }
        },
        'error': function() {
            swal("", "No sentimos, no se pudo solicitar el pago en línea.", "info");
            terminarCargado();
        }
    });
}

function logout() {
    localStorage.clear();
    location.reload();
}
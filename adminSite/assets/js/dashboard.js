var horasServicio = 120;
var promedio = 0;
var isPageLoaded = false;
var isHistorialCargado = false;
var esconderPeriodos = false;
var botonPagoVisible = 1;
var boolModoDev = 0;

$(document).ready(function() {

    if (location.protocol !== 'https:' && boolModoDev == 0) {
        location.replace(`https:${location.href.substring(location.protocol.length)}`);
    }

    var tieneBloqueo = parseInt(localStorage.getItem("tieneBloqueo"));
    if (tieneBloqueo == 1) {
        $("#titlePeriodos").remove();
        $("#containerNotas").remove();
        $("#containerAsistencia").remove();
        $("#containerDeuda").removeAttr("style");
        $("#containerDeuda").fadeIn();
    }

    cargarPagina();

    //tieneLaboratorio();
    $("#carrerasAlumno").change(function() {
        localStorage.setItem("carreraId", this.value);
        localStorage.setItem("carreraNombre", $(this).find("option:selected").text());
        if ($("#containerPensul").is(":visible")) {
            $("#isHistorialCargado").val(0);
            verHistorial();
        }
        $("#verMasPeriodos").remove();
        $(".periodosInvisibles").remove();
        comenzarMainCargado();
        $("#firstLoad").val("1");
        //cargarPagina();

        var arrayCarPer = JSON.parse(localStorage.getItem("arrayCarPer"));
        arrayCarPer.forEach(function(element) {
            var carreraIdStorage = localStorage.getItem("carreraId");
            if (element.LCARRERA_ID == carreraIdStorage) {
                localStorage.setItem("corrPeActId", element.LPERIODOACTUAL_ID);
                $("#periodoActual").text(element.LPERIODOACTUAL);
                cargarPeriodoYNotas();
                GetPeriodosOfertas();
                return;
            }
        });
    });

    $("#closePensul").click(function() {
        $("#containerNotas").show();
        $("#containerAsistencia").show();
        $("#containerPensul").hide();
    });

    $("#formCambiarPin").submit(function(event) {
        var pinAnterior = $("#pinAnterior").val();
        var nuevoPin = $("#nuevoPin").val();
        var repetirNuevoPin = $("#repetirNuevoPin").val();

        if (nuevoPin.localeCompare(repetirNuevoPin) == 0) {
            swal({
                title: "¿Estas seguro de cambiar tu Pin ?",
                type: "warning",
                text: "Cambiara tu contraseña para ingresar al sitio de notas y para conectarte al Wi-Fi de la universidad",
                showCancelButton: true,
                confirmButtonText: "Aceptar",
                cancelButtonText: "Cancelar",
            }).then((result) => {
                var token = localStorage.getItem("token");
                var usuario = new Object();
                usuario.pPinActual = pinAnterior;
                usuario.pPinNuevo = nuevoPin;
                $.ajax({
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token,
                    },
                    type: "POST",
                    data: JSON.stringify(usuario),
                    url: "https://nurssl.nur.edu:8182/api/Registros/UpdatePin",
                    dataType: "json",
                }).done(function(response) {
                    if (response.Status) {
                        swal("Operacion Exitosa!", "Pin actualizado correctamente!", "success");
                    } else {
                        swal("Error", "Hubo un error al actualizar su Pin", "error");
                    }
                });
            });
        } else {
            swal("Error", "Los Pines no son iguales.", "error");
        }
        $("#modalCambiarPin").modal("hide");
        $("#formCambiarPin")[0].reset();
        return false;
    });

    $("#verOferta").click(function() {
        //if (tieneOferta()) {
        if (true) {
            var periodoOferta = $("#periodosOferta").find(":selected").val();
            var carreraId = $("#carrerasAlumno").find(":selected").val();
            localStorage.setItem("periodoOferta", periodoOferta);
            localStorage.setItem("carreraId", carreraId);
            //window.location = "oferta.html";
            window.open("oferta.html", "_blank");
        } else {
            $("#modalOferta").hide();
            swal("", "No tienes ninguna materia ofertada aún", "info");
        }
    });

    $(document).on("click", "#verMasPeriodos", function() {
        if (esconderPeriodos == false) {
            $(".periodosInvisibles").removeAttr("style");
            $(this).children().text("Ver Menos Periodos");
            esconderPeriodos = true;
        } else {
            $(".periodosInvisibles").attr("style", "display:none");
            $(this).children().text("Ver Mas Periodos");
            esconderPeriodos = false;
        }
    });

    $(document).on("click", ".semestre", function() {
        $("#bodyClick").click();
        comenzarCargado();
        $("#containerNotas").show();
        $("#containerAsistencia").show();
        var periodoId = parseInt(JSON.parse($(this).attr("data-json")));
        var dperiodoActual = $(this).children("p").text();
        localStorage.setItem("MasterPeriodoActual", periodoId);
        $("#containerPensul").hide();
        $("#containerPerfil").hide();
        $("#containerPlanPagos").hide();
        $("#containerSimulador").hide();
        $("#containerHistorial").hide();
        $("#periodoActual").text(dperiodoActual);
        $("#dperiodoActual").val(dperiodoActual);
        $("#hperiodoActual").val(periodoId);
        obtenerNotas(periodoId);
    });

    /*   ACTUALIZAR EMAIL-TELEFONO   */
    $("#infoPersonal input[type=text]").click(function() {
        this.removeAttribute("readonly");
        $("#SaveEmail").show(300);
    });

    $("#SaveEmail").click(function() {
        var pTelefono = $("#inputTelefono").val().trim();
        var pCelular = $("#inputCelular").val().trim();
        var pEmail = $("#inputEmail").val().trim();
        if (pTelefono == "" || pCelular == "" || pEmail == "") {
            swal("Existen espacios vacios", "Complete sus datos por favor.", "info");
            return;
        } else {
            if (!validateEmail(pEmail)) {
                swal("Email inválido", "Ingrese una dirección de e-mail válido por favor.", "info");
                return;
            }
            var token = localStorage.getItem("token");
            var datos = new Object();
            datos.pTelefono = pTelefono;
            datos.pCelular = pCelular;
            datos.pEmail = pEmail;
            comenzarCargado();
            $("#SaveEmail").hide();
            if (token != "") {
                jQuery.ajax({
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token,
                    },
                    type: "POST",
                    url: "https://nurssl.nur.edu:8182/api/Registros/UpdateEmailTelefono",
                    dataType: "json",
                    data: JSON.stringify(datos),
                    success: function(response) {
                        if (response.Status) {
                            swal("Guardado exitoso", "Se ha enviado un mensaje para verificar su correo electrónico, revise su bandeja de entrada.", "success");
                            getEmailValido();
                        } else
                            swal("", "Algo anda mal, tus datos no se guardaron.", "info");
                        terminarCargado();
                    },
                    error: function() {
                        swal("", "Algo anda mal, tus datos no se guardaron.", "info");
                        terminarCargado();
                    },
                });
            }
        }
    });

    $('#inputTelefono, #inputCelular ').keyup(function() {
        this.value = (this.value + '').replace(/[^0-9]/g, '');
    });

    $("#otrosSitio_btn").click(function() {
        cargarLinks();
    });

    $(document).on("change", "#containerSimulador input[type=number]", function() {
        if ($(this).val() == "" || $(this).val() < 0) {
            $(this).val(0);
        } else if ($(this).val() > 100) {
            $(this).val(100);
        }
    });

    $("#btnSimular").click(function() {
        $("#containerNotas").hide();
        $("#containerAsistencia").hide();
        $("#containerPensul").hide();
        $("#containerPerfil").hide();
        $("#containerPlanPagos").hide();
        $("#containerHistorial").hide();
        $("#modalOfertaSimulador").hide();
        var periodoId = $("#periodosSimulador").find(":selected").val();
        var carreraId = $("#carrerasAlumno").find(":selected").val();
        localStorage.setItem("periodoOferta", periodoId);

        tieneLaboratorio();
        getCostosSemestre(periodoId, carreraId);
        setTimeout(function() {
            var auxPresencial = $("#cbCantMatPres").find(":selected").val();
            var auxSemipresencial = $("#cbCantMatSem").find(":selected").val();

            $("#cantMatPre").text(auxPresencial);
            $("#cantMatSemi").text(auxSemipresencial);

            var costoPresencial = $("#cmp").val();
            var costoSemi = $("#cms").val();
            var costoCarnet = $("#cce").val();
            var costoAdm = $("#cga").val();
            var costoSeguro = $("#csu").val();
            var costoLaboratorio = $("#cl").val();
            var periodoDsc = $("#prd").val();

            $("#periodoDsc").text(periodoDsc);


            costoPresencial = isEmpty(costoPresencial) ? 0 : parseFloat(costoPresencial);
            costoSemi = isEmpty(costoSemi) ? 0 : parseFloat(costoSemi);
            costoCarnet = isEmpty(costoCarnet) ? 0 : parseFloat(costoCarnet);
            costoAdm = isEmpty(costoAdm) ? 0 : parseFloat(costoAdm);
            costoSeguro = isEmpty(costoSeguro) ? 0 : parseFloat(costoSeguro);
            costoLaboratorio = isEmpty(costoLaboratorio) ? 0 : parseFloat(costoLaboratorio);

            var totalMatPres = parseFloat(auxPresencial) * costoPresencial;
            var totalMatSemi = parseFloat(auxSemipresencial) * costoSemi;


            $("#spMatPresencial").text(fnDosDigitos(totalMatPres));
            $("#spMatSemipresencial").text(fnDosDigitos(totalMatSemi));
            $("#spCarnetEst").text(fnDosDigitos(costoCarnet));
            $("#spSeguroEst").text(fnDosDigitos(costoSeguro));
            $("#spGastoAdm").text(fnDosDigitos(costoAdm));
            $("#spCostLab").text(fnDosDigitos(costoLaboratorio));

            var totalMaterias = totalMatPres + totalMatSemi;
            if ($(".filaPagoContado").css("display") != "none") {
                totalMaterias = calcularPagoContado(totalMaterias);
            }
            $("#spTotalCostMaterias").text(fnDosDigitos(totalMaterias));
            $("#spCostoFinalMat").text(fnDosDigitos(totalMaterias));


            var total = totalMaterias + parseFloat(costoCarnet) + parseFloat(costoSeguro);
            if ($("#trLaboratorio").css("display") != "none") {
                total = parseFloat(costoLaboratorio) + total;
            }

            $("#totalCost").text(fnDosDigitos(total));
            $("#containerSimulador").fadeIn();
        }, 1000);
    });

    $('input[name=pagoContado]').on('change', function() {
        if ($(this).prop("checked") == true) {
            resetComboCuotas();
            $('#cbCuotas').prop('disabled', true);
            $(".filaPagoContado").fadeIn(1000);
            var totalMat = $("#spTotalCostMaterias").text();
            $("#tableCostosMaterias").find("tbody").append(`<tr>
            <input type="hidden" name="totalCostMat" id="totalCostMat" value="` + totalMat + `">
            </tr>`);
            totalMat = parseFloat(totalMat);
            totalMat = calcularPagoContado(totalMat);
            mostrarCostosTotales(totalMat);
        } else if ($(this).prop("checked") == false) {
            $('#cbCuotas').prop('disabled', false);
            $(".filaPagoContado").fadeOut();
            var costoMatFijo = $("#totalCostMat").val();
            $("#totalCostMat").parent().remove();
            mostrarCostosTotales(costoMatFijo);
        }
    });

    $("input[name=otrosDesc]").on("change", function() {
        if ($(this).prop("checked") == true) {
            $(".otrosDesc").fadeIn(1000);
            $(".filaOtrosDesc").fadeIn(1000);
            $("#spOtrosDescuentos").text("0");
            $("#descPrese").val(0);
            $("#descSemip").val(0);

            var otrosDesc = $("#spOtrosDescuentos").text();
            if (otrosDesc != "0") {
                $("#spSigno").show();
            } else {
                $("#spSigno").hide();
            }
        } else if ($(this).prop("checked") == false) {
            $(".otrosDesc").fadeOut();
            $(".filaOtrosDesc").fadeOut();
            recalcular();
        }
    });
    $('#spCostoFinalMat').on('change', function() {
        var costoFinalMat = $("#spCostoFinalMat").text();
        var costoCarnet = $("#spCarnetEst").text();
        var costoSeguro = $("#spSeguroEst").text();
        // var costoAdm = $("#spGastoAdm").text();
        var costoLab = $("#spCostLab").text();
        var totales = parseFloat(costoFinalMat) + parseFloat(costoCarnet) + parseFloat(costoSeguro);

        if ($("#trLaboratorio").css("display") != "none") {
            totales = parseFloat(costoLab) + totales;
        }
        $("#totalCost").hide();
        $("#totalCost").text(fnDosDigitos(totales)).trigger('change');
        $("#totalCost").fadeIn(1000);
    });

    $("#cbCantMatPres").on('change', function() {
        var cantMatPresencial = $("#cbCantMatPres").find(":selected").val();
        resetearDescuento(cantMatPresencial, "descPrese");
        $("#cantMatPre").text(cantMatPresencial);
        var costoPresencial = $("#cmp").val();
        var totalMatPres = parseFloat(cantMatPresencial) * costoPresencial;
        $("#spMatPresencial").text(fnDosDigitos(totalMatPres)).trigger('change');
        otrosDescuentos();

    });

    $("#cbCantMatSem").on('change', function() {
        var cantMatSemipresencial = $("#cbCantMatSem").find(":selected").val();
        resetearDescuento(cantMatSemipresencial, "descSemip");
        $("#cantMatSemi").text(cantMatSemipresencial);
        var costoSemi = $("#cms").val();
        var totalMatSemi = parseFloat(cantMatSemipresencial) * costoSemi;
        $("#spMatSemipresencial").text(fnDosDigitos(totalMatSemi)).trigger('change');
        otrosDescuentos();
    });

    $('.spMaterias').on('change', function() {
        var cambio = false;

        if ($(".filaPagoContado").css("display") != "none") {
            $("#pagoContado").prop("checked", false).trigger('change');
            cambio = true;
        }

        var costoFinalSemi = $("#spMatSemipresencial").text();
        var costoFinalPres = $("#spMatPresencial").text();
        var totales = parseFloat(costoFinalSemi) + parseFloat(costoFinalPres);

        if ($(".filaOtrosDesc").css("display") != "none") {
            var otrosDes = $("#spOtrosDescuentos").text();
            otrosDes = parseFloat(otrosDes);
            totales = totales - otrosDes;
        }

        if ($(".filaPagoContado").css("display") != "none" && !cambio) {
            totales = calcularPagoContado(totales);
        }

        $("#spTotalCostMaterias").hide();
        $("#spTotalCostMaterias").text(fnDosDigitos(totales)).trigger('change');
        $("#spTotalCostMaterias").fadeIn(1000);
    });

    $('#spTotalCostMaterias').on('change', function() {
        var costoTotalMaterias = $("#spTotalCostMaterias").text();
        $("#spCostoFinalMat").text(costoTotalMaterias).trigger('change');
    });

    $('#cbCuotas').on('change', function() {
        $("#tableCuotas").remove();
        var nroCuotas = $("#cbCuotas").find("option:selected").val();
        if (isEmpty(nroCuotas)) {
            $("#div-izq").removeClass("col-md-4");
            $("#div-izq").addClass("col-md-5");

            $("#div-cen").removeClass("col-md-4");
            $("#div-cen").addClass("col-md-5");

            $("#div-der").hide();
            return;
        }

        $("#div-der").show();

        $("#div-izq").removeClass("col-md-5");
        $("#div-izq").addClass("col-md-4");

        $("#div-cen").removeClass("col-md-5");
        $("#div-cen").addClass("col-md-4");

        var costoFinalMat = $("#spCostoFinalMat").text();
        var costoCarnet = $("#spCarnetEst").text();
        var costoSeguro = $("#spSeguroEst").text();
        var costoLab = $("#spCostLab").text();

        costoFinalMat = parseFloat(costoFinalMat);
        costoCarnet = parseFloat(costoCarnet);
        costoSeguro = parseFloat(costoSeguro);
        costoLab = parseFloat(costoLab);

        var divDer = $("#div-der");
        var montoCuotas = costoFinalMat / nroCuotas;

        var table = "";

        for (let index = 0; index < nroCuotas; index++) {
            var aux = index + 1;
            if (index == 0) {
                table += `<tr class="primeraFila">
                <td class="itemCosto">` + aux + 'º Cuota' + `</td>
                <td class="table-der">` + fnDosDigitos((montoCuotas + costoCarnet + costoSeguro + costoLab)) + ` Bs.</td>
                </tr>`;
            } else {
                table += `<tr>
                <td class="itemCosto">` + aux + 'º Cuota' + `</td>
                <td class="table-der">` + fnDosDigitos(montoCuotas) + ` Bs.</td>
                </tr>`;
            }
        }

        divDer.append('<table id="tableCuotas" class="table"><tbody>' + table + '</tbody></table>');
    });

    $('#totalCost').on('change', function() {
        var nroCuotas = $("#cbCuotas").find("option:selected").val();
        if (!isEmpty(nroCuotas)) {
            $("#tableCuotas").remove();

            var costoFinalMat = $("#spCostoFinalMat").text();
            var costoCarnet = $("#spCarnetEst").text();
            var costoSeguro = $("#spSeguroEst").text();
            var costoLab = $("#spCostLab").text();

            costoFinalMat = parseFloat(costoFinalMat);
            costoCarnet = parseFloat(costoCarnet);
            costoSeguro = parseFloat(costoSeguro);
            costoLab = parseFloat(costoLab);

            var divDer = $("#div-der");
            var montoCuotas = costoFinalMat / nroCuotas;

            var table = "";

            for (let index = 0; index < nroCuotas; index++) {
                var aux = index + 1;
                if (index == 0) {
                    table += `<tr class="primeraFila">
                    <td class="itemCosto">` + aux + 'º Cuota' + `</td>
                    <td class="table-der">` + fnDosDigitos((montoCuotas + costoCarnet + costoSeguro + costoLab)) + ` Bs.</td>
                    </tr>`;
                } else {
                    table += `<tr>
                    <td class="itemCosto">` + aux + 'º Cuota' + `</td>
                    <td class="table-der">` + fnDosDigitos(montoCuotas) + ` Bs.</td>
                    </tr>`;
                }
            }

            divDer.append('<table id="tableCuotas" class="table"><tbody>' + table + '</tbody></table>');
        }
    });

    $(".descuentos").on("change", function() {
        otrosDescuentos();
    });

    // $("input[name=descSemip]").on("change", function() {
    //     otrosDescuentos();
    // });

    $("#spOtrosDescuentos").on("change", function() {
        var otrosDesc = $("#spOtrosDescuentos").text();
        if (otrosDesc != "0") {
            $("#spSigno").show();
        } else {
            $("#spSigno").hide();
        }
    });

    $("#montoPago_txt").change(function() {
        var pSaldo = parseFloat($('#nextPagoSaldo_hf').val());
        var pMontoPago = parseFloat($('#montoPago_txt').val());
        if (pMontoPago < pSaldo)
            $("#montoPago_txt").val(fnDosDigitos(pSaldo));
        else
            $("#montoPago_txt").val(fnDosDigitos(pMontoPago));
    });

});

function comenzarMainCargado() {
    $("#mainContainer").attr("style", "display:none");
    $("#mainLoader").removeAttr("style");
}

function terminarMainCargado() {
    $("#mainLoader").attr("style", "display:none");
    $("#mainContainer").removeAttr("style");
}

function cargarPagina() {
    var token = localStorage.getItem("token");
    obtenerBloqueo(token)
    obtenerNombre(token);
    obtenerImagen(token);
    getCarreraInfo(token);
    setTimeout(function() { cargarPeriodoYNotas(); }, 5000);
}

function resultadoBloqueo(resultado) {
    var data = resultado.Data.toLowerCase();
    if (data.inclues(bloqueo)) cargarCreditos(LHORASERVICIO);
}

function cargarCreditos(creditosVencidos) {
    am4core.useTheme(am4themes_animated);
    // Themes end
    var chart = am4core.create("divCreditos", am4charts.PieChart);
    chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
    chart.data = [{
            country: "Realizadas",
            value: creditosVencidos,
        },
        {
            country: "Restantes",
            value: horasServicio - creditosVencidos,
        },
    ];
    chart.radius = am4core.percent(70);
    chart.innerRadius = am4core.percent(40);
    chart.startAngle = 180;
    chart.endAngle = 360;
    var series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = "value";
    series.dataFields.category = "country";
    series.slices.template.cornerRadius = 10;
    series.slices.template.innerCornerRadius = 7;
    series.slices.template.draggable = false;
    series.slices.template.inert = true;
    series.alignLabels = false;
    series.hiddenState.properties.startAngle = 90;
    series.hiddenState.properties.endAngle = 90;
    chart.legend = new am4charts.Legend();
}

function obtenerImagen(token) {
    if (token != "") {
        $.ajax({
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            type: "POST",
            url: "https://nurssl.nur.edu:8182/api/Registros/GetAlumnoImagen",
            dataType: "json",
            success: function(resultado) {
                if (resultado.Data == "") {
                    $("#imgUsuario").attr("src", "assets/img/user.png");
                    return;
                }
                var imagen = "data:image/png;base64," + resultado.Data;
                $("#imgUsuario").attr("src", imagen);
            },
            error: function() {
                $("#imgUsuario").attr("src", "assets/img/user.png");
            },
        });
    }
}



function obtenerNombre(token) {
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
            success: resultado,
            error: errorSesion,
        });
    }
}

function resultado(resultado) {
    const { SREGISTRO, SAPELLIDOP, SAPELLIDOM, SNOMBRES, SCELULAR, STELEFONO, SEMAIL, LHORASERVICIO } = resultado.Data;
    var NombreCompleto = SREGISTRO + " " + SNOMBRES + " " + SAPELLIDOP + " " + SAPELLIDOM;
    $("#nombreEstudiante").text(NombreCompleto);
    $("#inputTelefono").val(STELEFONO);
    $("#inputCelular").val(SCELULAR);
    $("#inputEmail").val(SEMAIL);
    $("#tituloNombreEstudiante").text(NombreCompleto);
    cargarCreditos(LHORASERVICIO);
    getEmailValido();
}

function getCarreraInfo(token) {
    if (token != "") {
        jQuery.ajax({
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            type: "POST",
            url: "https://nurssl.nur.edu:8182/api/Registros/GetAlumnoCarreras",
            dataType: "json",
            success: infoCarrera,
            error: errorSesion,
        });
    }
}

function infoCarrera(resultado) {
    var count = 0;
    //$('#carrerasAlumno').empty();
    var carreras = "";
    var correcionId = 0;
    var arrayCarPer = [];
    resultado.Data.forEach(function(element) {
        const { LCARRERA_ID, SCARRERA_DSC, LPERIODOACTUAL, LPERIODOACTUAL_ID } = element;
        $("#MasterPeriodoActual").val(LPERIODOACTUAL_ID);
        localStorage.setItem("MasterPeriodoActual", LPERIODOACTUAL_ID);
        $("#hperiodoActual").val(LPERIODOACTUAL_ID);
        $("#dperiodoActual").val(LPERIODOACTUAL);
        if (count == 0) {
            $("#periodoActual").text(LPERIODOACTUAL);
            localStorage.setItem("corrPeActId", LPERIODOACTUAL_ID);
            //obtenerNotas(LPERIODOACTUAL_ID);
            if ($("#firstLoad").val() == 1) {
                return;
            }
        }
        var opcion = $("<option></option>");
        opcion.attr("value", LCARRERA_ID);
        opcion.text(SCARRERA_DSC);
        $("#carrerasAlumno").append(opcion);
        if (carreras == "") {
            localStorage.setItem("carreraId", LCARRERA_ID);
            localStorage.setItem("carreraNombre", SCARRERA_DSC);
            carreras += SCARRERA_DSC;
        } else {
            carreras += " , " + SCARRERA_DSC;
        }
        arrayCarPer.push({ LCARRERA_ID, LPERIODOACTUAL_ID, LPERIODOACTUAL });
        count++;
    });
    localStorage.setItem("arrayCarPer", JSON.stringify(arrayCarPer));
    //realizarAjaxHistorial();
    $("#carreraPerfil").text(carreras);
    GetPeriodosOfertas();
}

function cargarPeriodoYNotas() {
    var pPeriodoId = localStorage.getItem("corrPeActId");
    obtenerNotas(pPeriodoId);
    GetPeriodosCursados();
}

function GetPeriodosCursados() {
    $(".semestre").remove();
    var carreraId = $("#carrerasAlumno").find(":selected").val();
    var usuario = new Object();
    usuario.pCarreraId = carreraId;
    var token = localStorage.getItem("token");
    if (token != "") {
        jQuery.ajax({
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            type: "POST",
            url: "https://nurssl.nur.edu:8182/api/Registros/GetPeriodosCursados",
            dataType: "json",
            data: JSON.stringify(usuario),
            success: periodosCursados,
            error: errorSesion,
        });
    }
}

function periodosCursados(resultado) {
    var count = 0;
    var length = resultado.Data.length;
    resultado.Data.forEach(function(element) {
        const { SPERIODO_DSC, LPERIODO_ID } = element;
        if (length > 2) {
            if (count == 0) {
                var lista = $("<li></li>");
                var link = $("<a></a>");
                var parrafo = $("<p></p>").text("Ver mas Periodos");
                parrafo.attr("style", "margin-left:0px;text-align:center");
                parrafo.attr("class", "periodos");
                link.attr("id", "verMasPeriodos");
                link.append(parrafo);
                lista.append(link);
                $("#periodosTitle").after(lista);
            }
            if (count >= length - 2) {
                var lista = $("<li></li>");
                var link = $("<a></a>");
                var parrafo = $("<p></p>").text(SPERIODO_DSC);
                parrafo.attr("class", "periodos");
                link.attr("class", "semestre");
                link.attr("data-json", LPERIODO_ID);
                link.append(parrafo);
                lista.append(link);
                $("#periodosTitle").after(lista);
            }
            if (count < length - 2) {
                var lista = $("<li></li>");
                var link = $("<a></a>");
                var parrafo = $("<p></p>").text(SPERIODO_DSC);
                parrafo.attr("class", "periodos");
                link.attr("class", "semestre");
                link.attr("data-json", LPERIODO_ID);
                link.append(parrafo);
                lista.append(link);
                lista.attr("style", "display:none");
                lista.attr("class", "periodosInvisibles");
                $("#periodosTitle").after(lista);
            }
        } else {
            var lista = $("<li></li>");
            var link = $("<a></a>");
            var parrafo = $("<p></p>").text(SPERIODO_DSC);
            parrafo.attr("class", "periodos");
            link.attr("class", "semestre");
            link.attr("data-json", LPERIODO_ID);
            link.append(parrafo);
            lista.append(link);
            $("#periodosTitle").after(lista);
        }
        count++;
    });
}

function GetPeriodosOfertas() {
    var carreraId = $("#carrerasAlumno").find(":selected").val();
    var obj = new Object();
    obj.pCarreraId = carreraId;
    var token = localStorage.getItem("token");
    if (token != "") {
        jQuery.ajax({
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            type: "POST",
            url: "https://nurssl.nur.edu:8182/api/Registros/GetPeriodosOfertaCarrera",
            dataType: "json",
            data: JSON.stringify(obj),
            success: periodosOfertas,
            error: errorSesion,
        });
    }
}

function periodosOfertas(resultado) {
    $("#periodosOferta").find("option").remove();
    for (i in resultado.Data) {
        var element = resultado.Data[i];
        const { SPERIODO_DSC, LPERIODO_ID } = element;
        var opcion = $("<option></option>");
        opcion.attr("value", LPERIODO_ID);
        opcion.text(SPERIODO_DSC);
        $("#periodosOferta").append(opcion);
    }
    $("#periodosSimulador").find("option").remove();
    for (i in resultado.Data) {
        var element = resultado.Data[i];
        const { SPERIODO_DSC, LPERIODO_ID } = element;
        var opcion = $("<option></option>");
        opcion.attr("value", LPERIODO_ID);
        opcion.text(SPERIODO_DSC);
        $("#periodosSimulador").append(opcion);
    }
    // resultado.Data.forEach(function(element) {
    //     const {
    //         SPERIODO_DSC,
    //         LPERIODO_ID
    //     } = element;
    //
    //     //Menu Lateral
    //     var lista = $("<li></li>")
    //     var link = $("<a></a>")
    //     var parrafo = $("<p></p>").text(SPERIODO_DSC);
    //     parrafo.attr("class", "periodos");
    //     link.attr("class", "semestre");
    //     link.attr("data-json", LPERIODO_ID);
    //     link.append(parrafo);
    //     lista.append(link);
    //     $("#SPERIODO_DSC").after(lista);
    // });
}

function obtenerNotas(periodoId) {
    var periodoActual = $("#dperiodoActual").val();
    var semestre = periodoActual.split("-")[1];
    var tieneBloqueo = parseInt(localStorage.getItem("tieneBloqueo"));
    if (tieneBloqueo == 0) {
        mostrarColumnas(semestre);
    }
    var token = localStorage.getItem("token");
    var carreraId = $("#carrerasAlumno").find(":selected").val();
    var userId = localStorage.getItem("idUser");
    var usuario = new Object();
    usuario.pCarreraId = carreraId;
    usuario.pPeriodoId = periodoId;
    if (userId != "") {
        jQuery.ajax({
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            type: "POST",
            data: JSON.stringify(usuario),
            url: "https://nurssl.nur.edu:8182/api/Registros/GetNotasFaltas",
            dataType: "json",
            success: cargarNotas,
            error: errorSesion,
        });
    }
}

function mostrarColumnas(semestre) {
    switch (semestre) {
        case "1":
            $(".firstSemester").removeAttr("style");
            if (!$(".secondSemester")[0].hasAttribute("style")) {
                $(".secondSemester").attr("style", "display:none");
            }
            if (!$(".verano")[0].hasAttribute("style")) {
                $(".verano").attr("style", "display:none");
            }
            break;
        case "2":
            $(".secondSemester").removeAttr("style");
            if (!$(".firstSemester")[0].hasAttribute("style")) {
                $(".firstSemester").attr("style", "display:none");
            }
            if (!$(".verano")[0].hasAttribute("style")) {
                $(".verano").attr("style", "display:none");
            }
            break;
        case "V":
            $(".verano").removeAttr("style");
            if (!$(".secondSemester")[0].hasAttribute("style")) {
                $(".secondSemester").attr("style", "display:none");
            }
            if (!$(".firstSemester")[0].hasAttribute("style")) {
                $(".firstSemester").attr("style", "display:none");
            }
            break;
    }
}

function cargarNotas(resultado) {
    $("#tablaNotas").empty();
    $("#tablaAsistencia").empty();
    if (resultado.Data.length < 1) {
        terminarCargado();
        terminarMainCargado();
        return;
    }
    resultado.Data.forEach(function(element) {
        const { SCODMATERIA, SCODGRUPO, DOCENTE, EXFINAL, FINAL, PAR1, PAR2, TRABPRACTICOS, CONLECTURA, SMATERIA_DSC, LCENTRO_ID } = element;
        var tr = $("<tr ></tr>");
        var tdCodMateria = $("<td></td>").text(SCODMATERIA);
        var tdMateria = $("<td></td>").text(SMATERIA_DSC);
        var tdCodgrupo = $("<td></td>").text(SCODGRUPO);
        var tdDocente = $("<td></td>").text(DOCENTE);
        var tdExFinal = $("<td></td>").text(EXFINAL);
        var tdFinal = $("<td></td>").text(FINAL);
        var tdPar1 = $("<td></td>").text(PAR1);
        var tdPar2 = $("<td></td>").text(PAR2);
        var tdTrab = $("<td></td>").text(TRABPRACTICOS);
        var tdCont = $("<td></td>").text(CONLECTURA);
        tr.append(tdCodMateria);
        tr.append(tdMateria);
        tr.append(tdCodgrupo);
        tr.append(tdDocente);
        tr.append(tdTrab);
        tr.append(tdCont);
        tr.append(tdPar1);
        tr.append(tdPar2);
        tr.append(tdExFinal);
        tr.append(tdFinal);
        $("#tablaNotas").append(tr);
        cargarAsistencias(element);
    });
}

function cargarAsistencias(element) {
    const { SCODMATERIA, SCODGRUPO, DOCENTE, SMATERIA_DSC, LCENTRO_ID } = element;
    var tr = $("<tr ></tr>");
    var tdCodMateria = $("<td></td>").text(SCODMATERIA);
    var tdMateria = $("<td></td>").text(SMATERIA_DSC);
    var tdCodgrupo = $("<td></td>").text(SCODGRUPO);
    var tdDocente = $("<td></td>").text(DOCENTE);
    tr.append(tdCodMateria);
    tr.append(tdMateria);
    tr.append(tdCodgrupo);
    tr.append(tdDocente);
    var periodoActual = $("#dperiodoActual").val();
    var semestre = periodoActual.split("-")[1];
    var count = 0;
    switch (semestre) {
        case "1":
            const { FMES3, FMES4, FMES5, FMES6, FMES7 } = element;
            var tdFMES3 = $("<td></td>").text(FMES3);
            var tdFMES4 = $("<td></td>").text(FMES4);
            var tdFMES5 = $("<td></td>").text(FMES5);
            var tdFMES6 = $("<td></td>").text(FMES6);
            var tdFMES7 = $("<td></td>").text(FMES7);
            tr.append(tdFMES3);
            tr.append(tdFMES4);
            tr.append(tdFMES5);
            tr.append(tdFMES6);
            tr.append(tdFMES7);
            count = FMES3 + FMES4 + FMES5 + FMES6 + FMES7;
            if (LCENTRO_ID == 1) {
                if (count == 3 || count == 4) {
                    tr.css("background-color", "yellow");
                } else if (count == 5) {
                    tr.css("background-color", "red");
                } else if (count > 5) {
                    tr.css("background-color", "black");
                    tr.css("color", "white");
                }
            } else if (LCENTRO_ID == 2) {
                if (count == 1) {
                    tr.css("background-color", "yellow");
                } else if (count == 2) {
                    tr.css("background-color", "red");
                } else if (count > 2) {
                    tr.css("background-color", "black");
                    tr.css("color", "white");
                }
            }
            break;
        case "2":
            const { FMES8, FMES9, FMES10, FMES11, FMES12 } = element;
            var tdFMES8 = $("<td></td>").text(FMES8);
            var tdFMES9 = $("<td></td>").text(FMES9);
            var tdFMES10 = $("<td></td>").text(FMES10);
            var tdFMES11 = $("<td></td>").text(FMES11);
            var tdFMES12 = $("<td></td>").text(FMES12);
            tr.append(tdFMES8);
            tr.append(tdFMES9);
            tr.append(tdFMES10);
            tr.append(tdFMES11);
            tr.append(tdFMES12);
            count = FMES8 + FMES9 + FMES10 + FMES11 + FMES12;
            if (LCENTRO_ID == 1) {
                if (count == 3 || count == 4) {
                    tr.css("background-color", "yellow");
                } else if (count == 5) {
                    tr.css("background-color", "red");
                } else if (count > 5) {
                    tr.css("background-color", "black");
                    tr.css("color", "white");
                }
            } else if (LCENTRO_ID == 2) {
                if (count == 1) {
                    tr.css("background-color", "yellow");
                } else if (count == 2) {
                    tr.css("background-color", "red");
                } else if (count > 2) {
                    tr.css("background-color", "black");
                    tr.css("color", "white");
                }
            }
            break;
        case "V":
            const { FMES1, FMES2 } = element;
            var tdFMES1 = $("<td></td>").text(FMES1);
            var tdFMES2 = $("<td></td>").text(FMES2);
            tr.append(tdFMES1);
            tr.append(tdFMES2);
            count = FMES1 + FMES2;
            if (LCENTRO_ID == 1) {
                if (count == 3 || count == 4) {
                    tr.css("background-color", "yellow");
                } else if (count == 5) {
                    tr.css("background-color", "red");
                } else if (count > 5) {
                    tr.css("background-color", "black");
                    tr.css("color", "white");
                }
            } else if (LCENTRO_ID == 2) {
                if (count == 1) {
                    tr.css("background-color", "yellow");
                } else if (count == 2) {
                    tr.css("background-color", "red");
                } else if (count > 2) {
                    tr.css("background-color", "black");
                    tr.css("color", "white");
                }
            }
            break;
    }
    $("#tablaAsistencia").append(tr);
    terminarCargado();
    terminarMainCargado();
}

function tieneOferta() {
    var response = true;
    var carreraId = localStorage.getItem("carreraId");
    var periodoOferta = localStorage.getItem("periodoOferta");
    var token = localStorage.getItem("token");
    var usuario = new Object();
    usuario.pCarreraId = carreraId;
    usuario.pPeriodoId = periodoOferta;
    jQuery
        .ajax({
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            type: "POST",
            data: JSON.stringify(usuario),
            url: "https://nurssl.nur.edu:8182/api/Registros/GetAlumnoOfertaa",
            dataType: "json",
        })
        .done(function(resultado) {
            if (resultado.Data.length == 0) response = false;
        });
    return response;
}

function cargarHistorial(resultado) {
    var semestre = " SEMESTRE";
    var espacio = "-";

    var arbol = [];
    resultado.Data.CURSADAS.forEach(function(element) {
        const { MATERIAS, REQUISITOS } = element;
        var objMateria = new Object();
        objMateria.semestre = parseInt(MATERIAS.LSEMESTRE);
        objMateria.creditos = parseInt(MATERIAS.LCREDITOS);
        objMateria.nombre = MATERIAS.SMATERIA_DSC;
        objMateria.requisitos = REQUISITOS;
        objMateria.cursada = 1;
        arbol.push(objMateria);
    });
    resultado.Data.FALTANTES.forEach(function(element) {
        const { MATERIAS, REQUISITOS } = element;
        if (MATERIAS.SPERIODO_DSC.length > 1) {
            return;
        }
        var objMateria = new Object();
        objMateria.semestre = parseInt(MATERIAS.LSEMESTRE);
        objMateria.creditos = parseInt(MATERIAS.LCREDITOS);
        objMateria.nombre = MATERIAS.SMATERIA_DSC;
        objMateria.requisitos = REQUISITOS;
        objMateria.cursada = 0;
        arbol.push(objMateria);
    });
    arbol.sort(function(a, b) {
        return a.semestre - b.semestre;
    });
    construirTablas(arbol);
}

function construirTablas(arbol) {
    var semestreAnterior = 0;
    var trPlantilla = $("#templateTabla").clone();
    var tableBody = $("<tbody ></tbody>");
    var html = trPlantilla.html();
    for (var i = 0; i < arbol.length; i++) {
        const { creditos, cursada, nombre, requisitos, semestre } = arbol[i];
        if (semestre != semestreAnterior) {
            semestreAnterior = semestre;
            var html = trPlantilla.html();
            tablaId = "tabla" + i;
            html = html.replace("{Semestre}", obtenerNumerosCardinales(semestre) + " Semestre");
            html = html.replace("{tableId}", tablaId);
            var div = $("<div ></div>").addClass("col-md-6");
            div.append(html);

            $("#containerHistorial").append(div);
            var tableBody = document.getElementById(tablaId);
            var tableBody = $("#" + tablaId);
        }
        var tr = $("<tr ></tr>");
        tr.append($("<td></td>").text(nombre));

        if (cursada == 1) {
            tr.append($("<td></td>").append($("<i ></i>").addClass("fas fa-check-square iconClass")));
        } else {
            tr.append($("<td></td>").text(""));
        }
        tr.append($("<td></td>").text(creditos));
        tr.append($("<td></td>").text(obtenerRequisitos(requisitos)));
        tableBody.append(tr);
        terminarCargado();
        isHistorialCargado = true;
    }
}

function obtenerNumerosCardinales(semestre) {
    var numeroCardinal = "";
    switch (semestre) {
        case 1:
            numeroCardinal = "Primer";
            break;
        case 2:
            numeroCardinal = "Segundo";
            break;
        case 3:
            numeroCardinal = "Tercer";
            break;
        case 4:
            numeroCardinal = "Cuarto";
            break;
        case 5:
            numeroCardinal = "Quinto";
            break;
        case 6:
            numeroCardinal = "Sexto";
            break;
        case 7:
            numeroCardinal = "Séptimo";
            break;
        case 8:
            numeroCardinal = "Octavo";
            break;
        case 9:
            numeroCardinal = "Noveno";
            break;
        case 10:
            numeroCardinal = "Décimo ";
            break;
        case 11:
            numeroCardinal = "Décimo Primero";
            break;
        case 12:
            numeroCardinal = "Décimo Segundo";
            break;
        case 13:
            numeroCardinal = "Décimo Tercero";
            break;
        case 14:
            numeroCardinal = "Décimo Cuarto";
            break;
        default:
            numeroCardinal = semestre;
    }
    return numeroCardinal;
}

function obtenerRequisitos(requisitos) {
    var requisitosConcatenado = "";
    requisitos.forEach(function(req) {
        var nombreMateria = req.SMATERIA_DSC;
        if (requisitosConcatenado != "") {
            requisitosConcatenado += " ,";
        }
        requisitosConcatenado += nombreMateria;
    });
    return requisitosConcatenado;
}

function cargarPromedio() {
    am4core.useTheme(am4themes_animated);
    var chart = am4core.create("divPromedio", am4charts.GaugeChart);
    chart.innerRadius = am4core.percent(82);
    /**
     * Axis for ranges
     */

    var colorSet = new am4core.ColorSet();

    var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
    axis2.min = 0;
    axis2.max = 100;
    axis2.renderer.innerRadius = 10;
    axis2.strictMinMax = true;
    axis2.renderer.labels.template.disabled = false;
    axis2.renderer.ticks.template.disabled = true;
    axis2.renderer.grid.template.disabled = true;

    var range0 = axis2.axisRanges.create();
    range0.value = 0;
    range0.endValue = 50;
    range0.axisFill.fillOpacity = 1;
    range0.axisFill.fill = colorSet.getIndex(0);

    var range1 = axis2.axisRanges.create();
    range1.value = 50;
    range1.endValue = 100;
    range1.axisFill.fillOpacity = 1;
    range1.axisFill.fill = colorSet.getIndex(2);

    /**
     * Label
     */

    var label = chart.radarContainer.createChild(am4core.Label);
    label.isMeasured = false;
    label.fontSize = 30;
    label.x = am4core.percent(50);
    label.y = am4core.percent(100);
    label.horizontalCenter = "middle";
    label.verticalCenter = "top";
    label.text = "50%";

    /**
     * Hand
     */

    var hand = chart.hands.push(new am4charts.ClockHand());
    hand.axis = axis2;
    hand.innerRadius = am4core.percent(20);
    hand.startWidth = 10;
    hand.pin.disabled = true;
    hand.value = 50;

    hand.events.on("propertychanged", function(ev) {
        range0.endValue = ev.target.value;
        range1.value = ev.target.value;
        axis2.invalidate();
    });
    var value = promedio;
    label.text = value;
    var animation = new am4core.Animation(
        hand, {
            property: "value",
            to: value,
        },
        1500,
        am4core.ease.cubicOut
    ).start();
}

function errorSesion() {
    localStorage.removeItem("token");
    var url = "../index.html";
    $(location).attr("href", url);
}

function removerAcentos(newStringComAcento) {
    var string = newStringComAcento;
    var mapaAcentosHex = {
        a: /[\xE0-\xE6]/g,
        A: /[\xC0-\xC6]/g,
        e: /[\xE8-\xEB]/g,
        E: /[\xC8-\xCB]/g,
        i: /[\xEC-\xEF]/g,
        I: /[\xCC-\xCF]/g,
        o: /[\xF2-\xF6]/g,
        O: /[\xD2-\xD6]/g,
        u: /[\xF9-\xFC]/g,
        U: /[\xD9-\xDC]/g,
        c: /\xE7/g,
        C: /\xC7/g,
        n: /\xF1/g,
        N: /\xD1/g,
    };
    for (var letra in mapaAcentosHex) {
        var expressaoRegular = mapaAcentosHex[letra];
        string = string.replace(expressaoRegular, letra);
    }
    return string;
}

function comenzarCargado() {
    $("#loader").removeAttr("style");
    $(".content").attr("style", "display:none");
}

function terminarCargado() {
    $(".content").removeAttr("style");
    $("#loader").attr("style", "display:none");
}

function logout() {
    localStorage.removeItem("token");
}

function mostrarHorario() {
    response = true;
    var carreraId = localStorage.getItem("carreraId");
    var periodoActual = localStorage.getItem("MasterPeriodoActual");
    var token = localStorage.getItem("token");
    var usuario = new Object();
    usuario.pCarreraId = carreraId;
    usuario.pPeriodoId = periodoActual;
    jQuery
        .ajax({
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            type: "POST",
            data: JSON.stringify(usuario),
            url: "https://nurssl.nur.edu:8182/api/Registros/GetNotasFaltas",
            dataType: "json",
        })
        .done(function(resultado) {
            if (resultado.Data.length == 0) response = false;
        });
    if (response) window.location = "horario.html";
    else swal("", "Tu horario no esta disponible aún", "info");
    $("#bodyClick").click();
}

function verPerfil() {
    $("#containerNotas").hide();
    $("#containerAsistencia").hide();
    $("#containerPensul").hide();
    $("#containerPlanPagos").hide();
    $("#containerSimulador").hide();
    $("#containerPerfil").fadeIn();
    $("#containerHistorial").hide();
    $("#bodyClick").click();
    cargarPromedio();
}

function verOferta() {
    var periodosOferta = document.getElementById("periodosOferta").options.length;
    if (periodosOferta > 0) {
        $("#modalOferta").show();
    } else {
        swal("No tienes ofertas", "No tiene materias, puede contactarse al WhatsApp 763-92502", "info");
    }
    $("#bodyClick").click();
}

function verHistorial() {
    $("#containerNotas").hide();
    $("#containerAsistencia").hide();
    $("#containerPlanPagos").hide();
    $("#containerSimulador").hide();
    $("#containerPerfil").hide();
    $("#bodyClick").click();

    var isHistorialCargado = $("#isHistorialCargado").val();
    if (isHistorialCargado == 1) {
        $("#containerPensul").show();
        return;
    }
    comenzarCargado();
    //realizarAjaxHistorial();
    $("#containerHistorial").hide();
    $("#containerPensul").show();
    return false;
}

function verListaHistorial() {
    $("#containerNotas").hide();
    $("#containerAsistencia").hide();
    $("#containerPerfil").hide();
    $("#containerPlanPagos").hide();
    $("#containerSimulador").hide();
    $("#containerPensul").hide();
    $("#bodyClick").click();
    if (isHistorialCargado) {
        $("#containerHistorial").show();
        return;
    }
    comenzarCargado();
    var carreraId = localStorage.getItem("carreraId");
    var carreraNombre = localStorage.getItem("carreraNombre");
    var usuario = new Object();
    usuario.pCarreraId = carreraId;
    $("#carreraNombre").text(carreraNombre);
    var token = localStorage.getItem("token");
    jQuery.ajax({
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
        type: "POST",
        url: "https://nurssl.nur.edu:8182/api/Registros/GetAlumnoHistorial",
        dataType: "json",
        data: JSON.stringify(usuario),
        success: cargarHistorial,
        error: function() {
            swal("", "Lo sentimos, el servicio de historial en línea está temporalmente inhabilitado.", "info");
        },
    });
    $("#containerHistorial").show();
}

function realizarAjaxHistorial() {
    var carreraId = localStorage.getItem("carreraId");
    var usuario = new Object();
    usuario.pCarreraId = carreraId;
    var token = localStorage.getItem("token");
    if (token != "") {
        jQuery.ajax({
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            type: "POST",
            url: "https://nurssl.nur.edu:8182/api/Registros/GetAlumnoHistorial",
            dataType: "json",
            data: JSON.stringify(usuario),
            success: cargarHistorial,
            error: function() {
                swal("", "Lo sentimos, el servicio de historial en línea está temporalmente inhabilitado.", "info");
            },
        });
    }
}

function cargarHistorial(resultado) {
    if (resultado.Data == null) {
        swal("", "Lo sentimos, el servicio de historial en línea está temporalmente inhabilitado.", "info");
        terminarCargado();
        return
    };
    promedio = resultado.Data.PROMEDIOAPROBADAS == null ? 0 : resultado.Data.PROMEDIOAPROBADAS;
    /*if (!isPageLoaded) {
        isPageLoaded = true;
        return;
    }*/
    var semestre = " SEMESTRE";
    var espacio = " - ";
    var arbol = [];
    resultado.Data.CURSADAS.forEach(function(element) {
        const { MATERIAS, REQUISITOS } = element;
        var materiaPadre = removerAcentos(MATERIAS.SMATERIA_DSC.toUpperCase()) + espacio + MATERIAS.LSEMESTRE + semestre;
        var count = 0;
        REQUISITOS.forEach(function(req) {
            if (req.LSEMESTRE == null) return;
            var objNodo = new Object();
            var numeroSemestre = req.LSEMESTRE == null ? "" : req.LSEMESTRE;
            objNodo.from = removerAcentos(req.SMATERIA_DSC.toUpperCase()) + espacio + numeroSemestre + semestre;
            objNodo.to = materiaPadre;
            objNodo.value = 1;
            arbol.push(objNodo);
            count++;
        });
        if (count == 0) {
            var objNodo = new Object();
            var numeroSemestre = MATERIAS.LSEMESTRE;
            objNodo.from = removerAcentos(MATERIAS.SMATERIA_DSC.toUpperCase()) + espacio + MATERIAS.LSEMESTRE + semestre;
            objNodo.to = "";
            objNodo.value = 1;
            objNodo.semestre = MATERIAS.LSEMESTRE;
            arbol.push(objNodo);
        }
    });
    resultado.Data.FALTANTES.forEach(function(element) {
        const { MATERIAS, REQUISITOS } = element;
        var materiaPadre = removerAcentos(MATERIAS.SMATERIA_DSC.toUpperCase()) + espacio + MATERIAS.LSEMESTRE + semestre;
        var count = 0;
        REQUISITOS.forEach(function(req) {
            if (req.LSEMESTRE == null) return;
            var objNodo = new Object();
            var numeroSemestre = req.LSEMESTRE == null ? "" : req.LSEMESTRE;
            objNodo.from = removerAcentos(req.SMATERIA_DSC.toUpperCase()) + espacio + numeroSemestre + semestre;
            objNodo.to = materiaPadre;
            objNodo.value = 1;
            objNodo.nodeColor = "#757575";
            arbol.push(objNodo);
            count++;
        });
        if (count == 0) {
            var objNodo = new Object();
            var numeroSemestre = MATERIAS.LSEMESTRE;
            objNodo.from = removerAcentos(MATERIAS.SMATERIA_DSC.toUpperCase()) + espacio + MATERIAS.LSEMESTRE + semestre;
            objNodo.to = "";
            objNodo.value = 1;
            objNodo.semestre = MATERIAS.LSEMESTRE;
            arbol.push(objNodo);
        }
    });
    arbol.sort(function(a, b) {
        return parseInt(a.semestre) - parseInt(b.semestre);
    });
    am4core.useTheme(am4themes_animated);
    // Themes end
    var chart = am4core.create("chartdiv", am4charts.SankeyDiagram);
    chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
    chart.data = arbol;
    let hoverState = chart.links.template.states.create("hover");
    hoverState.properties.fillOpacity = 0.6;
    chart.dataFields.fromName = "from";
    chart.dataFields.toName = "to";
    chart.dataFields.value = "value";
    chart.dataFields.color = "nodeColor";
    // for right-most label to fit
    chart.paddingRight = 30;
    // make nodes draggable
    var linkTemplate = chart.links.template;
    linkTemplate.controlPointDistance = 0.01;
    var nodeTemplate = chart.nodes.template;
    nodeTemplate.nameLabel.width = 380;
    nodeTemplate.inert = true;
    nodeTemplate.readerTitle = "Drag me!";
    nodeTemplate.showSystemTooltip = true;
    nodeTemplate.width = 380;
    nodeTemplate.nameLabel.locationX = 0.01;
    // make nodes draggable
    var nodeTemplate = chart.nodes.template;
    nodeTemplate.readerTitle = "Click to show/hide or drag to rearrange";
    nodeTemplate.showSystemTooltip = true;
    nodeTemplate.cursorOverStyle = am4core.MouseCursorStyle.pointer;
    terminarCargado();
    $("#isHistorialCargado").val(1);
}

function consultarCXC() {
    $("#containerNotas").hide();
    $("#containerAsistencia").hide();
    $("#containerPensul").hide();
    $("#containerPerfil").hide();
    $("#containerPlanPagos").fadeIn();
    $("#containerPlanPagos").empty();
    $("#containerHistorial").hide();
    $("#containerSimulador").hide();
    $("#bodyClick").click();
    var token = localStorage.getItem("token");
    var pPeriodoId = localStorage.getItem("MasterPeriodoActual");
    if (pPeriodoId <= 0) {
        pPeriodoId = localStorage.getItem("corrPeActId");
    }
    var data = new Object();
    data.pPeriodoId = pPeriodoId;
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

            rowPlan = { nroCuota, fecha, cuota, pagado, saldo, estado };
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
            '<div class="row"><div class="col-md-12"><div class="card"><div class="header"><h4 class="title"><strong>Plan de pagos ' + datos[index].periodo + `</strong></h4>
              <h5 class="title">` +
            datos[index].carrera +
            `</h5><h5 class="title">` +
            datos[index].centro +
            `</h5></div>
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
                detalleRow += "<a id='pago_btn_" + datos[index].planpagosId + "' class='btn btn-primary' onclick='tieneEmailValidoPago(" + datos[index].planpagosId + "," + fnDosDigitos(planRow[aux].saldo) + ")'><i class='fas fa-money-check-alt'></i> Pagar cuota</a>";
                botonPagoPuesto = 1;
            } else {
                detalleRow += planRow[aux].estado;
            }
            detalleRow += "</td></tr>";
        }
        final += html + detalleRow + htmlEnd;
    }

    if (final == "") {
        final = `<div class="row"><div class="col-md-12"><div class="card"><div class="alert alert-deuda" role="alert"><h2 class="alert-heading">No tiene planes de pago</h2>
    <p>No tiene deudas pendientes en esta gestión.</p></div></div></div></div>`;
    }
    var parrafo = "<p>Para mas información sobre los planes de pago apersonarse por las oficinas Edificio Nur Central 4to piso <b>Dpto. Cuentas por cobrar</b>.</p>";
    $("#containerPlanPagos").append(final);
    $("#containerPlanPagos").append(parrafo);
    terminarCargado();
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

function formatearFecha(fecha) {
    var fechaFormat = new Date(fecha);
    return ("0" + fechaFormat.getDate()).slice(-2) + "/" + ("0" + (fechaFormat.getMonth() + 1)).slice(-2) + "/" + fechaFormat.getFullYear();
}

function fnDosDigitos(numero) {
    if (numero == 0) {
        return 0;
    }
    return Number(numero).toFixed(2);
}

function validateEmail(email) {
    var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailReg.test(email);
}

function cargarLinks() {
    var token = localStorage.getItem("token");
    if (token != "") {
        jQuery.ajax({
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + token,
            },
            type: "POST",
            url: "https://nurssl.nur.edu:8182/api/Registros/GetLinks",
            dataType: "json",
            success: function(response) {
                $("#ListaLinks_ul").empty();
                var lista = response.Data;
                lista.forEach(function(element) {
                    const {
                        TITULO,
                        LINK
                    } = element;
                    var input = $('<a target="_blank" href="' + LINK + '">' + TITULO + '</a>')
                    var li = $("<li></li>").append(input);
                    $('#ListaLinks_ul').append(li);
                });
            }
        });
    }
}

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

function PeriodosSimular() {
    var periodosOferta = document.getElementById("periodosOferta").options.length;
    if (periodosOferta > 0) {
        $("#modalOfertaSimulador").show();
    } else {
        swal("Lo sentimos!", "No tienes periodos ofertados", "info");
    }
};


function getCostosSemestre(periodoId, carreraId) {
    var token = localStorage.getItem("token");
    var usuario = new Object();
    usuario.periodoId = periodoId;
    jQuery.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        'type': 'POST',
        'data': JSON.stringify(usuario),
        'url': "https://nurssl.nur.edu:8182/api/Registros/GetCostosSemestre",
        'dataType': 'json',
        'success': cargarCostos
    });
}

function tieneLaboratorio() {
    var periodoId = parseInt(localStorage.getItem("periodoOferta"));
    var carreraId = parseInt(localStorage.getItem("carreraId"));
    var token = localStorage.getItem("token");
    var usuario = new Object();
    usuario.periodoId = periodoId;
    usuario.carreraId = carreraId;
    jQuery.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        'type': 'POST',
        'data': JSON.stringify(usuario),
        'url': "https://nurssl.nur.edu:8182/api/Registros/TieneLaboratorio",
        'dataType': 'json',
        'success': cargarCostosLaboratorio
    });
}

function cargarCostosLaboratorio(resultado) {
    if (resultado.Status) {
        $("#trLaboratorio").show();
    }
}

function cargarCostos(resultado) {
    if (!resultado.Status) {
        swal("Lo sentimos!", "Aún no existen costos para este periodo", "info");
        return;
    }
    var costos = resultado.Data;
    var cmp = 0;
    var cms = 0;
    var cce = 0;
    var csu = 0;
    var cga = 0;
    var cl = 0;

    for (var item in costos) {
        if (costos[item].LTIPOCOSTO_ID == 2) {
            cce = costos[item].DMONTO;
        }
        if (costos[item].LTIPOCOSTO_ID == 9) {
            cga = costos[item].DMONTO;
        }
        if (costos[item].LTIPOCOSTO_ID == 5 && costos[item].LCENTRO_ID == 1) {
            cmp = costos[item].DMONTO;
        }
        if (costos[item].LTIPOCOSTO_ID == 8) {
            csu = costos[item].DMONTO;
        }
        if (costos[item].LTIPOCOSTO_ID == 5 && costos[item].LCENTRO_ID == 2) {
            cms = costos[item].DMONTO;
        }
        if (costos[item].LTIPOCOSTO_ID == 3) {
            cl = costos[item].DMONTO;
        }
    }
    var prd = !isEmpty(costos[0].SPERIODO_DSC) ? costos[0].SPERIODO_DSC : "";

    $("#cmp").val(cmp);
    $("#cms").val(cms);
    $("#cga").val(cga);
    $("#cce").val(cce);
    $("#csu").val(csu);
    $("#cl").val(cl);
    $("#prd").val(prd);
}

function isEmpty(value) {
    return (value == null || value === '');
}

function resetComboCuotas() {
    $("#cbCuotas").val($("#cbCuotas option:first").val()).trigger('change');
    $("#tableCuotas").remove();
}

function calcularPagoContado(costoMaterias) {
    return costoMaterias - (costoMaterias * 0.1);
}

function calcularOtrosDesc(costoMaterias, porcDescuento) {
    if (porcDescuento < 0) {
        porcDescuento = 0;
    }
    if (porcDescuento > 100) {
        porcDescuento = 100;
    }
    var porcDes = porcDescuento / 100;
    return costoMaterias * porcDes;
}

function mostrarCostosTotales(costo) {
    $("#spTotalCostMaterias").hide();
    $("#spTotalCostMaterias").text(fnDosDigitos(costo));
    $("#spTotalCostMaterias").fadeIn(1000);
    $("#spCostoFinalMat").hide();
    $("#spCostoFinalMat").text(fnDosDigitos(costo)).trigger('change');
    $("#spCostoFinalMat").fadeIn(1000);
}

function otrosDescuentos() {
    var descPres = $("#descPrese").val();
    var totalPres = $("#spMatPresencial").text();
    var descSemi = $("#descSemip").val();
    var totalSemi = $("#spMatSemipresencial").text();

    descPres = parseFloat(descPres);
    totalPres = parseFloat(totalPres);
    descSemi = parseFloat(descSemi);
    totalSemi = parseFloat(totalSemi);

    var totalOtrosDesc = calcularOtrosDesc(totalPres, descPres) + calcularOtrosDesc(totalSemi, descSemi);
    $("#spOtrosDescuentos").text(fnDosDigitos(totalOtrosDesc)).trigger('change');
}


function resetearDescuento(monto, id) {
    if (monto == "0") {
        $("#" + id).val(0);
    }
}

function recalcular() {
    var cambio = false;
    var totalPres = $("#spMatPresencial").text();
    var totalSemi = $("#spMatSemipresencial").text();

    if ($(".filaPagoContado").css("display") != "none") {
        $("#pagoContado").prop("checked", false).trigger('change');
        cambio = true;
    }

    totalPres = parseFloat(totalPres);
    totalSemi = parseFloat(totalSemi);

    var totales = totalPres + totalSemi;

    if ($(".filaPagoContado").css("display") != "none" && !cambio) {
        totales = calcularPagoContado(totales);
    }

    $("#spTotalCostMaterias").hide();
    $("#spTotalCostMaterias").text(fnDosDigitos(totales)).trigger('change');
    $("#spTotalCostMaterias").fadeIn(1000);
}

function getEmailValido() {
    var token = localStorage.getItem("token");
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
                $('#inputEmail_ver').show();
                $('#inputEmail_ver').html('<i class="fas fa-check-circle"></i>');
            } else {
                $('#inputEmail_ver').show();
                $('#inputEmail_ver').html('<i class="fas fa-times-circle"></i>');
            }
        }
    });
}

function tieneEmailValidoPago(pPlanPagosId, pSaldo) {
    comenzarCargado();
    $('#nextPagoId_hf').val(pPlanPagosId);
    $('#nextPagoSaldo_hf').val(pSaldo);
    var token = localStorage.getItem("token");
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
                verPerfil();
                swal("Verifique su correo electrónico", "Esta verificación es indispensable para continuar con el proceso de Pago. Para verificar su correo electrónico: <br><br>" +
                    "   1. Ir a 'Mi perfil'. <br>" +
                    "   2. Llenar el campo 'Email'. <br>" +
                    "   3. Presiona 'Guardar'. <br>" +
                    "   4. Revisar la bandeja de entreda de su correo electrónico, recibirá un mensaje para concluir la verificación.", "info");
            }
            terminarCargado();
        },
        'error': function() {
            swal("", "No fue posible verificar su correo electrónico, intente mas tarde.", "info");
            terminarCargado();
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
    comenzarCargado();
    var datos = new Object();
    datos.pPlanPagosId = pPlanPagosId;
    datos.pSaldo = pSaldo;
    var token = localStorage.getItem("token");
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
            terminarCargado();
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
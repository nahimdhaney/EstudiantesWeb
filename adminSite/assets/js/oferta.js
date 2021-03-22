var botonInscripcionVisible = 0;

$(document).ready(function () {
    cargarPagina();
    getCostosSemestre();
    tieneLaboratorio();
    bloqueoInscripcion();
})
$("#imprimir").click(function () {
    window.print();
});

function cargarPagina() {
    comenzarMainCargado()
    obtenerDocumentos();
    InfoPersonal();
    InfoCarrera();
    obtenerOferta();
}

function getCostosSemestre() {
    var periodoId = parseInt(localStorage.getItem("periodoOferta"));
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
        'url': "http://wsnotas.nur.edu:8880/api/Registros/GetCostosSemestre",
        'dataType': 'json',
        'success': cargarCostos
    });
}

function cargarCostos(resultado) {
    if (!resultado.Status) {
        $("#tc").val(1);
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
        'url': "http://wsnotas.nur.edu:8880/api/Registros/TieneLaboratorio",
        'dataType': 'json',
        'success': cargarCostosLaboratorio
    });
}

function cargarCostosLaboratorio(resultado) {
    if (resultado.Status) {
        $("#trLaboratorio").show();
    }
}

function comenzarMainCargado() {
    $('#mainContainer').attr("style", 'display:none');
    $("#mainLoader").removeAttr("style");
}

function terminarMainCargado() {
    $('#mainLoader').attr("style", 'display:none');
    $("#mainContainer").removeAttr("style");
}

function InfoCarrera() {
    var token = localStorage.getItem("token");
    jQuery.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        'type': 'POST',
        'url': "http://wsnotas.nur.edu:8880/api/Registros/GetAlumnoCarreras",
        'dataType': 'json',
        'success': cargarInfoCarrera
    });
}

function pad(number, length) {


    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }

    return str;

}

function cargarInfoCarrera(resultado) {
    resultado.Data.forEach(function (element) {
        const {
            LCARRERA_ID,
            SCARRERA_DSC,
            LCODPENSUM,
            LPERIODOACTUAL,
            LPERIODOINICIO,
            SCODCENTRO,
            LCREDVENCIDOS,
            LPERIODOACTUAL_ID,
            LALUMINFOACAD_ID
        } = element;
        var carreraId = parseInt(localStorage.getItem("carreraId"));
        if (carreraId == LCARRERA_ID) {
            var carrera = pad(LCARRERA_ID, 4) + '    ' + SCARRERA_DSC;
            var pensum = 'Cod. Pensum: ' + LCODPENSUM
            var semestreActual = 'Semestre Act.:  ' + LPERIODOACTUAL
            var semestreIngreso = 'Sem. Ingreso:    ' + LPERIODOINICIO
            var codigoCentro = 'Cod. Centro:    ' + SCODCENTRO
            var fechaPeriodo = LPERIODOACTUAL
            var creditosVencidos = 'Cred. Vencidos:     ' + LCREDVENCIDOS
            $('#carrera').text(carrera)
            $('#pensum').text(pensum)
            $('#idsemestreActual').text(semestreActual)
            $('#semestreIngreso').text(semestreIngreso)
            $('#codigoCentro').text(codigoCentro)
            $('#creditosVencidos').text(creditosVencidos)
            $('#semestreActual').text(semestreActual)

            $("#hdnAia").val(LALUMINFOACAD_ID);
            return;
        }
    });
}

function InfoPersonal() {
    var token = localStorage.getItem("token");
    jQuery.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        'type': 'POST',
        'url': "http://wsnotas.nur.edu:8880/api/Registros/GetAlumnoInfo",
        'dataType': 'json',
        'success': cargarInformacionPersonal
    });
}

function cargarInformacionPersonal(resultado) {
    const {
        SREGISTRO,
        SAPELLIDOP,
        SAPELLIDOM,
        SNOMBRES,
        DTFECHNAC,
        SSEXO_DSC,
        SCELULAR,
        STELEFONO,
        SEMAIL,
        SESTADOCIVIL_DSC,
        STIPOSANGRE_DSC,
        BOOLACTIVOPASIVO,
        LHORASERVICIO,
        STIPOCOLEGIO
    } = resultado.Data;
    var NombreCompleto = SREGISTRO + ' ' + SNOMBRES + ' ' + SAPELLIDOP + ' ' + SAPELLIDOM;
    $('#nombreCodigo').text(NombreCompleto);
    var colegio = 'Colegio: ' + STIPOCOLEGIO;
    $('#tipoColegio').text(colegio);
    $('#horasServicio').text('Horas de Servicio: ' + LHORASERVICIO);
    $('.emailContacto').val(SEMAIL);
    $('.telefonoContacto').val(SCELULAR);

    $("#hdnRegistro").val(SREGISTRO);
    $("#hdnCorreo").val(SEMAIL);
    var nombreAlumno = SAPELLIDOP + ' ' + SAPELLIDOM + ' ' + SNOMBRES;
    $("#hdnNombreCompleto").val(nombreAlumno);
}

function obtenerOferta() {
    var carreraId = localStorage.getItem("carreraId");
    var periodoOferta = localStorage.getItem("periodoOferta");
    if (carreraId == 0 || periodoOferta == 0) {
        window.close();
    }
    var token = localStorage.getItem("token");
    var usuario = new Object();
    usuario.pCarreraId = carreraId;
    usuario.pPeriodoId = periodoOferta;
    jQuery.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        'type': 'POST',
        'data': JSON.stringify(usuario),
        'url': "http://wsnotas.nur.edu:8880/api/Registros/GetAlumnoOfertaa",
        'dataType': 'json',
        'success': cargarOferta
    });
}

function cargarOferta(resultado) {
    var haySemi = false;
    if (resultado.Data.length == 0) {
        //var url = "dashboard.html";
        //$(location).attr("href", url);
        swal("", "Sin materias ofertadas");

        $('.materiasSemiPresencial').hide();
        $('.noMateriasSemiPresencial').show();
        $('.materiasPresencial').hide();
        //$('.MateriasSemiPresencial').show();
        $('.noMateriasPresencial').show();
        $('.noMateriasPresencial').parent().css({ "padding": "15px" });
        $('.noMateriasSemiPresencial').parent().css({ "padding": "15px" });
        terminarMainCargado()
        return;
    }
    var periodoDsc = resultado.Data[0].SPERIODO_DSC;
    $("#hdnSemestre").val(periodoDsc);
    $("#spPeriodoDsc").text(periodoDsc);


    resultado.Data.forEach(function (element) {
        const {
            LGRUPO_ID,
            LCENTRO_ID,
            LMATERIA_ID,
            SMATERIA_DSC,
            LSEMESTRE,
            LCREDITOS,
            LLABORATORIO,
            DOCENTE,
            SCODMATERIA,
            CASILLA,
            SCODGRUPO,
            SSEMANA,
            LESTADOGRUPO_ID,
            SESTADOGRUPO_DSC,
            LCANTMAXIMA,
            LTOTAL,
            SOBS1,
            HORARIO
        } = element;
        if (LCENTRO_ID == 1) {
            var tr = $("<tr ></tr>")
            var input = $('<input type="checkbox" class="chkRow" name="' + LMATERIA_ID + '" id="' + LGRUPO_ID + "-" + LMATERIA_ID + '"/>')
            var row = $("<td class='no'></td>").append(input);
            var td1 = $("<td></td>").text(SMATERIA_DSC);
            var td2 = $("<td class='no'></td>").text(LSEMESTRE);
            var td3 = $("<td class='no'></td>").text(LCREDITOS);
            var td4 = $("<td class='no'></td>").text(LLABORATORIO == 1 ? "*" : "");
            var td5 = $("<td></td>").text(DOCENTE);
            var td6 = $("<td class='no'></td>").text(SCODMATERIA);
            var td7 = $("<td></td>").text(SCODGRUPO);
            var td8 = $("<td></td>").html(HORARIO == null ? "" : getDiasHorario(HORARIO));
            var td9 = $("<td></td>").html(HORARIO == null ? "" : getHoraHorario(HORARIO));
            var td10 = $("<td class='no'></td>").text(SSEMANA);
            var td11 = $("<td class='no' name='ins'></td>").text(LTOTAL);
            var td12 = $("<td class='no' name='tope'></td>").text(LCANTMAXIMA);
            var td13 = $("<input id='" + LGRUPO_ID + "-" + LMATERIA_ID + "-obs' type='hidden'>").val(SOBS1);
            tr.append(td6)
            tr.append(td1)
            tr.append(td2)
            tr.append(td3)
            tr.append(td4)
            tr.append(td5)
            tr.append(row)
            tr.append(td7)
            tr.append(td8)
            tr.append(td9)

            tr.append(td10)
            tr.append(td11)
            tr.append(td12)
            tr.append(td13)

            if (LTOTAL == 'Lleno') {
                tr.css({ 'pointer-events': 'none' });
                tr.find('td[name ="ins"]').css({ 'font-weight': 'bold' });
            }

            $('#tablaOferta').append(tr);
        }
        if (LCENTRO_ID == 2) {
            cargarSemi(element);
            haySemi = true;
        }
    });
    if (haySemi == false) {
        $('.materiasSemiPresencial').hide();
        $('.noMateriasSemiPresencial').show();
        $('.noMateriasSemiPresencial').parent().css({ "padding": "15px" });
    }
    terminarMainCargado()
}

function cargarSemi(element) {
    const {
        LGRUPO_ID,
        LCENTRO_ID,
        LMATERIA_ID,
        SMATERIA_DSC,
        LSEMESTRE,
        LCREDITOS,
        LLABORATORIO,
        DOCENTE,
        SCODMATERIA,
        CASILLA,
        SCODGRUPO,
        SSEMANA,
        LESTADOGRUPO_ID,
        SESTADOGRUPO_DSC,
        LCANTMAXIMA,
        LTOTAL,
        SOBS1,
        HORARIO
    } = element;
    var tr = $("<tr ></tr>")

    var td1 = $("<td></td>").text(SMATERIA_DSC);
    var td2 = $("<td class='no'></td>").text(LSEMESTRE);
    var td3 = $("<td class='no'></td>").text(LCREDITOS);
    var td4 = $("<td class='no'></td>").text(LLABORATORIO == 1 ? "*" : "");
    var td5 = $("<td></td>").text(DOCENTE);
    var td6 = $("<td class='no'></td>").text(SCODMATERIA);
    var td7 = $("<td></td>").text(SCODGRUPO);
    var input = $('<input type="checkbox" class="chkRow" name="' + LMATERIA_ID + '" id="' + LGRUPO_ID + "-" + LMATERIA_ID + '"/>')
    var td12 = $("<td class='no'></td>").append(input)
    var td8 = $("<td></td>").html(HORARIO == null ? "" : getDiasHorario(HORARIO));
    var td9 = $("<td></td>").html(HORARIO == null ? "" : getHoraHorario(HORARIO));
    var td10 = $("<td class='no'></td>").text(SSEMANA);
    var td11 = $("<td class='no' name='ins'></td>").text(LTOTAL);
    var td13 = $("<td class='no' name='tope'></td>").text(LCANTMAXIMA);
    var td14 = $("<input id='" + LGRUPO_ID + "-" + LMATERIA_ID + "-obs' type='hidden'>").val(SOBS1);
    tr.append(td6)
    tr.append(td1)
    tr.append(td2)
    tr.append(td3)
    tr.append(td4)
    tr.append(td5)
    tr.append(td12)
    tr.append(td7)
    tr.append(td8)
    tr.append(td9)

    tr.append(td10)
    tr.append(td11)
    tr.append(td13)
    tr.append(td14)
    if (LTOTAL == 'Lleno') {
        tr.css({ 'pointer-events': 'none' });
        tr.find('td[name ="ins"]').css({ 'font-weight': 'bold' });
    }
    $('#tablaOfertaSemi').append(tr);
}

function obtenerDocumentos() {
    var token = localStorage.getItem("token");
    jQuery.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        'type': 'POST',
        'url': "http://wsnotas.nur.edu:8880/api/Registros/GetAlumnoDoc",
        'dataType': 'json',
        'success': cargarDocumentos
    });
}

function cargarDocumentos(resultado) {

    resultado.Data.forEach(function (element) {
        const {
            STIPODOCUMENTO_DSC,
            SESTADODOC_DSC
        } = element;
        var tr = $("<tr ></tr>")
        var td1 = $("<td></td>").text(STIPODOCUMENTO_DSC);
        var td2 = $("<td></td>").text(SESTADODOC_DSC);
        tr.append(td1)
        tr.append(td2)
        $('#tablaDocumentos').append(tr);
    });
}

function getDiasHorario(HORARIO) {
    var dias = ''

    HORARIO.forEach(function (element) {
        dias += element.DIA + " <br>";
    })
    return dias;
}

function getHoraHorario(HORARIO) {
    var hora = ''
    HORARIO.forEach(function (element) {
        hora += formatearHora(element.DTHRENTRADA) + " - " + formatearHora(element.DTHRSALIDA) + " <br>";
    })
    return hora;
}

$.fn.gparent = function (recursion) {
    //console.log('recursion: ' + recursion);
    if (recursion > 1) return $(this).parent().gparent(recursion - 1);
    return $(this).parent();
};

/* SOLICITUD INSCRIPCION -------------------------------------------------------------- */

$('#SolicitudRegistroDiv, #SolicitudRetiroDiv, #SolicitudCambioDiv').hide();
$('#SolicitudDeudorDiv').hide();
$('#SolicitudRegistroPendienteDiv').hide();
$('#SolicitudRegistroForm').hide();
$('#SolicitudRetiroPendienteDiv').hide();
$('#SolicitudRetiroForm').hide();

$("#registro_btn").click(function () {
    tieneSolicitudPendiente(1);
});
$("#retiro_btn").click(function () {
    tieneSolicitudPendiente(2);
});
$("#cambio_btn").click(function () {
    tieneSolicitudPendiente(3);
    $("#tablaAdicion_SCambio tbody").empty();
    $("#tablaRetiro_SCambio tbody").empty();
});

$("#enviar_SRegistro_btn").click(function () {
    var email = $('#emailContacto_SRegistro').val().trim();
    if (email == '' || !validateEmail(email))
        swal('', 'Necesitamos un email válido.');
    else
        enviarSolicitudRegistro();
});
$("#enviar_SRetiro_btn").click(function () {
    var email = $('#emailContacto_SRetiro').val().trim();
    if (email == '' || !validateEmail(email))
        swal('', 'Necesitamos un email válido.');
    else
        enviarSolicitudRetiro();
});
$("#enviar_SCambio_btn").click(function () {
    var email = $('#emailContacto_SCambio').val().trim();
    if (email == '' || !validateEmail(email))
        swal('', 'Necesitamos un email válido.');
    else {
        enviarSolicitudCambio();
    }
});

$("#anular_SRegistro_btn").click(function () {
    anularSolicitud(1);
});
$("#ok_SRegistro_btn").click(function () {
    enviarVisto(1);
});

$("#anular_SRetiro_btn").click(function () {
    anularSolicitud(2);
});
$("#ok_SRetiro_btn").click(function () {
    enviarVisto(2);
});

function validateEmail(email) {
    var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailReg.test(email);
}

function enviarSolicitudRegistro() {
    var alertaGrupoLleno = 0;
    var pMatRegistro = [];
    $("#tablaOferta input[type=checkbox]").each(function () {
        if ($(this).is(":checked")) {
            var id = $(this).attr('id')
            var obs = $("#" + id + "-obs").html();
            obs = obs.toLowerCase();
            if (obs.includes('lleno')) {
                alertaGrupoLleno = 1;
                return;
            }
            pMatRegistro.push(id);
        }
    });
    $("#tablaOfertaSemi input[type=checkbox]").each(function () {
        if ($(this).is(":checked")) {
            var id = $(this).attr('id')
            var obs = $("#" + id + "-obs").html();
            obs = obs.toLowerCase();
            if (obs.includes('lleno')) {
                alertaGrupoLleno = 1;
                return;
            }
            pMatRegistro.push(id);
        }
    });

    if (alertaGrupoLleno == 1) {
        swal("", "No se permite agregar grupos llenos");
        return;
    }
    if (pMatRegistro.length == 0) {
        swal('', 'Selecciona materias para tu inscripción.');
        return;
    }
    var pNombre = $('#nombreCodigo').html();
    var pCarreraId = localStorage.getItem("carreraId");
    var pPeriodoId = localStorage.getItem("periodoOferta");
    var pemailContacto = $('#emailContacto_SRegistro').val();
    var ptelefonoContacto = $('#telefonoContacto_SRegistro').val();
    var pNroCuotas = $('#cuotas_SRegistro').val();
    var pBeca = $('#beca_SRegistro').is(":checked") ? 1 : 0;

    var datos = new Object();
    datos.pNombre = pNombre;
    datos.pCarreraId = pCarreraId;
    datos.pPeriodoId = pPeriodoId;
    datos.pemailContacto = pemailContacto;
    datos.ptelefonoContacto = ptelefonoContacto;
    datos.pNroCuotas = pNroCuotas;
    datos.pBeca = pBeca;
    datos.pTipo = 1;
    datos.pMatRegistro = pMatRegistro;

    $("#mainLoader").css("z-index", "5");
    $("#mainLoader").show();
    var token = localStorage.getItem("token");
    jQuery.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        'type': 'POST',
        'data': JSON.stringify(datos),
        'url': "http://wsnotas.nur.edu:8880/api/Registros/SolicitudInscripcion",
        'dataType': 'json',
        'success': function (response) {
            if (response.Status) {
                $('#tablaOferta input[type=checkbox]').gparent(2).css("background-color", "white");
                $('#tablaOfertaSemi input[type=checkbox]').gparent(2).css("background-color", "white");
                $('#tablaOferta input[type=checkbox]:checked').gparent(2).css("background-color", "lightgray");
                $('#tablaOfertaSemi input[type=checkbox]:checked').gparent(2).css("background-color", "lightgray");
                swal("Solicitud enviada", "", "success");
                tieneSolicitudPendiente(1);
            } else {
                swal("", "Algo anda mal, tus datos no se enviaron.");
            }
            $("#mainLoader").hide();
        },
        'error': function () {
            swal("", "Algo anda mal, tus datos no se enviaron.");
            $("#mainLoader").hide();
        }
    });
}

function enviarSolicitudRetiro() {
    var pMatRetiro = [];
    $("#tablaNotas_SRetiro input[type=checkbox]").each(function () {
        if ($(this).is(":checked")) {
            pMatRetiro.push($(this).attr('id'));
        }
    });
    if (pMatRetiro.length == 0) {
        swal('', 'Selecciona materias para el retiro.');
        return;
    } else {
        var pNombre = $('#nombreCodigo').html();
        var pCarreraId = localStorage.getItem("carreraId");
        var pPeriodoId = localStorage.getItem("periodoOferta");
        var pemailContacto = $('#emailContacto_SRetiro').val();
        var ptelefonoContacto = $('#telefonoContacto_SRetiro').val();
        var pNroCuotas = $('#cuotas_SRegistro').val();

        var datos = new Object();
        datos.pNombre = pNombre;
        datos.pCarreraId = pCarreraId;
        datos.pPeriodoId = pPeriodoId;
        datos.pemailContacto = pemailContacto;
        datos.ptelefonoContacto = ptelefonoContacto;
        datos.pNroCuotas = 0;
        datos.pBeca = 0;
        datos.pTipo = 2;
        datos.pMatRetiro = pMatRetiro;

        $("#mainLoader").css("z-index", "5");
        $("#mainLoader").show();
        var token = localStorage.getItem("token");
        jQuery.ajax({
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            'type': 'POST',
            'data': JSON.stringify(datos),
            'url': "http://wsnotas.nur.edu:8880/api/Registros/SolicitudInscripcion",
            'dataType': 'json',
            'success': function (response) {
                if (response.Status) {
                    swal("Solicitud enviada", "", "success");
                    tieneSolicitudPendiente(2);
                } else {
                    swal("", "Algo anda mal, tus datos no se enviaron.");
                }
                $("#mainLoader").hide();
            },
            'error': function () {
                swal("", "Algo anda mal, tus datos no se enviaron.");
                $("#mainLoader").hide();
            }
        });
    }
}

function tieneSolicitudPendiente($tipo) {
    $('#SolicitudRegistroDiv, #SolicitudRetiroDiv, #SolicitudCambioDiv').hide();
    $('#SolicitudDeudorDiv').hide();

    $('#SolicitudRegistroPendienteDiv').hide();
    $('#SolicitudRegistroForm').hide();
    $('#anular_SRegistro_btn').show();
    $('#ok_SRegistro_btn').hide();

    $('#SolicitudRetiroPendienteDiv').hide();
    $('#SolicitudRetiroForm').hide();
    $('#anular_SRetiro_btn').show();
    $('#ok_SRetiro_btn').hide();

    $('#SolicitudCambioPendienteDiv').hide();
    $('#SolicitudCambioForm').hide();
    $('#anular_SCambio_btn').show();
    $('#ok_SCambio_btn').hide();

    var datos = new Object();
    datos.pPeriodoId = localStorage.getItem("periodoOferta");
    datos.pCarreraId = localStorage.getItem("carreraId");
    datos.pTipo = $tipo;
    var token = localStorage.getItem("token");
    jQuery.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        'type': 'POST',
        'data': JSON.stringify(datos),
        'url': "http://wsnotas.nur.edu:8880/api/Registros/GetTieneSolicitudPendiente",
        'dataType': 'json',
        'success': function (response) {
            var obj = response.Data;
            const {
                LTIPO,
                DTFECHSOLICITUD,
                BOOLAPROBADO,
                BOOLBECAINGRESADA,
                BOOLPLANPAGO,
                BOOLVISTOPORALUMNO,
                BOOLDEUDOR
            } = obj;
            if (obj.LTIPO == 1) {
                $('#SolicitudRegistroDiv').show(1000);
                // REGISTRO
                if (obj.BOOLVISTOPORALUMNO < 0) {
                    $('#SolicitudRegistroPendienteDiv').show();
                    $('#Fecha_SRegistro').text(obj.DTFECHSOLICITUD);
                    $('#barra1').html('<div class="progress"> <div class="progress-bar" role="progressbar" style="width: 33%;" aria-valuenow="33" aria-valuemin="0" aria-valuemax="100">33%</div></div>');
                    if (obj.BOOLAPROBADO >= 0) {
                        $('#anular_SRegistro_btn').hide();
                        $('#barra1').html('<div class="progress"> <div class="progress-bar" role="progressbar" style="width: 66%;" aria-valuenow="66" aria-valuemin="0" aria-valuemax="100">66%</div></div>');
                        if (obj.BOOLPLANPAGO >= 0) {
                            $('#ok_SRegistro_btn').show();
                            $('#barra1').html('<div class="progress"> <div class="progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">100%</div></div>');
                        }
                    }
                } else {
                    $('#SolicitudRegistroForm').show();
                }
                if (obj.BOOLDEUDOR == 1) {
                    $('#SolicitudDeudorDiv').show();
                    $('#SolicitudDeudorDiv').siblings().hide();
                }

            } else if (obj.LTIPO == 2) {
                $('#SolicitudRetiroDiv').show(1000);
                // RETIRO
                if (obj.BOOLVISTOPORALUMNO < 0) {
                    $('#SolicitudRetiroPendienteDiv').show();
                    $('#Fecha_SRetiro').text(obj.DTFECHSOLICITUD);
                    $('#barra2').html('<div class="progress"> <div class="progress-bar" role="progressbar" style="width: 33%;" aria-valuenow="33" aria-valuemin="0" aria-valuemax="100">33%</div></div>');
                    if (obj.BOOLAPROBADO >= 0) {
                        $('#anular_SRetiro_btn').hide();
                        $('#barra2').html('<div class="progress"> <div class="progress-bar" role="progressbar" style="width: 66%;" aria-valuenow="66" aria-valuemin="0" aria-valuemax="100">66%</div></div>');
                        if (obj.BOOLPLANPAGO >= 0) {
                            $('#ok_SRetiro_btn').show();
                            $('#barra2').html('<div class="progress"> <div class="progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">100%</div></div>');
                        }
                    }
                } else {
                    $('#SolicitudRetiroForm').show();
                    obtenerTablaNotas();
                }
            } else if (obj.LTIPO == 3) {
                $('#SolicitudCambioDiv').show(1000);
                // CAMBIO
                if (obj.BOOLVISTOPORALUMNO < 0) {
                    $('#SolicitudCambioPendienteDiv').show();
                    $('#Fecha_SCambio').text(obj.DTFECHSOLICITUD);
                    $('#barra3').html('<div class="progress"> <div class="progress-bar" role="progressbar" style="width: 33%;" aria-valuenow="33" aria-valuemin="0" aria-valuemax="100">33%</div></div>');
                    if (obj.BOOLAPROBADO >= 0) {
                        $('#anular_SCambio_btn').hide();
                        $('#barra3').html('<div class="progress"> <div class="progress-bar" role="progressbar" style="width: 66%;" aria-valuenow="66" aria-valuemin="0" aria-valuemax="100">66%</div></div>');
                        if (obj.BOOLPLANPAGO >= 0) {
                            $('#ok_SCambio_btn').show();
                            $('#barra3').html('<div class="progress"> <div class="progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">100%</div></div>');
                        }
                    }
                } else {
                    $('#SolicitudCambioForm').show();
                    cargarOfertaSolicitud();
                    obtenerTablaNotas();
                }
            }
        },
        error: function () {
            swal("Upps", "El servicio esta temporalmente inactivo");
        }
    });
}

function anularSolicitud($tipo) {
    var datos = new Object();
    datos.pCarreraId = localStorage.getItem("carreraId");
    datos.pPeriodoId = localStorage.getItem("periodoOferta");
    datos.pTipo = $tipo;
    var token = localStorage.getItem("token");
    jQuery.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        'type': 'POST',
        'data': JSON.stringify(datos),
        'url': "http://wsnotas.nur.edu:8880/api/Registros/AnularSolicitud",
        'dataType': 'json',
        'success': function (response) {
            if (response.Status) {
                swal("", "Solicitud anulada.");
                tieneSolicitudPendiente(response.Data.LTIPO);
            } else {
                swal("", "Su solicitud no pudo ser anulada.");
            }
        },
        'error': function () {
            swal("", "Su solicitud no pudo ser anulada.");
        }
    });
}

function obtenerTablaNotas() {
    var datos = new Object();
    datos.pCarreraId = localStorage.getItem("carreraId");
    datos.pPeriodoId = localStorage.getItem("periodoOferta");
    var token = localStorage.getItem("token");
    jQuery.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        'type': 'POST',
        'data': JSON.stringify(datos),
        'url': "http://wsnotas.nur.edu:8880/api/Registros/GetNotasFaltas",
        'dataType': 'json',
        'success': cargarNotasSolicitud,
        'error': function () {
            swal("Upps", "Hubo un problema al obtener materias");
        }
    });
}

function cargarNotasSolicitud(resultado) {
    $("#tablaNotas_SRetiro tbody, #tablaNotas_SRetiroCambio tbody").empty();
    if (resultado.Data.length == 0) {
        $("#tablaNotas_SRetiro, #tablaNotas_SRetiroCambio").append("<tr><td colspan='5' class='text-center'>   --    No hay materias para retirar    --  </td></tr>");
    }
    resultado.Data.forEach(function (element) {
        const {
            LGRUPO_ID,
            LCENTRO_ID,
            LMATERIA_ID,
            SCODCENTRO,
            LSEMESTRE,
            SCENTRO_DSC,
            SCODMATERIA,
            SSIGLA,
            SMATERIA_DSC,
            SCODGRUPO,
            DOCENTE,
        } = element;
        var tr = $("<tr></tr>");
        var tdcheck = $("<td></td>").html('<input type="checkbox" id="' + LGRUPO_ID + "-" + LMATERIA_ID + '"/>')
        var tdCodMateria = $("<td></td>").text(SCODMATERIA);
        var tdMateria = $("<td></td>").text(SMATERIA_DSC);
        var tdCodgrupo = $("<td></td>").text(SCODGRUPO);
        var tdDocente = $("<td></td>").text(DOCENTE);
        tr.append(tdcheck);
        tr.append(tdCodMateria);
        tr.append(tdMateria);
        tr.append(tdCodgrupo);
        tr.append(tdDocente);
        $("#tablaNotas_SRetiro, #tablaNotas_SRetiroCambio").append(tr);
    });
}

function enviarVisto($tipo) {
    var datos = new Object();
    datos.pCarreraId = localStorage.getItem("carreraId");
    datos.pPeriodoId = localStorage.getItem("periodoOferta");
    datos.pTipo = $tipo;
    var token = localStorage.getItem("token");
    jQuery.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        'type': 'POST',
        'data': JSON.stringify(datos),
        'url': "http://wsnotas.nur.edu:8880/api/Registros/SolicitudVista",
        'dataType': 'json',
        'success': function (response) {
            if (response.Status)
                window.location.reload();
        }
    });
}

function cargarOfertaSolicitud(resultado) {
    var carreraId = localStorage.getItem("carreraId");
    var periodoOferta = localStorage.getItem("periodoOferta");
    if (carreraId == 0 || periodoOferta == 0) {
        window.close();
    }
    var token = localStorage.getItem("token");
    var usuario = new Object();
    usuario.pCarreraId = carreraId;
    usuario.pPeriodoId = periodoOferta;
    jQuery.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        'type': 'POST',
        'data': JSON.stringify(usuario),
        'url': "http://wsnotas.nur.edu:8880/api/Registros/GetAlumnoOfertaa",
        'dataType': 'json',
        'success': function (resultado) {
            $("#tablaNotas_SOfertaCambio tbody").empty();
            var lista = resultado.Data;
            lista.forEach(function (element) {
                const {
                    LGRUPO_ID,
                    LCENTRO_ID,
                    LMATERIA_ID,
                    SMATERIA_DSC,
                    LSEMESTRE,
                    LCREDITOS,
                    LLABORATORIO,
                    DOCENTE,
                    SCODMATERIA,
                    CASILLA,
                    SCODGRUPO,
                    SSEMANA,
                    LESTADOGRUPO_ID,
                    SESTADOGRUPO_DSC,
                    SOBS1,
                    HORARIO
                } = element;
                var tr = $("<tr ></tr>")
                var input = $('<input type="checkbox" id="' + LGRUPO_ID + "-" + LMATERIA_ID + '"/>')
                var row = $("<td></td>").append(input);
                var td1 = $("<td></td>").text(LCENTRO_ID == 1 ? "PRE" : "SEMI");
                var td2 = $("<td></td>").text(SCODMATERIA);
                var td3 = $("<td></td>").text(SMATERIA_DSC);
                var td4 = $("<td></td>").text(SCODGRUPO);
                var td5 = $("<td></td>").text(LCREDITOS);
                var td6 = $("<td></td>").text(DOCENTE);
                var td7 = $("<td></td>").html(HORARIO == null ? "" : getDiasHorario(HORARIO));
                var td8 = $("<td></td>").html(HORARIO == null ? "" : getHoraHorario(HORARIO));
                var td9 = $("<td id='" + LGRUPO_ID + "-" + LMATERIA_ID + "-obs'></td>").text(SOBS1);
                tr.append(row);
                tr.append(td1);
                tr.append(td2);
                tr.append(td3);
                tr.append(td4);
                tr.append(td5);
                tr.append(td6);
                tr.append(td7);
                tr.append(td8);
                tr.append(td9);
                if (!SOBS1.toLowerCase().includes('lleno'))
                    $('#tablaNotas_SOfertaCambio').append(tr);
            });
        }
    });
}

function marcadoAdicion() {
    var pMatAdicion = [];
    $("#tablaNotas_SOfertaCambio input[type=checkbox]").each(function () {
        if ($(this).is(":checked")) {
            var myrow = $(this).gparent(2);
            pMatAdicion.push(myrow[0].outerHTML);
            $(this).gparent(2).remove();
        }
    });
    pMatAdicion.forEach(function (element) {
        $('#tablaAdicion_SCambio').append(element);
    });
    $('#tablaAdicion_SCambio input[type=checkbox]').prop("checked", true).prop("disabled", true);
}

function marcadoRetiro() {
    var pMatAdicion = [];
    $("#tablaNotas_SRetiroCambio input[type=checkbox]").each(function () {
        if ($(this).is(":checked")) {
            var myrow = $(this).gparent(2);
            pMatAdicion.push(myrow[0].outerHTML);
            $(this).gparent(2).remove();
        }
    });
    pMatAdicion.forEach(function (element) {
        $('#tablaRetiro_SCambio').append(element);
    });
    $('#tablaRetiro_SCambio input[type=checkbox]').prop("checked", true).prop("disabled", true);
}

function enviarSolicitudCambio() {
    var pMatAdicion = [];
    $("#tablaAdicion_SCambio input[type=checkbox]").each(function () {
        if ($(this).is(":checked"))
            pMatAdicion.push($(this).attr('id'));
    });
    var pMatRetiro = [];
    $("#tablaRetiro_SCambio input[type=checkbox]").each(function () {
        if ($(this).is(":checked"))
            pMatRetiro.push($(this).attr('id'));
    });
    if (pMatAdicion.length == 0 || pMatRetiro.length == 0) {
        swal('', 'Selecciona materias para la solicitud de Cambio.');
        return;
    } else {
        var pNombre = $('#nombreCodigo').html();
        var pCarreraId = localStorage.getItem("carreraId");
        var pPeriodoId = localStorage.getItem("periodoOferta");
        var pemailContacto = $('#emailContacto_SRetiro').val();
        var ptelefonoContacto = $('#telefonoContacto_SRetiro').val();
        var pNroCuotas = $('#cuotas_SRegistro').val();

        var datos = new Object();
        datos.pNombre = pNombre;
        datos.pCarreraId = pCarreraId;
        datos.pPeriodoId = pPeriodoId;
        datos.pemailContacto = pemailContacto;
        datos.ptelefonoContacto = ptelefonoContacto;
        datos.pNroCuotas = 0;
        datos.pBeca = 0;
        datos.pTipo = 3;
        datos.pMatAdicion = pMatAdicion;
        datos.pMatRetiro = pMatRetiro;

        $("#mainLoader").css("z-index", "5");
        $("#mainLoader").show();
        var token = localStorage.getItem("token");
        jQuery.ajax({
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            'type': 'POST',
            'data': JSON.stringify(datos),
            'url': "http://wsnotas.nur.edu:8880/api/Registros/SolicitudInscripcion",
            'dataType': 'json',
            'success': function (response) {
                if (response.Status) {
                    swal("Solicitud enviada", "", "success");
                    tieneSolicitudPendiente(2);
                } else {
                    swal("", "Algo anda mal, tus datos no se enviaron.");
                }
                $("#mainLoader").hide();
            },
            'error': function () {
                swal("", "Algo anda mal, tus datos no se enviaron.");
                $("#mainLoader").hide();
            }
        });
    }
}

function formatearHora(fecha) {
    if (isEmpty(fecha)) {
        return "";
    }
    var fechaFormat = new Date(fecha);
    return ('0' + fechaFormat.getHours()).slice(-2) + ":" + ('0' + fechaFormat.getMinutes()).slice(-2);
}

function isEmpty(value) {
    return (value == null || value === '');
}

$(document).on("change", ".chkRow", function () {
    var $box = $(this);
    if ($box.is(":checked")) {
        var group = "input:checkbox[name='" + $box.attr("name") + "']";
        $(group).prop("checked", false);
        $box.prop("checked", true);

    } else {
        $box.prop("checked", false);
    }
});

$("#selMateria_btn").click(function () {
    cargaMateriaSelecionada();
});

$("#contabilizar").click(function () {
    contabilizar();
});

function contabilizar() {
    var hayCosto = $("#tc").val();
    if (hayCosto == 1) {
        swal("Lo sentimos!", "Aún no existen costos para las materias", "info");
    }
    var periodoDsc = $("#prd").val();
    $("#spPeriodoDsc").text(periodoDsc);
    var auxPresencial = 0;
    var auxSemipresencial = 0;
    $("#tablaOferta .chkRow").each(function () {
        if ($(this).is(":checked")) {
            auxPresencial++;
        }
    });

    $("#tablaOfertaSemi .chkRow").each(function () {
        if ($(this).is(":checked")) {
            auxSemipresencial++;
        }
    });

    if (auxPresencial + auxSemipresencial == 0) {
        return;
    }
    $('#modalCostos').modal('show');

    $("#cantMatPre").text(auxPresencial);
    $("#cantMatSemi").text(auxSemipresencial);

    var costoPresencial = $("#cmp").val();
    var costoSemi = $("#cms").val();
    var costoCarnet = $("#cce").val();
    var costoAdm = $("#cga").val();
    var costoSeguro = $("#csu").val();
    var costoLaboratorio = $("#cl").val();
    //costoLaboratorio = isEmpty(costoLaboratorio) ? 0 : costoLaboratorio;

    costoPresencial = isEmpty(costoPresencial) ? 0 : parseFloat(costoPresencial);
    costoSemi = isEmpty(costoSemi) ? 0 : parseFloat(costoSemi);
    costoCarnet = isEmpty(costoCarnet) ? 0 : parseFloat(costoCarnet);
    costoAdm = isEmpty(costoAdm) ? 0 : parseFloat(costoAdm);
    costoSeguro = isEmpty(costoSeguro) ? 0 : parseFloat(costoSeguro);
    costoLaboratorio = isEmpty(costoLaboratorio) ? 0 : parseFloat(costoLaboratorio);

    var totalMatPres = auxPresencial * costoPresencial;
    var totalMatSemi = auxSemipresencial * costoSemi;

    $("#spMatPresencial").text(fnDosDigitos(totalMatPres) + " Bs.");
    $("#spMatSemipresencial").text(fnDosDigitos(totalMatSemi) + " Bs.");
    $("#spCarnetEst").text(fnDosDigitos(costoCarnet));
    $("#spSeguroEst").text(fnDosDigitos(costoSeguro));
    $("#spGastoAdm").text(fnDosDigitos(costoAdm));
    $("#spCostLab").text(fnDosDigitos(costoLaboratorio));

    var totalMaterias = parseFloat(totalMatPres) + parseFloat(totalMatSemi);
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
    $("#cbCuotas").val(4).trigger('change');
}

$('input[name=pagoContado]').on('change', function () {
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
    }
    else if ($(this).prop("checked") == false) {
        $('#cbCuotas').prop('disabled', false);
        $(".filaPagoContado").fadeOut();
        var costoMatFijo = $("#totalCostMat").val();
        $("#totalCostMat").parent().remove();
        mostrarCostosTotales(costoMatFijo);
    }
});

function mostrarCostosTotales(costo) {
    $("#spTotalCostMaterias").hide();
    $("#spTotalCostMaterias").text(fnDosDigitos(costo));
    $("#spTotalCostMaterias").fadeIn(2000);
    $("#spCostoFinalMat").hide();
    $("#spCostoFinalMat").text(fnDosDigitos(costo)).trigger('change');
    $("#spCostoFinalMat").fadeIn(2000);
}

$('#modalCostos').on('hidden.bs.modal', function () {
    $('#pagoContado').prop("checked", false);
    $('#pagoContado').change();
    resetComboCuotas();
});

$('#spCostoFinalMat').on('change', function () {
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
    $("#totalCost").text(fnDosDigitos(totales));
    $("#totalCost").fadeIn(2000);
});

function calcularPagoContado(costoMaterias) {
    return costoMaterias - (costoMaterias * 0.1);
}

$('#cbCuotas').on('change', function () {
    $("#tableCuotas").remove();
    var nroCuotas = $("#cbCuotas").find("option:selected").val();
    if (isEmpty(nroCuotas)) {
        return;
    }
    var costoFinalMat = $("#spCostoFinalMat").text();
    var costoCarnet = $("#spCarnetEst").text();
    var costoSeguro = $("#spSeguroEst").text();
    var costoLab = $("#spCostLab").text();

    costoFinalMat = parseFloat(costoFinalMat);
    costoCarnet = parseFloat(costoCarnet);
    costoSeguro = parseFloat(costoSeguro);
    costoLab = parseFloat(costoLab);

    var divDer = $(".div-der");
    var montoCuotas = costoFinalMat / nroCuotas;

    var table = "";

    for (let index = 0; index < nroCuotas; index++) {
        var aux = index + 1;
        if (index == 0) {
            table += `<tr class="primeraFila">
            <td class="itemCosto">` + aux + 'º Cuota' + `</td>
            <td class="table-der">` + fnDosDigitos((montoCuotas + costoCarnet + costoSeguro + costoLab)) + ` Bs.</td>
            </tr>`;
        }
        else {
            table += `<tr>
            <td class="itemCosto">` + aux + 'º Cuota' + `</td>
            <td class="table-der">` + fnDosDigitos(montoCuotas) + ` Bs.</td>
            </tr>`;
        }
    }

    divDer.append('<table id="tableCuotas" class="table"><tbody>' + table + '</tbody></table>')
});

function resetComboCuotas() {
    $("#cbCuotas").val($("#cbCuotas option:first").val());
    $("#tableCuotas").remove();
}

function fnDosDigitos(numero) {
    if (numero == 0) {
        return 0;
    }
    return Number(numero).toFixed(2);
}

$("#comprobante").click(function () {
    obtenerComprobantePago();

    setTimeout(function () {
        $("#btnEnviar").attr("disabled", true);
        $('#modalComprobante').modal('show');
    }, 1000);
})

$('#btnSubir').click(function (e) {
    e.preventDefault();
    $('#fichero').click();
});

$('#fichero').on("change", function (e) {
    var imgVal = $(this).val();
    var nombre = $("#fichero")[0].files[0].name;
    var ext = getExtension(imgVal);
    if (!isImage(ext)) {
        $("#iConfirm").hide();
        swal("Formato no válido", "Debe seleccionar una imagen.", "error");
    } else {
        $("#iConfirm").show();
        $('#iConfirm').prop('title', nombre);
    }
});

function getExtension(filename) {
    var parts = filename.split('.');
    return parts[parts.length - 1];
}

function isImage(filename) {
    var ext = getExtension(filename);
    switch (ext.toLowerCase()) {
        case 'jpg':
        case 'png':
        case 'jpeg':
            return true;
    }
    return false;
}

function cargaMateriaSelecionada() {
    var matLista = [];
    $('#tablaSelMateria tbody').empty();
    $("#tablaOferta input[type=checkbox]").each(function () {
        if ($(this).is(":checked")) {
            var id = $(this).attr('id')
            var obs = $("#" + id + "-obs").html();
            obs = obs.toLowerCase();
            if (obs.includes('lleno')) {
                alertaGrupoLleno = 1;
                return;
            }
            matLista.push(id);
            $('#tablaSelMateria tbody').append($(this).gparent(2)[0].outerHTML);
        }
    });
    $("#tablaOfertaSemi input[type=checkbox]").each(function () {
        if ($(this).is(":checked")) {
            var id = $(this).attr('id')
            var obs = $("#" + id + "-obs").html();
            obs = obs.toLowerCase();
            if (obs.includes('lleno')) {
                alertaGrupoLleno = 1;
                return;
            }
            matLista.push(id);
            $('#tablaSelMateria tbody').append($(this).gparent(2)[0].outerHTML);
        }
    });
    $('#tablaSelMateria .no').remove();
    if (matLista.length > 0) {
        localStorage.setItem("selMateria_lista", matLista);
        //swal("","Materias seleccionadas guardadas", "success");
        $('#Paso1_modal').modal('show');
    } else {
        localStorage.removeItem("selMateria_lista");
        swal("", "Seleccione materias para proceder con su inscripción.");
        return;
    }
};

$("#btnAtras").on("click", function () {
    $("#modalCostos").modal('hide');
    $("#Paso1_modal").modal('show');
})

function enviarInscripcion() {
    var pPeriodoId = parseInt(localStorage.getItem("periodoOferta"));
    var pCarreraId = parseInt(localStorage.getItem("carreraId"));
    var pGruposIds = localStorage.getItem("selMateria_lista").split(",");
    var token = localStorage.getItem("token");
    var datos = new Object();
    datos.pPeriodoId = pPeriodoId;
    datos.pCarreraId = pCarreraId;
    datos.pGruposIds = pGruposIds;
    $("#mainLoader").show();
    $("#modalCostos").modal('hide');
    jQuery.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        'type': 'POST',
        'data': JSON.stringify(datos),
        'url': "http://wsnotas.nur.edu:8880/api/Registros/InscripcionOnline",
        'dataType': 'json',
        'success': function (response) {
            if (response.Status) {
                swal("Proceso finalizado", "Usted acaba de inscribirse y adquirió una deuda, deberá realizar su pago mediante depósito o tranferencia bancaria en un plazo máximo de 48 horas y enviar la imagen, foto o captura de su comprobante, de lo contrario nos reservamos el derecho de retirar las materias aquí registradas.", "success");
                $('input[type=checkbox]').prop('disabled', true);
                $('#selMateria_btn').hide();
            } else {
                if (response.Message.includes('Bloqueo'))
                    swal("Formulario de Inscripción", response.Message, "info");
                else
                    swal("Formulario de Inscripción", "No fue posible completar su inscripción. Para consultas sobre su inscripción comunicarse con el Dpto. de Registros con el Whatsapp 76392502.", "info");
            }
            $("#mainLoader").hide();
        },
        'error': function () {
            swal("Formulario de Inscripción", "No fue posible completar su inscripción. Para consultas sobre su inscripción comunicarse con el Dpto. de Registros con el Whatsapp 76392502.", "info");
            $("#mainLoader").hide();
        }
    });

}

function titleCase(str) {
    str = str.toLowerCase().split(' ');
    for (var i = 0; i < str.length; i++) {
        str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
    }
    return str.join(' ');
}

$("#btnEnviar").click(function () {

    if ($("#fichero")[0].files.length <= 0) {
        swal("", "Debe seleccionar una imagen.", "error");
        return;
    }

    var formData = new FormData(document.getElementById("formComprobante"));

    $.ajax({
        type: 'POST',
        url: "http://phpnur.nur.edu:8099/mensajerocomprobante/index.php",
        dataType: "html",
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        beforeSend: function () {
            $('#modalComprobante').modal('hide');
            $(".modal-carga").show();
        }
    }).done(function (response) {
        $(".modal-carga").hide();
        var respuesta = "";
        switch (response) {
            case "1":
                respuesta = "Enviado correctamente.";
                insertarComprobante();
                break;
            case "2":
                respuesta = "No se pudo enviar correctamente. Por favor, intente más tarde.";
                break;
            case "3":
                respuesta = "Imagen muy grande. Por favor, intente cargar una imagen más pequeña.";
                break;
            case "4":
                respuesta = "Error al subir la imagen. Por favor, vuelva a intentar.";
                break;
            case "5":
                respuesta = "Formato no válido. Por favor, intente cargar una imagen PNG, JPG o JPEG.";
                break;
        }

        setTimeout(function () {
            swal("", respuesta, "info");

        }, 1000);

    }).fail(function (response) {
        swal("", "Error al enviar el comprobante de pago. Intente nuevamente por favor.", "error");
    });
});

function insertarEnvioComprobante(response) {
    if (response.Status) {
        return true;
    } else {
        return false;
    }
}

function insertarComprobante() {
    var aia = $("#hdnAia").val();
    var periodoOferta = localStorage.getItem("periodoOferta");
    var token = localStorage.getItem("token");

    var usuario = new Object();
    usuario.pAia = aia;
    usuario.pPeriodoId = periodoOferta;
    jQuery.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        'type': 'POST',
        'data': JSON.stringify(usuario),
        'url': "http://wsnotas.nur.edu:8880/api/Registros/InsertarComprobantePago",
        'dataType': 'json',
        'success': insertarEnvioComprobante
    });
}


function obtenerComprobantePago() {
    var token = localStorage.getItem("token");
    var periodoOferta = localStorage.getItem("periodoOferta");
    var aia = $("#hdnAia").val();

    var usuario = new Object();
    usuario.pAia = aia;
    usuario.pPeriodoId = periodoOferta;

    jQuery.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        'type': 'POST',
        'data': JSON.stringify(usuario),
        'url': "http://wsnotas.nur.edu:8880/api/Registros/TieneComprobantePago",
        'dataType': 'json',
        'success': comprobantePago
    });
}

function comprobantePago(response) {
    var respuesta = response;
    $("#modalComprobante .modal-footer").children().removeClass("divModalFooter");
    $("#modalComprobante .modal-footer").children().removeClass("divModalCostoFooter");
    if (respuesta.Status) {
        var datos = respuesta.Data
        if (datos == null) {
            $("#modalComprobante .modal-footer").children().addClass("divModalFooter");
            $("#hdnTcp").val(0);
            $("#btnSubir").attr("disabled", false);
            $("#txtEmailComprobante").attr("disabled", false);
            $("#txtTelefonoComprobante").attr("disabled", false);
            $("#btnEnviar").attr("disabled", false);
            $("#btnEnviar").removeClass("btn-disabled");
            $("#msgComprobante").hide();
        } else {
            $("#txtEstadoComp").show();
            $("#modalComprobante .modal-footer").children().addClass("divModalCostoFooter");
            $("#spEstadoComp").text(datos.SESTADOCOMPROBANTE_DSC);
            $("#hdnTcp").val(1);

            if (datos.LESTADOCOMPROBANTE_ID == 4) {
                $("#spEstadoComp").append(". Intente nuevamente por favor.")
                $("#btnSubir").attr("disabled", false);
                $("#txtEmailComprobante").attr("disabled", false);
                $("#txtTelefonoComprobante").attr("disabled", false);
                $("#btnEnviar").attr("disabled", false);
                $("#btnEnviar").removeClass("btn-disabled");
                $("#msgComprobante").hide();
            } else {
                $("#btnSubir").attr("disabled", true);
                $("#txtEmailComprobante").attr("disabled", true);
                $("#txtTelefonoComprobante").attr("disabled", true);
                $("#btnEnviar").attr("disabled", true);
                $("#btnEnviar").addClass("btn-disabled");
                $("#msgComprobante").show();
                $("#iConfirm").hide();
            }
        }
    } else {
        $("#modalComprobante .modal-footer").addClass("divModalFooter");
        $("#hdnTcp").val(0);
        $("#btnSubir").attr("disabled", false);
        $("#txtEmailComprobante").attr("disabled", false);
        $("#txtTelefonoComprobante").attr("disabled", false);
        $("#btnEnviar").attr("disabled", false);
        $("#btnEnviar").removeClass("btn-disabled");
        $("#msgComprobante").hide();
    }
}

$(document).on("change", "#txtEmailComprobante", function () {
    if ($("#divError-email").find(".msgError").length > 0) {
        $("#divError-email").find("p").remove();
    }
    var correo = $(this).val();
    if (!isEmail(correo)) {
        $('#divError-email').append(`<p id="msg" class="msgError">Correo inválido.</p>`);
    } else {
        $("#divError-email").find("p").remove();
    }
});

function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

function bloqueoInscripcion() {
    if (botonInscripcionVisible == 0) {
        setTimeout(function () { $('input[type=checkbox]').prop('disabled', true); }, 1000);
        $('#selMateria_btn').hide();
        return;
    }
    var token = localStorage.getItem("token");
    var pPeriodoId = parseInt(localStorage.getItem("periodoOferta"));
    var pCarreraId = parseInt(localStorage.getItem("carreraId"));
    var datos = new Object();
    datos.pPeriodoId = pPeriodoId;
    datos.pCarreraId = pCarreraId;
    $("#mainLoader").show();
    jQuery.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        'type': 'POST',
        'data': JSON.stringify(datos),
        'url': "http://wsnotas.nur.edu:8880/api/Registros/BloqueoInscripcion",
        'dataType': 'json',
        'success': function (response) {
            if (response.Data.BOOLBLOQUEO == 1) {
                setTimeout(function () { $('input[type=checkbox]').prop('disabled', true); }, 1000);
                $('#selMateria_btn').hide();
                swal("Formulario de Inscripción", "La inscripción en línea no se encuentra disponible. <br>" + response.Data.DESCRIPCION, "info")
            }
            $("#mainLoader").hide();
        },
        'error': function () {
            $("#mainLoader").hide();
            $('#selMateria_btn').hide();
        }
    });
}

$(function () {
    var btnEnviar = $("#btnEnviar").attr("disabled", true);
    $("#modalComprobante .requerido").change(function () {
        var valid = true;
        var correo = $("#txtEmailComprobante").val();
        var fichero = $("#fichero").val();
        $.each($("#modalComprobante .requerido"), function (index, value) {

            if (!$(value).val()) {
                valid = false;
            } else if ($(value).val() == fichero) {
                if (!isImage(getExtension(fichero))) {
                    valid = false;
                }
            }

            if (!isEmail(correo)) {
                valid = false;
            }
        });
        if (valid) {
            btnEnviar.attr("disabled", false);
            btnEnviar.removeClass("disabled");
        }
        else {
            btnEnviar.attr("disabled", true);
            btnEnviar.addClass("disabled");
        }
    });
});

$('#registro_btn, #retiro_btn, #cambio_btn').hide();
//$('#registro_btn, #retiro_btn, #cambio_btn, #selMateria_btn, #comprobante').hide();
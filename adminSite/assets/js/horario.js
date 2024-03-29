$(document).ready(function() {

    cargarPagina();

})
$("#imprimir").click(function() {
    window.print();
});

function cargarPagina() {
    comenzarMainCargado()
    InfoPersonal();
    InfoCarrera();
    obtenerHorarios();
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
        'url': "https://nurssl.nur.edu:8182/api/Registros/GetAlumnoCarreras",
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

function comenzarMainCargado() {
    $('#mainContainer').attr("style", 'display:none');
    $("#mainLoader").removeAttr("style");
}

function terminarMainCargado() {
    $('#mainLoader').attr("style", 'display:none');
    $("#mainContainer").removeAttr("style");
}

function cargarInfoCarrera(resultado) {

    resultado.Data.forEach(function(element) {
        const {
            LCARRERA_ID,
            SCARRERA_DSC,
            LCODPENSUM,
            LPERIODOACTUAL,
            LPERIODOINICIO,
            SCODCENTRO,
            LCREDVENCIDOS,
            LPERIODOACTUAL_ID
        } = element;
        var carrera = pad(LCARRERA_ID, 4) + '    ' + SCARRERA_DSC;
        var pensul = 'Cod. Pensum: ' + LCODPENSUM
        var semestreActual = 'Semestre Act.:  ' + LPERIODOACTUAL
        var semestreIngreso = 'Sem. Ingreso:    ' + LPERIODOINICIO
        var codigoCentro = 'Cod. Centro:    ' + SCODCENTRO
        var fechaPeriodo = LPERIODOACTUAL
        var creditosVencidos = 'Cred. Vencidos:     ' + LCREDVENCIDOS
        $('#carrera').text(carrera)
        $('#Pensul').text(pensul)
        $('#semestreIngreso').text(semestreIngreso)
        $('#codigoCentro').text(codigoCentro)
        $('#creditosVencidos').text(creditosVencidos)
        $('#semestreActual').text(semestreActual)
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
        'url': "https://nurssl.nur.edu:8182/api/Registros/GetAlumnoInfo",
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
    var NombreCompleto = SREGISTRO + '    ' + SNOMBRES + ' ' + SAPELLIDOP + ' ' + SAPELLIDOM;
    $('#nombreCodigo').text(NombreCompleto);
    var colegio = 'Colegio:	' + STIPOCOLEGIO
    $('#tipoColegio').text(colegio)
    $('#horasServicio').text('Horas de Servicio: ' + LHORASERVICIO)
}



function obtenerHorarios() {

    var carreraId = localStorage.getItem("carreraId");
    var periodoActual = localStorage.getItem("MasterPeriodoActual");
    var token = localStorage.getItem("token");
    var usuario = new Object();
    usuario.pCarreraId = carreraId;
    usuario.pPeriodoId = periodoActual;
    jQuery.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        'type': 'POST',
        'data': JSON.stringify(usuario),
        'url': "https://nurssl.nur.edu:8182/api/Registros/GetNotasFaltas",
        'dataType': 'json',
        'success': cargarHorarios
    });
}

function cargarHorarios(resultado) {
    resultado.Data.forEach(function(element) {
        const {
            SCENTRO_DSC,
            SCODMATERIA,
            SMATERIA_DSC,
            SCODGRUPO,
            DOCENTE,
            HORARIO
        } = element;
        var tr = $("<tr></tr>");
        var tdGrupo = $("<td></td>");
        tdGrupo.text(SCODGRUPO);
        tdGrupo.css("padding-left", "20px");

        tr.append($("<td></td>").text(SCODMATERIA + " " + SMATERIA_DSC));
        tr.append($("<td></td>").text(DOCENTE));
        tr.append(tdGrupo);

        var mismoHorario = false;
        var hora = "";
        var diasConcat = "";
        HORARIO.forEach(h => {
            diasConcat += h.SDIA_DSC.substring(0, 2).toUpperCase() + " ";
            if (hora) {
                if (hora == h.ENTRADA) {
                    mismoHorario = true;
                    return;
                }
            }
            hora = h.ENTRADA;
        });

        if (HORARIO == null) {
            tr.append($("<td></td>").text(""));
            tr.append($("<td></td>").text(""));
            tr.append($("<td></td>").text(HORARIO[0].SAULA_DSC));
            $('#tablaHorario').append(tr);
        } else {
            if (mismoHorario) {
                tr.append($("<td></td>").text(diasConcat));
                tr.append($("<td></td>").text(HORARIO[0].ENTRADA + " - " + HORARIO[0].SALIDA));
                tr.append($("<td></td>").text(HORARIO[0].SAULA_DSC));
                $('#tablaHorario').append(tr);
            } else {
                var conH = 1;
                HORARIO.forEach(h => {
                    if (conH > 1) {
                        tr = $("<tr ></tr>");
                        tr.append($("<td></td>").text(""));
                        tr.append($("<td></td>").text(""));
                        tr.append($("<td></td>").text(""));
                    }
                    tr.append($("<td></td>").text(h.SDIA_DSC.substring(0, 2).toUpperCase() + "  "));
                    tr.append($("<td></td>").text(h.ENTRADA + " - " + h.SALIDA));
                    tr.append($("<td></td>").text(HORARIO[0].SAULA_DSC));
                    $('#tablaHorario').append(tr);
                    conH++;
                });
            }
        }
    });
    terminarMainCargado()
}
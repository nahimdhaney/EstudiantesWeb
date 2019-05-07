$(document).ready(function() {
    cargarPagina();

})
$("#imprimir").click(function() {
    window.print();
});

function cargarPagina() {
    comenzarMainCargado()
    obtenerDocumentos();
    InfoPersonal();
    InfoCarrera();
    obtenerOferta();
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
        'url': "http://sisnur.nur.edu:8085/api/Registros/GetAlumnoCarreras",
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
        $('#idsemestreActual').text(semestreActual)
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
        'url': "http://sisnur.nur.edu:8085/api/Registros/GetAlumnoInfo",
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



function obtenerOferta() {
    var carreraId = localStorage.getItem("carreraId");
    var periodoOferta = localStorage.getItem("periodoOferta");
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
        'url': "http://sisnur.nur.edu:8085/api/Registros/GetAlumnoOferta",
        'dataType': 'json',
        'success': cargarOferta
    });
}

function cargarOferta(resultado) {
    var haySemi = false;
    if (resultado.Data.length == 0) {
        $('.materiasSemiPresencial').hide();
        $('.noMateriasSemiPresencial').show();
        $('.materiasPresencial').hide();
        $('.MateriasSemiPresencial').show();
        return;
    }
    resultado.Data.forEach(function(element) {
        const {
            LGRUPO_ID,
            LCENTRO_ID,
            SCENTRO_DSC,
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
        if (LCENTRO_ID == 2) {
            cargarSemi(element);
            haySemi = true;
        }
        var tr = $("<tr ></tr>")
        var input = $('<input type="checkbox"/>')
        var row = $("<td></td>").append(input);
        var td1 = $("<td></td>").text(SMATERIA_DSC);
        var td2 = $("<td></td>").text(LSEMESTRE);
        var td3 = $("<td></td>").text(LCREDITOS);
        var td4 = $("<td></td>").text(LLABORATORIO == 1 ? "*" : "");
        var td5 = $("<td></td>").text(DOCENTE);
        var td6 = $("<td></td>").text(SCODMATERIA);
        var td7 = $("<td></td>").text(SCODGRUPO);
        var td8 = $("<td></td>").text(HORARIO == null ? "" : getDiasHorario(HORARIO));
        var td9 = $("<td></td>").text(HORARIO == null ? "" : HORARIO[0].DTHRENTRADA + " - " + HORARIO[0].DTHRSALIDA);
        var td10 = $("<td></td>").text(SCODGRUPO);
        var td11 = $("<td></td>").text(SOBS1);
        tr.append(td1)
        tr.append(td2)
        tr.append(td3)
        tr.append(td4)
        tr.append(td5)
        tr.append(td6)
        tr.append(row)
        tr.append(td7)
        tr.append(td9)
        tr.append(td8)

        tr.append(td10)
        tr.append(td11)
        $('#tablaOferta').append(tr);
    });
    if (haySemi == false) {
        $('.materiasSemiPresencial').hide();
        $('.noMateriasSemiPresencial').show();
    }
    terminarMainCargado()
}

function cargarSemi(element) {
    const {
        LGRUPO_ID,
        LCENTRO_ID,
        SCENTRO_DSC,
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

    var td1 = $("<td></td>").text(SMATERIA_DSC);
    var td2 = $("<td></td>").text(LSEMESTRE);
    var td3 = $("<td></td>").text(LCREDITOS);
    var td4 = $("<td></td>").text(LLABORATORIO == 1 ? "*" : "");
    var td5 = $("<td></td>").text(DOCENTE);
    var td6 = $("<td></td>").text(SCODMATERIA);
    var td7 = $("<td></td>").text(SCODGRUPO);
    var input = $('<input type="checkbox"/>')
    var td12 = $("<td></td>").append(input)
    var td8 = $("<td></td>").text(HORARIO == null ? "" : getDiasHorario(HORARIO));
    var td9 = $("<td></td>").text(HORARIO == null ? "" : HORARIO[0].DTHRENTRADA + " - " + HORARIO[0].DTHRSALIDA);
    var td10 = $("<td></td>").text(SCODGRUPO);
    var td11 = $("<td></td>").text(SOBS1);
    tr.append(td1)
    tr.append(td2)
    tr.append(td3)
    tr.append(td4)
    tr.append(td5)
    tr.append(td6)
    tr.append(td12)
    tr.append(td7)
    tr.append(td9)
    tr.append(td8)

    tr.append(td10)
    tr.append(td11)

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
        'url': "http://sisnur.nur.edu:8085/api/Registros/GetAlumnoDoc",
        'dataType': 'json',
        'success': cargarDocumentos
    });
}

function cargarDocumentos(resultado) {

    resultado.Data.forEach(function(element) {
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
    HORARIO.forEach(function(element) {
        dias += element.SDIA_DSC.substring(0, 2).toUpperCase() + "  ";
    })
    return dias;
}
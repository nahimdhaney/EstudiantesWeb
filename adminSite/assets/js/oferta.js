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
        'url': "http://wsnotas.nur.edu:8880/api/Registros/GetAlumnoOferta",
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
        $('.MateriasSemiPresencial').show();
        terminarMainCargado()
        return;
    }
    resultado.Data.forEach(function(element) {
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
        if (LCENTRO_ID == 1) {
            var tr = $("<tr ></tr>")
            var input = $('<input type="checkbox" id="'+LGRUPO_ID+"-"+LMATERIA_ID+'"/>')
            var row = $("<td></td>").append(input);
            var td1 = $("<td></td>").text(SMATERIA_DSC);
            var td2 = $("<td></td>").text(LSEMESTRE);
            var td3 = $("<td></td>").text(LCREDITOS);
            var td4 = $("<td></td>").text(LLABORATORIO == 1 ? "*" : "");
            var td5 = $("<td></td>").text(DOCENTE);
            var td6 = $("<td></td>").text(SCODMATERIA);
            var td7 = $("<td></td>").text(SCODGRUPO);
            var td8 = $("<td></td>").html(HORARIO == null ? "" : getDiasHorario(HORARIO));
            var td9 = $("<td></td>").html(HORARIO == null ? "" : getHoraHorario(HORARIO));
            var td10 = $("<td></td>").text(SSEMANA);
            var td11 = $("<td id='"+LGRUPO_ID+"-"+LMATERIA_ID+"-obs'></td>").text(SOBS1);
            tr.append(td1)
            tr.append(td2)
            tr.append(td3)
            tr.append(td4)
            tr.append(td5)
            tr.append(td6)
            tr.append(row)
            tr.append(td7)
            tr.append(td8)
            tr.append(td9)

            tr.append(td10)
            tr.append(td11)
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
    var input = $('<input type="checkbox" id="'+LGRUPO_ID+"-"+LMATERIA_ID+'"/>')
    var td12 = $("<td></td>").append(input)
    var td8 = $("<td></td>").html(HORARIO == null ? "" : getDiasHorario(HORARIO));
    var td9 = $("<td></td>").html(HORARIO == null ? "" : getHoraHorario(HORARIO));
    var td10 = $("<td></td>").text(SSEMANA);
    var td11 = $("<td id='"+LGRUPO_ID+"-"+LMATERIA_ID+"-obs'></td>").text(SOBS1);
    tr.append(td1)
    tr.append(td2)
    tr.append(td3)
    tr.append(td4)
    tr.append(td5)
    tr.append(td6)
    tr.append(td12)
    tr.append(td7)
    tr.append(td8)
    tr.append(td9)

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
        'url': "http://wsnotas.nur.edu:8880/api/Registros/GetAlumnoDoc",
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
        dias += element.SDIA_DSC.substring(0, 2).toUpperCase() + " <br>";
    })
    return dias;
}

function getHoraHorario(HORARIO) {
    var hora = ''
    HORARIO.forEach(function(element) {
        hora += element.DTHRENTRADA+" - "+element.DTHRSALIDA+" <br>";
    })
    return hora;
}

$.fn.gparent = function(recursion) {
    //console.log('recursion: ' + recursion);
    if (recursion > 1) return $(this).parent().gparent(recursion - 1);
    return $(this).parent();
};

/* SOLICITUD INSCRIPCION -------------------------------------------------------------- */

$('#SolicitudRegistroDiv, #SolicitudRetiroDiv').hide();
$('#SolicitudDeudorDiv').hide();
$('#SolicitudRegistroPendienteDiv').hide();
$('#SolicitudRegistroForm').hide();
$('#SolicitudRetiroPendienteDiv').hide();
$('#SolicitudRetiroForm').hide();

$("#registro_btn").click(function() {
    tieneSolicitudPendiente(1);
});
$("#retiro_btn").click(function() {
    tieneSolicitudPendiente(2);
});

$("#enviar_SRegistro_btn").click(function() {
    var email = $('#emailContacto_SRegistro').val().trim();
    if(email == '' || !validateEmail(email))
        swal('','Necesitamos un email válido.');
    else
        enviarSolicitudRegistro();
});

$("#enviar_SRetiro_btn").click(function() {
    var email = $('#emailContacto_SRetiro').val().trim();
    if(email == '' || !validateEmail(email))
        swal('','Necesitamos un email válido.');
    else
        enviarSolicitudRetiro();
});

$("#anular_SRegistro_btn").click(function() {
    anularSolicitud(1);
});

$("#anular_SRetiro_btn").click(function() {
    anularSolicitud(2);
});

function validateEmail($email) {
  var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  return emailReg.test( $email );
}

function enviarSolicitudRegistro(){
    var alertaGrupoLleno = 0;
    var pPre = [];
    $("#tablaOferta input[type=checkbox]").each(function() {
        if ($(this).is(":checked")) {
            var id = $(this).attr('id')
            var obs = $("#"+id+"-obs").html();
            obs = obs.toLowerCase();
            obs = obs.replace("Lleno", "");
            obs = obs.replace("/", ",");
            obs = obs.trim();
            var valores = obs.split(",");
            if (obs != '0,0') {
                if (valores[0] == valores[1]) {
                    alertaGrupoLleno = 1;
                    return;                
                }
            }
            pPre.push(id);
        }
    });

    var pSemi = [];
    $("#tablaOfertaSemi input[type=checkbox]").each(function() {
        if ($(this).is(":checked")) {
            var id = $(this).attr('id')
            var obs = $("#"+id+"-obs").html();
            obs = obs.toLowerCase();
            obs = obs.replace("Lleno", "");
            obs = obs.replace("/", ",");
            obs = obs.trim();
            var valores = obs.split(",");
            if (obs != '0,0') {
                if (valores[0] == valores[1]) {
                    alertaGrupoLleno = 1;
                    return;                
                }
            }
            pSemi.push(id);
        }
    });
    
    if (alertaGrupoLleno == 1){
        swal("", "No se permite agregar grupos llenos");
        return;
    }
    
    if (pPre.length == 0 && pSemi.length == 0) {
        swal('','Selecciona materias para tu inscripción.');
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
    datos.pPre = pPre;
    datos.pSemi = pSemi;

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
        'success': function(response){
            if (response.Status) {
                $('#tablaOferta input[type=checkbox]').gparent(2).css("background-color", "white");
                $('#tablaOfertaSemi input[type=checkbox]').gparent(2).css("background-color", "white");
                $('#tablaOferta input[type=checkbox]:checked').gparent(2).css("background-color", "lightgray");
                $('#tablaOfertaSemi input[type=checkbox]:checked').gparent(2).css("background-color", "lightgray");
                swal("Solicitud enviada", "", "success");
                tieneSolicitudPendiente(1);
            }else{
                swal("Ups!", "Algo anda mal, tus datos no se enviaron.");
            }
            $("#mainLoader").hide();
        },
        'error': function(){
            swal("Ups!", "Algo anda mal, tus datos no se enviaron.");
            $("#mainLoader").hide();
        } 
    });
}

function enviarSolicitudRetiro(){
    var pMatRetiro = [];
    $("#tablaNotas_SRetiro input[type=checkbox]").each(function() {
        if ($(this).is(":checked")) {
            pMatRetiro.push($(this).attr('id'));
        }
    });
    if (pMatRetiro.length == 0) {
        swal('','Selecciona materias para el retiro.');
    } else{
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
        datos.pNroCuotas = pNroCuotas;
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
            //'url': "http://wsnotas.nur.edu:8880/api/Registros/SolicitudInscripcion",
            'url': "http://wsnotas.nur.edu:8880/api/Registros/SolicitudInscripcion",
            'dataType': 'json',
            'success': function(response){
                if (response.Status) {
                    swal("Solicitud enviada", "", "success");
                    tieneSolicitudPendiente(2);
                }else{
                    swal("Ups!", "Algo anda mal, tus datos no se enviaron.");
                }
                $("#mainLoader").hide();
            },
            'error': function(){
                swal("Ups!", "Algo anda mal, tus datos no se enviaron.");
                $("#mainLoader").hide();
            } 
        });
    }    
}

function tieneSolicitudPendiente($tipo){
    $('#SolicitudRegistroDiv, #SolicitudRetiroDiv').hide();
    $('#SolicitudDeudorDiv').hide();
    $('#SolicitudRegistroPendienteDiv').hide();
    $('#SolicitudRegistroForm').hide();
    $('#SolicitudRetiroPendienteDiv').hide();
    $('#SolicitudRetiroForm').hide();
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
        //'url': "http://wsnotas.nur.edu:8880/api/Registros/GetTieneSolicitudPendiente",
        'url': "http://wsnotas.nur.edu:8880/api/Registros/GetTieneSolicitudPendiente",
        'dataType': 'json',
        'success': function(response){
            var obj = response.Data;
            const { LTIPO, 
                DTFECHSOLICITUD,
                BOOLAPROBADO,
                BOOLPLANPAGO,
                BOOLDEUDOR
            } = obj;
            if (obj.LTIPO == 1) {
                $('#SolicitudRegistroDiv').show(1000);
                // REGISTRO
                if (obj.DTFECHSOLICITUD != null) {
                    $('#SolicitudRegistroPendienteDiv').show();
                    $('#Fecha_SRegistro').text(obj.DTFECHSOLICITUD);
                    $('#barra1').html('<div class="progress"> <div class="progress-bar" role="progressbar" style="width: 33%;" aria-valuenow="33" aria-valuemin="0" aria-valuemax="100">33%</div></div>');
                    if (BOOLAPROBADO >= 0) {
                        $('#barra1').html('<div class="progress"> <div class="progress-bar" role="progressbar" style="width: 66%;" aria-valuenow="66" aria-valuemin="0" aria-valuemax="100">66%</div></div>');
                        if (BOOLPLANPAGO >= 0) {
                            $('#barra1').html('<div class="progress"> <div class="progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">100%</div></div>');
                        }
                    }
                }else{
                    $('#SolicitudRegistroForm').show();
                }
                if (BOOLDEUDOR == 1) {
                    $('#SolicitudDeudorDiv').show();
                    $('#SolicitudDeudorDiv').siblings().hide();
                }

            }else if (obj.LTIPO == 2) {
                $('#SolicitudRetiroDiv').show(1000);
                // RETIRO
                if (obj.DTFECHSOLICITUD != null) {
                    $('#SolicitudRetiroPendienteDiv').show();
                    $('#Fecha_SRetiro').text(obj.DTFECHSOLICITUD);
                    $('#barra2').html('<div class="progress"> <div class="progress-bar" role="progressbar" style="width: 33%;" aria-valuenow="33" aria-valuemin="0" aria-valuemax="100">33%</div></div>');
                    if (BOOLAPROBADO >= 0) {
                        $('#barra2').html('<div class="progress"> <div class="progress-bar" role="progressbar" style="width: 66%;" aria-valuenow="66" aria-valuemin="0" aria-valuemax="100">66%</div></div>');
                        if (BOOLPLANPAGO >= 0) {
                            $('#barra2').html('<div class="progress"> <div class="progress-bar" role="progressbar" style="width: 100%;" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">100%</div></div>');
                        }
                    }
                }else{
                    $('#SolicitudRetiroForm').show();
                    obtenerTablaNotas();
                }
            }
        },
        error: function (){
            swal("Upps", "El servicio esta temporalmente inactivo");
        }
    });
}

function anularSolicitud($tipo){
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
        //'url': "http://wsnotas.nur.edu:8880/api/Registros/AnularSolicitud",
        'url': "http://wsnotas.nur.edu:8880/api/Registros/AnularSolicitud",
        'dataType': 'json',
        'success': function(response){
            if (response.Status) {
                swal("", "Solicitud anulada.");
                    tieneSolicitudPendiente(response.Data.LTIPO);
            }else{
                swal("", "Su solicitud no pudo ser anulada.");
            }
        },
        'error': function(){
            swal("", "Su solicitud no pudo ser anulada.");
        } 
    });
}

function obtenerTablaNotas(){
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
        'success': cargarNotas,
        'error': function(){
            swal("Upps", "Hubo un problema al obtener materias");
        } 
    });
}

function cargarNotas(resultado) {
    $("#tablaNotas_SRetiro tbody").empty();
    if (resultado.Data.length == 0) {
        $("#tablaNotas_SRetiro").append("<tr><td colspan='5' class='text-center'>   --    No hay materias para retirar    --  </td></tr>");
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
      var tdcheck = $("<td></td>").html('<input type="checkbox" id="'+LGRUPO_ID+"-"+LMATERIA_ID+'"/>')
      var tdCodMateria = $("<td></td>").text(SCODMATERIA);
      var tdMateria = $("<td></td>").text(SMATERIA_DSC);
      var tdCodgrupo = $("<td></td>").text(SCODGRUPO);
      var tdDocente = $("<td></td>").text(DOCENTE);
      tr.append(tdcheck);
      tr.append(tdCodMateria);
      tr.append(tdMateria);
      tr.append(tdCodgrupo);
      tr.append(tdDocente);
      $("#tablaNotas_SRetiro").append(tr);
    });
  }

//$("#email").hide();
//$("#tablaOferta td, #tablaOfertaSemi td").css("padding: 5px;");

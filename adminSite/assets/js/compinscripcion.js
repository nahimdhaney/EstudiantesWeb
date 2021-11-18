$(document).ready(function() {

    $('.fechaactual').text(new Date(Date.now()).toLocaleDateString());
    $('.horaactual').text(new Date(Date.now()).toLocaleTimeString());

    alumnoInfo()

});

function errorSesion() {
    //localStorage.removeItem("token ");
    var url = "../index.html ";
    $(location).attr("href ", url);
}

function alumnoInfo() {
    $('.loader').css('display', 'block');
    var variable = localStorage.getItem("compinscripcion");
    var param = variable.split('-');
    var datos = new Object();
    datos.pPeriodoId = param[0];
    datos.pCarreraId = param[1];
    var token = localStorage.getItem("token");
    $.ajax({
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
        type: "POST",
        url: "http://localhost:5000/api/Registros/GetComprobantepInscripcion",
        dataType: "json",
        data: JSON.stringify(datos),
        success: function(resultado) {
            const {
                SREGISTRO,
                NOMBRECOMPLETO,
                LHORASERVICIO,
                SCELULAR,
                SEMAIL,
                SDIRECCION,
                SCODCARRERA,
                SCARRERA_DSC,
                SPERIODO_DSC,
                DTFECHAREG,
                MATERIAS
            } = resultado.Data;
            // debugger;
            $(".nroregistro").text(SREGISTRO);
            $(".nombrecompleto").text(NOMBRECOMPLETO);
            $(".horasservicio").text(LHORASERVICIO);
            $(".carrera").text(SCODCARRERA);
            $(".periodo").text(SPERIODO_DSC);
            $(".fecharegistro").text(DTFECHAREG);
            $(".celular").text(SCELULAR);
            $(".email").text(SEMAIL);
            $(".direccion").text(SDIRECCION);
            $(".email").text(SEMAIL);

            MATERIAS.forEach(function(element) {
                const {
                    LGRUPO_ID,
                    SCODCENTRO,
                    SCENTRO_DSC,
                    SCODMATERIA,
                    SMATERIA_DSC,
                    LCREDITOS,
                    SCODGRUPO,
                    SSEMANA,
                    DTFECHINICIOGRUPO,
                    DOCENTE,
                    HORARIO
                } = element;
                var tr = $("<tr ></tr>")
                tr.append($("<td></td>").text(SCODCENTRO))
                tr.append($("<td></td>").text(SCODGRUPO))
                tr.append($("<td></td>").text(SMATERIA_DSC))
                tr.append($("<td></td>").text(DOCENTE))
                tr.append($("<td></td>").text(HORARIO == null ? "" : getDiasHorario(HORARIO)))
                tr.append($("<td></td>").text(SSEMANA))
                tr.append($("<td class='horario'></td>").text(HORARIO == null ? "" : HORARIO[0].ENTRADA + " - " + HORARIO[0].SALIDA))
                tr.append($("<td></td>").text(HORARIO[0].SAULA_DSC))

                var boolEsPre = 0;
                if (SCODGRUPO[SCODGRUPO.length - 1] == 'P') {
                    tr.append("<td>P</td>");
                    boolEsPre = 1;
                } else if (SSEMANA) {
                    if (SSEMANA[0] == 'P') {
                        tr.append("<td>P</td>");
                        boolEsPre = 1;
                    } else
                        tr.append("<td>V</td>");
                } else {
                    tr.append("<td>V</td>");
                }
                tr.append("<td><span class='inicla'>" + DTFECHINICIOGRUPO + "</span></td>");

                $('.tablamaterias').append(tr);
            });

            setTimeout(function() {
                $('.contenedor').css('display', 'block');
                $('.loader').css('display', 'none');
            }, 2000);
        },
        error: errorSesion
    });
}

function getDiasHorario(HORARIO) {
    var dias = ''
    HORARIO.forEach(function(element) {
        dias += element.SDIA_DSC.substring(0, 2).toUpperCase() + "  ";
    })
    return dias;
}
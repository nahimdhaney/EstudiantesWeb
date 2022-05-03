$(document).ready(function() {

    $('.fechaactual').text(new Date(Date.now()).toLocaleDateString());
    $('.horaactual').text(new Date(Date.now()).toLocaleTimeString());

    alumnoInfo()

});

function GotoDashboard() {
    window.location.href = "dashboard.html ";
}

function alumnoInfo() {
    $('.loader').css('display', 'block');
    var variable = localStorage.getItem("repcompinscripcion");
    if (variable == null) {
        GotoDashboard();
        return;
    }
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
        url: "https://nurssl.nur.edu:8182/api/Registros/GetComprobantepInscripcion",
        dataType: "json",
        data: JSON.stringify(datos),
        success: function(resultado) {
            if (resultado.Data == null) {
                GotoDashboard();
                return;
            }
            const {
                SREGISTRO,
                NOMBRECOMPLETO,
                LHORASERVICIO,
                SCELULAR,
                STELEFONO,
                SEMAIL,
                SDIRECCION,
                SCODCARRERA,
                SCARRERA_DSC,
                SPERIODO_DSC,
                DTFECHAREG,
                MATERIAS
            } = resultado.Data;
            $(".nroregistro").text(SREGISTRO);
            $(".nombrecompleto").text(NOMBRECOMPLETO);
            $(".horasservicio").text(LHORASERVICIO);
            $(".carrera").text(SCODCARRERA);
            $(".periodo").text(SPERIODO_DSC);
            $(".fecharegistro").text(DTFECHAREG);
            $(".celular").text(SCELULAR);
            $(".telffijo").text(STELEFONO);
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
                tr.append($("<td class='docente_td'></td>").text(DOCENTE))
                tr.append($("<td></td>").text(SSEMANA))

                var boolEsPre = 0;
                if (SCODGRUPO.includes('P')) {
                    tr.append("<td>P</td>");
                    boolEsPre = 1;
                } else if (SSEMANA) {
                    if (SSEMANA.includes('P') || SSEMANA.includes('P')) {
                        tr.append("<td>P</td>");
                        boolEsPre = 1;
                    } else {
                        tr.append("<td>V</td>");
                    }
                } else {
                    tr.append("<td>V</td>");
                }

                // tr.append($("<td></td>").text(HORARIO == null ? "" : getDiasHorario(HORARIO)))
                // tr.append($("<td class='horario_td'></td>").text(HORARIO == null ? "" : HORARIO[0].ENTRADA + " - " + HORARIO[0].SALIDA))
                // tr.append($("<td></td>").text(HORARIO[0].SAULA_DSC))
                // tr.append("<td><span class='inicla'>" + DTFECHINICIOGRUPO + "</span></td>");

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
                    tr.append($("<td></td>").text(""));
                    tr.append("<td><span class='inicla'>" + DTFECHINICIOGRUPO + "</span></td>");
                    $('.tablamaterias').append(tr);
                } else {
                    if (mismoHorario) {
                        tr.append($("<td></td>").text(diasConcat));
                        tr.append($("<td></td>").text(HORARIO[0].ENTRADA + " - " + HORARIO[0].SALIDA));
                        tr.append($("<td></td>").text(HORARIO[0].SAULA_DSC))
                        tr.append("<td><span class='inicla'>" + DTFECHINICIOGRUPO + "</span></td>");
                        $('.tablamaterias').append(tr);
                    } else {
                        var conH = 1;
                        HORARIO.forEach(h => {
                            if (conH > 1) {
                                tr = $("<tr ></tr>");
                                tr.append($("<td></td>").text(""));
                                tr.append($("<td></td>").text(""));
                                tr.append($("<td></td>").text(""));
                                tr.append($("<td></td>").text(""));
                                tr.append($("<td></td>").text(""));
                                tr.append($("<td></td>").text(""));
                            }
                            tr.append($("<td></td>").text(h.SDIA_DSC.substring(0, 2).toUpperCase() + "  "));
                            tr.append($("<td></td>").text(h.ENTRADA + " - " + h.SALIDA));
                            tr.append($("<td></td>").text(h.SAULA_DSC))
                            if (conH == 1)
                                tr.append("<td><span class='inicla'>" + DTFECHINICIOGRUPO + "</span></td>");
                            $('.tablamaterias').append(tr);
                            conH++;
                        });
                    }
                }
            });

            setTimeout(function() {
                $('.contenedor').css('display', 'block');
                $('.loader').css('display', 'none');
            }, 2000);
        },
        error: GotoDashboard
    });
}
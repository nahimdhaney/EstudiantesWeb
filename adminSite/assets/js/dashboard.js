var horasServicio = 120;

function errorSesion() {
    localStorage.removeItem("token");
    var url = '../index.html'
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
        N: /\xD1/g
    };
    for (var letra in mapaAcentosHex) {
        var expressaoRegular = mapaAcentosHex[letra];
        string = string.replace(expressaoRegular, letra);
    }
    return string;
}

function comenzarCargado() {
    $("#loader").removeAttr("style");
    $('.content').attr("style", 'display:none');
}

function terminarCargado() {
    $(".content").removeAttr("style");
    $('#loader').attr("style", 'display:none');
}

function logout() {
    localStorage.removeItem("token");
}

function verPerfil() {
    $('#containerNotas').hide();
    $('#containerAsistencia').hide();
    $('#containerPensul').hide();
    $("#containerPerfil").fadeIn();
    $('#bodyClick').click()
}

function verHistorial() {
    $('#containerNotas').hide();
    $('#containerAsistencia').hide();
    $('#containerPerfil').hide();
    $('#bodyClick').click()
    var isHistorialCargado = $('#isHistorialCargado').val();
    if (isHistorialCargado == 1) {
        $('#containerPensul').show();
        return;
    }
    comenzarCargado();
    var carreraId = $('#carrerasAlumno').find(":selected").val();
    $('#containerPensul').show();
    var usuario = new Object();
    usuario.pCarreraId = carreraId;
    var token = localStorage.getItem("token");
    if (token != '') {
        jQuery.ajax({
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            'type': 'POST',
            'url': "http://wsnotas.nur.edu:8880/api/Registros/GetAlumnoHistorial",
            'dataType': 'json',
            'data': JSON.stringify(usuario),
            'success': carrgarHistorial,
            'error': errorSesion
        });
    }
    return false;
}

function carrgarHistorial(resultado) {
    var semestre = ' SEMESTRE';
    var espacio = ' - ';
    var arbol = [];
    resultado.Data.CURSADAS.forEach(function(element) {
        const {
            MATERIAS,
            REQUISITOS
        } = element;
        var materiaPadre = removerAcentos(MATERIAS.SMATERIA_DSC.toUpperCase()) + espacio + MATERIAS.LSEMESTRE + semestre;
        var count = 0;
        REQUISITOS.forEach(function(req) {
            if (req.LSEMESTRE == null)
                return;
            var objNodo = new Object();
            var numeroSemestre = req.LSEMESTRE == null ? '' : req.LSEMESTRE;
            objNodo.from = removerAcentos(req.SMATERIA_DSC.toUpperCase()) + espacio + numeroSemestre + semestre;
            objNodo.to = materiaPadre;
            objNodo.value = 1;
            arbol.push(objNodo)
            count++;
        });
        if (count == 0) {
            var objNodo = new Object();
            var numeroSemestre = MATERIAS.LSEMESTRE;
            objNodo.from = removerAcentos(MATERIAS.SMATERIA_DSC.toUpperCase()) + espacio + MATERIAS.LSEMESTRE + semestre;
            objNodo.to = '';
            objNodo.value = 1;
            objNodo.semestre = MATERIAS.LSEMESTRE
            arbol.push(objNodo)
        }
    });
    resultado.Data.FALTANTES.forEach(function(element) {
        const {
            MATERIAS,
            REQUISITOS,
        } = element;
        var materiaPadre = removerAcentos(MATERIAS.SMATERIA_DSC.toUpperCase()) + espacio + MATERIAS.LSEMESTRE + semestre;
        var count = 0;
        REQUISITOS.forEach(function(req) {
            if (req.LSEMESTRE == null)
                return;
            var objNodo = new Object();
            var numeroSemestre = req.LSEMESTRE == null ? '' : req.LSEMESTRE;
            objNodo.from = removerAcentos(req.SMATERIA_DSC.toUpperCase()) + espacio + numeroSemestre + semestre;
            objNodo.to = materiaPadre;
            objNodo.value = 1;
            objNodo.nodeColor = '#757575';
            arbol.push(objNodo);
            count++;
        });
        if (count == 0) {
            var objNodo = new Object();
            var numeroSemestre = MATERIAS.LSEMESTRE;
            objNodo.from = removerAcentos(MATERIAS.SMATERIA_DSC.toUpperCase()) + espacio + MATERIAS.LSEMESTRE + semestre;
            objNodo.to = '';
            objNodo.value = 1;
            objNodo.semestre = MATERIAS.LSEMESTRE
            arbol.push(objNodo)
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
    nodeTemplate.cursorOverStyle = am4core.MouseCursorStyle.pointer
    terminarCargado();
    $('#isHistorialCargado').val(1);
}
$(document).ready(function() {
    var esconderPeriodos = false;
    cargarPagina();
    $("#carrerasAlumno").change(function() {
        localStorage.setItem("carreraId", this.value);
        localStorage.setItem("carreraNombre", $(this).find("option:selected").text());

        if ($('#containerPensul').is(":visible")) {
            $('#isHistorialCargado').val(0)
            verHistorial()

        }
        $('#verMasPeriodos').remove();
        $('.periodosInvisibles').remove();
        comenzarMainCargado();
        $('#firstLoad').val('1');
        cargarPagina();
    });

    function errorSesion() {
        localStorage.removeItem("token");
        var url = '../index.html'
        $(location).attr("href", url);
    }

    function comenzarMainCargado() {
        $('#mainContainer').attr("style", 'display:none');
        $("#mainLoader").removeAttr("style");
    }
    // $("#logout").click(function() {
    //     
    //     localStorage.removeItem("token");
    //     window.location = "../index.html";
    //     return false;
    // });
    $("#closePensul").click(function() {
        $('#containerNotas').show();
        $('#containerAsistencia').show();
        $('#containerPensul').hide();
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
                cancelButtonText: "Cancelar"
            }).then((result) => {
                var token = localStorage.getItem("token");
                var usuario = new Object();
                usuario.pPinActual = pinAnterior;
                usuario.pPinNuevo = nuevoPin;
                $.ajax({
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    'type': 'POST',
                    'data': JSON.stringify(usuario),
                    'url': "http://wsnotas.nur.edu:8880/api/Registros/UpdatePin",
                    'dataType': 'json',
                }).done(function(response) {
                    if (response.Status) {
                        swal(
                            'Operacion Exitosa!',
                            'Pin actualizado correctamente!',
                            'success'
                        )
                    } else {
                        swal("Error", "Hubo un error al actualizar su Pin", "error")
                    }
                });
            })
        } else {
            swal("Error", "Los Pines no son iguales.", "error")
        }
        $('#modalCambiarPin').modal('hide')
        $('#formCambiarPin')[0].reset();
        return false;
    });
    $("#verOferta").click(function() {
        var periodoOferta = $('#periodosOferta').find(":selected").val();
        var carreraId = $('#carrerasAlumno').find(":selected").val();
        localStorage.setItem("periodoOferta", periodoOferta);
        localStorage.setItem("carreraId", carreraId);
        $('#modalOferta').modal('hide')
        window.location = "oferta.html";
    });

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
            N: /\xD1/g
        };
        for (var letra in mapaAcentosHex) {
            var expressaoRegular = mapaAcentosHex[letra];
            string = string.replace(expressaoRegular, letra);
        }
        return string;
    }
    $(document).on('click', '#verMasPeriodos', function() {
        if (esconderPeriodos == false) {
            $('.periodosInvisibles').removeAttr("style");
            $(this).children().text('Ver Menos Periodos');
            esconderPeriodos = true;
        } else {
            $('.periodosInvisibles').attr("style", 'display:none');
            $(this).children().text('Ver Mas Periodos');
            esconderPeriodos = false;
        }
    });
    $(document).on('click', '.semestre', function() {
        comenzarCargado();
        $('#containerNotas').show();
        $('#containerAsistencia').show();
        var id = parseInt(JSON.parse($(this).attr('data-json')))
        var dperiodoActual = $(this).children("p").text();
        $('#containerPensul').hide();
        $('#containerPerfil').hide();
        $('#periodoActual').text(dperiodoActual);
        $('#dperiodoActual').val(dperiodoActual);
        $('#hperiodoActual').val(id);
        obtenerNotas(id);
    });

    function comenzarCargado() {
        $("#loader").removeAttr("style");
        $('.content').attr("style", 'display:none');
    }

    function terminarCargado() {
        $(".content").removeAttr("style");
        $('#loader').attr("style", 'display:none');
    }

    function terminarMainCargado() {
        $('#mainLoader').attr("style", 'display:none');
        $("#mainContainer").removeAttr("style");
    }

    function cargarPagina() {
        var token = localStorage.getItem("token");
        var tieneBloqueo = parseInt(localStorage.getItem("tieneBloqueo"));
        obtenerNombre(token);
        obtenerImagen(token);
        getCarreraInfo(token);
        GetPeriodosOfertas();
        if (tieneBloqueo == 0) {
            GetPeriodosCursados();
        } else {
            $('#titlePeriodos').remove();
            $('#containerNotas').remove();
            $('#containerAsistencia').remove();
            $("#containerDeuda").removeAttr("style");
            $('#containerDeuda').fadeIn();
        }

    }


    function resultadoBloqueo(resultado) {
        var data = resultado.Data.toLowerCase();
        if (data.inclues(bloqueo))
            cargarCreditos(LHORASERVICIO);
    }

    function cargarCreditos(creditosVencidos) {
        am4core.useTheme(am4themes_animated);
        // Themes end
        var chart = am4core.create("divCreditos", am4charts.PieChart);
        chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
        chart.data = [{
            country: "Realizadas",
            value: creditosVencidos
        }, {
            country: "Restantes",
            value: horasServicio - creditosVencidos
        }];
        chart.radius = am4core.percent(70);
        chart.innerRadius = am4core.percent(40);
        chart.startAngle = 180;
        chart.endAngle = 360;
        var series = chart.series.push(new am4charts.PieSeries());
        series.dataFields.value = "value";
        series.dataFields.category = "country";
        series.slices.template.cornerRadius = 10;
        series.slices.template.innerCornerRadius = 7;
        series.slices.template.draggable = true;
        series.slices.template.inert = true;
        series.alignLabels = false;
        series.hiddenState.properties.startAngle = 90;
        series.hiddenState.properties.endAngle = 90;
        chart.legend = new am4charts.Legend();
    }

    function obtenerImagen(token) {
        if (token != '') {
            $.ajax({
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                'type': 'POST',
                'url': "http://wsnotas.nur.edu:8880/api/Registros/GetAlumnoImagen",
                'dataType': 'json',
                'success': cargarImagem,
                'error': errorSesion
            });
        }
    }

    function cargarImagem(resultado) {
        var imagen = 'data:image/png;base64,' + resultado.Data;
        $("#imgUsuario").attr("src", imagen);
    }

    function obtenerNombre(token) {
        if (token != '') {
            $.ajax({
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                'type': 'POST',
                'url': "http://wsnotas.nur.edu:8880/api/Registros/GetAlumnoInfo",
                'dataType': 'json',
                'success': resultado,
                'error': errorSesion
            });
        }
    }

    function resultado(resultado) {
        const {
            SAPELLIDOP,
            SAPELLIDOM,
            SNOMBRES,
            SCELULAR,
            STELEFONO,
            SEMAIL,
            LHORASERVICIO,
        } = resultado.Data;
        var NombreCompleto = SNOMBRES + ' ' + SAPELLIDOP + ' ' + SAPELLIDOM
        $('#nombreEstudiante').text(NombreCompleto)
        $('#inputTelefono').val(STELEFONO);
        $('#inputCelular').val(SCELULAR);
        $('#inputEmail').val(SEMAIL);
        $('#tituloNombreEstudiante').text(NombreCompleto);
        cargarCreditos(LHORASERVICIO);
    }

    function getCarreraInfo(token) {
        if (token != '') {
            jQuery.ajax({
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                'type': 'POST',
                'url': "http://wsnotas.nur.edu:8880/api/Registros/GetAlumnoCarreras",
                'dataType': 'json',
                'success': infoCarrera,
                'error': errorSesion
            });
        }
    }

    function infoCarrera(resultado) {
        var count = 0;
        //$('#carrerasAlumno').empty();
        var carreras = '';
        resultado.Data.forEach(function(element) {
            const {
                LCARRERA_ID,
                SCARRERA_DSC,
                LPERIODOACTUAL,
                LPERIODOACTUAL_ID
            } = element;
            $('#MasterPeriodoActual').val(LPERIODOACTUAL_ID);
            localStorage.setItem("MasterPeriodoActual", LPERIODOACTUAL_ID);
            $('#hperiodoActual').val(LPERIODOACTUAL_ID);
            $('#dperiodoActual').val(LPERIODOACTUAL)
            $('#periodoActual').text(LPERIODOACTUAL)
            if (count == 0) {
                obtenerNotas(LPERIODOACTUAL_ID);
                if ($('#firstLoad').val() == 1) {
                    return;
                }
            };
            var opcion = $("<option></option>")
            opcion.attr("value", LCARRERA_ID);
            opcion.text(SCARRERA_DSC);
            $('#carrerasAlumno').append(opcion);
            if (carreras == '') {
                localStorage.setItem("carreraId", LCARRERA_ID);
                localStorage.setItem("carreraNombre", SCARRERA_DSC);
                carreras += SCARRERA_DSC;
            } else {
                carreras += ' , ' + SCARRERA_DSC;
            }
            count++;
        });
        $('#carreraPerfil').text(carreras)
    }

    function GetPeriodosCursados() {
        $('.semestre').remove();
        var carreraId = $('#carrerasAlumno').find(":selected").val();
        var usuario = new Object();
        usuario.pCarreraId = carreraId;
        var token = localStorage.getItem("token");
        if (token != '') {
            jQuery.ajax({
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                'type': 'POST',
                'url': "http://wsnotas.nur.edu:8880/api/Registros/GetPeriodosCursados",
                'dataType': 'json',
                'data': JSON.stringify(usuario),
                'success': periodosCursados,
                'error': errorSesion
            });
        }
    }

    function periodosCursados(resultado) {
        var count = 0;
        var length = resultado.Data.length;
        resultado.Data.forEach(function(element) {
            const {
                SPERIODO_DSC,
                LPERIODO_ID
            } = element;
            if (length > 2) {
                if (count == 0) {
                    var lista = $("<li></li>")
                    var link = $("<a></a>")
                    var parrafo = $("<p></p>").text("Ver mas Periodos");
                    parrafo.attr("style", 'margin-left:0px;text-align:center');
                    parrafo.attr("class", "periodos");
                    link.attr("id", "verMasPeriodos");
                    link.append(parrafo);
                    lista.append(link);
                    $("#periodosTitle").after(lista);
                }
                if (count >= length - 2) {
                    var lista = $("<li></li>")
                    var link = $("<a></a>")
                    var parrafo = $("<p></p>").text(SPERIODO_DSC);
                    parrafo.attr("class", "periodos");
                    link.attr("class", "semestre");
                    link.attr("data-json", LPERIODO_ID);
                    link.append(parrafo);
                    lista.append(link);
                    $("#periodosTitle").after(lista);
                }
                if (count < length - 2) {
                    var lista = $("<li></li>")
                    var link = $("<a></a>")
                    var parrafo = $("<p></p>").text(SPERIODO_DSC);
                    parrafo.attr("class", "periodos");
                    link.attr("class", "semestre");
                    link.attr("data-json", LPERIODO_ID);
                    link.append(parrafo);
                    lista.append(link);
                    lista.attr("style", 'display:none');
                    lista.attr("class", "periodosInvisibles");
                    $("#periodosTitle").after(lista);
                }
            } else {
                var lista = $("<li></li>")
                var link = $("<a></a>")
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
        var carreraId = $('#carrerasAlumno').find(":selected").val();
        var usuario = new Object();
        usuario.pCarreraId = carreraId;
        var token = localStorage.getItem("token");
        if (token != '') {
            jQuery.ajax({
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                'type': 'POST',
                'url': "http://wsnotas.nur.edu:8880/api/Registros/GetPeriodosOferta",
                'dataType': 'json',
                'data': JSON.stringify(usuario),
                'success': periodosOfertas,
                'error': errorSesion
            });
        }
    }

    function periodosOfertas(resultado) {
        for (i in resultado.Data) {
            var element = resultado.Data[i];
            const {
                SPERIODO_DSC,
                LPERIODO_ID
            } = element;
            var opcion = $("<option></option>")
            opcion.attr("value", LPERIODO_ID);
            opcion.text(SPERIODO_DSC);
            $('#periodosOferta').append(opcion);
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
        var periodoActual = $('#dperiodoActual').val();
        var semestre = periodoActual.split("-")[1];
        var tieneBloqueo = parseInt(localStorage.getItem("tieneBloqueo"));
        if (tieneBloqueo == 0) {
            mostrarColumnas(semestre);
        }
        var token = localStorage.getItem("token");
        var carreraId = $('#carrerasAlumno').find(":selected").val();
        var userId = localStorage.getItem("idUser");
        var usuario = new Object();
        usuario.pCarreraId = carreraId;
        usuario.pPeriodoId = periodoId;
        if (userId != '') {
            jQuery.ajax({
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                'type': 'POST',
                'data': JSON.stringify(usuario),
                'url': "http://wsnotas.nur.edu:8880/api/Registros/GetNotasFaltas",
                'dataType': 'json',
                'success': cargarNotas,
                'error': errorSesion
            });
        }
    }

    function mostrarColumnas(semestre) {
        switch (semestre) {
            case '1':
                $(".firstSemester").removeAttr("style");
                if (!$('.secondSemester')[0].hasAttribute('style')) {
                    $('.secondSemester').attr("style", 'display:none');
                }
                if (!$('.verano')[0].hasAttribute('style')) {
                    $('.verano').attr("style", 'display:none');
                }
                break;
            case '2':
                $(".secondSemester").removeAttr("style");
                if (!$('.firstSemester')[0].hasAttribute('style')) {
                    $('.firstSemester').attr("style", 'display:none');
                }
                if (!$('.verano')[0].hasAttribute('style')) {
                    $('.verano').attr("style", 'display:none');
                }
                break;
            case 'V':
                $(".verano").removeAttr("style");
                if (!$('.secondSemester')[0].hasAttribute('style')) {
                    $('.secondSemester').attr("style", 'display:none');
                }
                if (!$('.firstSemester')[0].hasAttribute('style')) {
                    $('.firstSemester').attr("style", 'display:none');
                }
                break;
        }
    }

    function cargarNotas(resultado) {
        $('#tablaNotas').empty();
        $('#tablaAsistencia').empty();
        resultado.Data.forEach(function(element) {
            const {
                SCODMATERIA,
                SSIGLA,
                DOCENTE,
                EXFINAL,
                FINAL,
                PAR1,
                PAR2,
                SMATERIA_DSC,
                LCENTRO_ID
            } = element;
            var tr = $("<tr ></tr>")
            var tdCodMateria = $("<td></td>").text(SCODMATERIA);
            var tdMateria = $("<td></td>").text(SMATERIA_DSC);
            var tdCodgrupo = $("<td></td>").text(SSIGLA);
            var tdDocente = $("<td></td>").text(DOCENTE);
            var tdExFinal = $("<td></td>").text(EXFINAL);
            var tdFinal = $("<td></td>").text(FINAL);
            var tdPar1 = $("<td></td>").text(PAR1);
            var tdPar2 = $("<td></td>").text(PAR2);
            tr.append(tdCodMateria)
            tr.append(tdMateria)
            tr.append(tdCodgrupo)
            tr.append(tdDocente)
            tr.append(tdPar1)
            tr.append(tdPar2)
            tr.append(tdExFinal)
            tr.append(tdFinal)
            $('#tablaNotas').append(tr);
            cargarAsistencias(element)
        });
    }

    function cargarAsistencias(element) {
        const {
            SCODMATERIA,
            SSIGLA,
            DOCENTE,
            SMATERIA_DSC,
            LCENTRO_ID
        } = element;
        var tr = $("<tr ></tr>")
        var tdCodMateria = $("<td></td>").text(SCODMATERIA);
        var tdMateria = $("<td></td>").text(SMATERIA_DSC);
        var tdCodgrupo = $("<td></td>").text(SSIGLA);
        var tdDocente = $("<td></td>").text(DOCENTE);
        tr.append(tdCodMateria)
        tr.append(tdMateria)
        tr.append(tdCodgrupo)
        tr.append(tdDocente)
        var periodoActual = $('#dperiodoActual').val();
        var semestre = periodoActual.split("-")[1];
        var count = 0;
        switch (semestre) {
            case '1':
                const {
                    FMES3,
                    FMES4,
                    FMES5,
                    FMES6,
                    FMES7
                } = element;
                var tdFMES3 = $("<td></td>").text(FMES3);
                var tdFMES4 = $("<td></td>").text(FMES4);
                var tdFMES5 = $("<td></td>").text(FMES5);
                var tdFMES6 = $("<td></td>").text(FMES6);
                var tdFMES7 = $("<td></td>").text(FMES7);
                tr.append(tdFMES3)
                tr.append(tdFMES4)
                tr.append(tdFMES5)
                tr.append(tdFMES6)
                tr.append(tdFMES7)
                count = FMES3 + FMES4 + FMES5 + FMES6 + FMES7
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
            case '2':
                const {
                    FMES8,
                    FMES9,
                    FMES10,
                    FMES11,
                    FMES12
                } = element;
                var tdFMES8 = $("<td></td>").text(FMES8);
                var tdFMES9 = $("<td></td>").text(FMES9);
                var tdFMES10 = $("<td></td>").text(FMES10);
                var tdFMES11 = $("<td></td>").text(FMES11);
                var tdFMES12 = $("<td></td>").text(FMES12);
                tr.append(tdFMES8)
                tr.append(tdFMES9)
                tr.append(tdFMES10)
                tr.append(tdFMES11)
                tr.append(tdFMES12)
                count = FMES8 + FMES9 + FMES10 + FMES11 + FMES12
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
            case 'V':
                const {
                    FMES1,
                    FMES2
                } = element;
                var tdFMES1 = $("<td></td>").text(FMES1);
                var tdFMES2 = $("<td></td>").text(FMES2);
                tr.append(tdFMES1)
                tr.append(tdFMES2)
                count = FMES1 + FMES2
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
        $('#tablaAsistencia').append(tr);
        terminarCargado();
        terminarMainCargado();
    }
});
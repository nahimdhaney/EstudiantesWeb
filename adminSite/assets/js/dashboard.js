var horasServicio = 120;
var promedio = 0;
var isPageLoaded = false;
var isHistorialCargado = false;

function comenzarCargado() {
  $("#loader").removeAttr("style");
  $(".content").attr("style", "display:none");
}

function terminarCargado() {
  $(".content").removeAttr("style");
  $("#loader").attr("style", "display:none");
}

function cargarHistorial(resultado) {
  var semestre = " SEMESTRE";
  var espacio = "-";

  var arbol = [];
  resultado.Data.CURSADAS.forEach(function (element) {
    const { MATERIAS, REQUISITOS } = element;
    var objMateria = new Object();
    objMateria.semestre = parseInt(MATERIAS.LSEMESTRE);
    objMateria.creditos = parseInt(MATERIAS.LCREDITOS);
    objMateria.nombre = MATERIAS.SMATERIA_DSC;
    objMateria.requisitos = REQUISITOS;
    objMateria.cursada = 1;
    arbol.push(objMateria);
  });
  resultado.Data.FALTANTES.forEach(function (element) {
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
  arbol.sort(function (a, b) {
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
      html = html.replace(
        "{Semestre}",
        obtenerNumerosCardinales(semestre) + " Semestre"
      );
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
      tr.append(
        $("<td></td>").append(
          $("<i ></i>").addClass("fas fa-check-square iconClass")
        )
      );
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
  requisitos.forEach(function (req) {
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

  hand.events.on("propertychanged", function (ev) {
    range0.endValue = ev.target.value;
    range1.value = ev.target.value;
    axis2.invalidate();
  });
  var value = promedio;
  label.text = value;
  var animation = new am4core.Animation(
    hand,
    {
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
      async: false,
      data: JSON.stringify(usuario),
      url: "http://wsnotas.nur.edu:8880/api/Registros/GetNotasFaltas",
      dataType: "json",
    })
    .done(function (resultado) {
      if (resultado.Data.length == 0) response = false;
    });
  if (response) window.location = "horario.html";
  else swal("Ups!", "Tu horario no esta disponible aún", "info");
  $("#bodyClick").click();
}

function verPerfil() {
  $("#containerNotas").hide();
  $("#containerAsistencia").hide();
  $("#containerPensul").hide();
  $("#containerPlanPagos").hide();
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
    swal("Humm!", "No tienes más ofertas", "info");
  }
  $("#bodyClick").click();
}

function verHistorial() {
  $("#containerNotas").hide();
  $("#containerAsistencia").hide();
  $("#containerPlanPagos").hide();
  $("#containerPerfil").hide();
  $("#bodyClick").click();

  var isHistorialCargado = $("#isHistorialCargado").val();
  if (isHistorialCargado == 1) {
    $("#containerPensul").show();
    return;
  }
  comenzarCargado();
  realizarAjaxHistorial();
  $("#containerHistorial").hide();
  $("#containerPensul").show();
  return false;
}
function verListaHistorial() {
  $("#containerNotas").hide();
  $("#containerAsistencia").hide();
  $("#containerPerfil").hide();
  $("#containerPlanPagos").hide();
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
    url: "http://wsnotas.nur.edu:8880/api/Registros/GetAlumnoHistorial",
    dataType: "json",
    data: JSON.stringify(usuario),
    success: cargarHistorial,
    error: errorSesion,
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
      url: "http://wsnotas.nur.edu:8880/api/Registros/GetAlumnoHistorial",
      dataType: "json",
      data: JSON.stringify(usuario),
      success: carrgarHistorial,
      error: errorSesion,
    });
  }
}

function carrgarHistorial(resultado) {
  promedio = resultado.Data.PROMEDIOAPROBADAS;
  if (!isPageLoaded) {
    isPageLoaded = true;
    return;
  }
  var semestre = " SEMESTRE";
  var espacio = " - ";
  var arbol = [];
  resultado.Data.CURSADAS.forEach(function (element) {
    const { MATERIAS, REQUISITOS } = element;
    var materiaPadre =
      removerAcentos(MATERIAS.SMATERIA_DSC.toUpperCase()) +
      espacio +
      MATERIAS.LSEMESTRE +
      semestre;
    var count = 0;
    REQUISITOS.forEach(function (req) {
      if (req.LSEMESTRE == null) return;
      var objNodo = new Object();
      var numeroSemestre = req.LSEMESTRE == null ? "" : req.LSEMESTRE;
      objNodo.from =
        removerAcentos(req.SMATERIA_DSC.toUpperCase()) +
        espacio +
        numeroSemestre +
        semestre;
      objNodo.to = materiaPadre;
      objNodo.value = 1;
      arbol.push(objNodo);
      count++;
    });
    if (count == 0) {
      var objNodo = new Object();
      var numeroSemestre = MATERIAS.LSEMESTRE;
      objNodo.from =
        removerAcentos(MATERIAS.SMATERIA_DSC.toUpperCase()) +
        espacio +
        MATERIAS.LSEMESTRE +
        semestre;
      objNodo.to = "";
      objNodo.value = 1;
      objNodo.semestre = MATERIAS.LSEMESTRE;
      arbol.push(objNodo);
    }
  });
  resultado.Data.FALTANTES.forEach(function (element) {
    const { MATERIAS, REQUISITOS } = element;
    var materiaPadre =
      removerAcentos(MATERIAS.SMATERIA_DSC.toUpperCase()) +
      espacio +
      MATERIAS.LSEMESTRE +
      semestre;
    var count = 0;
    REQUISITOS.forEach(function (req) {
      if (req.LSEMESTRE == null) return;
      var objNodo = new Object();
      var numeroSemestre = req.LSEMESTRE == null ? "" : req.LSEMESTRE;
      objNodo.from =
        removerAcentos(req.SMATERIA_DSC.toUpperCase()) +
        espacio +
        numeroSemestre +
        semestre;
      objNodo.to = materiaPadre;
      objNodo.value = 1;
      objNodo.nodeColor = "#757575";
      arbol.push(objNodo);
      count++;
    });
    if (count == 0) {
      var objNodo = new Object();
      var numeroSemestre = MATERIAS.LSEMESTRE;
      objNodo.from =
        removerAcentos(MATERIAS.SMATERIA_DSC.toUpperCase()) +
        espacio +
        MATERIAS.LSEMESTRE +
        semestre;
      objNodo.to = "";
      objNodo.value = 1;
      objNodo.semestre = MATERIAS.LSEMESTRE;
      arbol.push(objNodo);
    }
  });
  arbol.sort(function (a, b) {
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
$(document).ready(function () {
  var esconderPeriodos = false;
  cargarPagina();
  $("#carrerasAlumno").change(function () {
    localStorage.setItem("carreraId", this.value);
    localStorage.setItem(
      "carreraNombre",
      $(this).find("option:selected").text()
    );

    if ($("#containerPensul").is(":visible")) {
      $("#isHistorialCargado").val(0);
      verHistorial();
    }
    $("#verMasPeriodos").remove();
    $(".periodosInvisibles").remove();
    comenzarMainCargado();
    $("#firstLoad").val("1");
    cargarPagina();
  });

  function errorSesion() {
    localStorage.removeItem("token");
    var url = "../index.html";
    $(location).attr("href", url);
  }

  function comenzarMainCargado() {
    $("#mainContainer").attr("style", "display:none");
    $("#mainLoader").removeAttr("style");
  }
  // $("#logout").click(function() {
  //
  //     localStorage.removeItem("token");
  //     window.location = "../index.html";
  //     return false;
  // });
  $("#closePensul").click(function () {
    $("#containerNotas").show();
    $("#containerAsistencia").show();
    $("#containerPensul").hide();
  });
  $("#formCambiarPin").submit(function (event) {
    var pinAnterior = $("#pinAnterior").val();
    var nuevoPin = $("#nuevoPin").val();
    var repetirNuevoPin = $("#repetirNuevoPin").val();

    if (nuevoPin.localeCompare(repetirNuevoPin) == 0) {
      swal({
        title: "¿Estas seguro de cambiar tu Pin ?",
        type: "warning",
        text:
          "Cambiara tu contraseña para ingresar al sitio de notas y para conectarte al Wi-Fi de la universidad",
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
          url: "http://wsnotas.nur.edu:8880/api/Registros/UpdatePin",
          dataType: "json",
        }).done(function (response) {
          if (response.Status) {
            swal(
              "Operacion Exitosa!",
              "Pin actualizado correctamente!",
              "success"
            );
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
  $("#verOferta").click(function () {
    if (tieneOferta()) {
      var periodoOferta = $("#periodosOferta").find(":selected").val();
      var carreraId = $("#carrerasAlumno").find(":selected").val();
      localStorage.setItem("periodoOferta", periodoOferta);
      localStorage.setItem("carreraId", carreraId);
      window.location = "oferta.html";
    } else {
      $("#modalOferta").hide();
      swal("Ups!", "No tienes ninguna materia ofertada aún", "info");
    }
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
      N: /\xD1/g,
    };
    for (var letra in mapaAcentosHex) {
      var expressaoRegular = mapaAcentosHex[letra];
      string = string.replace(expressaoRegular, letra);
    }
    return string;
  }
  $(document).on("click", "#verMasPeriodos", function () {
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
  $(document).on("click", ".semestre", function () {
    $("#bodyClick").click();
    comenzarCargado();
    $("#containerNotas").show();
    $("#containerAsistencia").show();
    var id = parseInt(JSON.parse($(this).attr("data-json")));
    var dperiodoActual = $(this).children("p").text();
    localStorage.setItem("MasterPeriodoActual", id);
    $("#containerPensul").hide();
    $("#containerPerfil").hide();
    $("#containerPlanPagos").hide();
    $("#containerHistorial").hide();
    $("#periodoActual").text(dperiodoActual);
    $("#dperiodoActual").val(dperiodoActual);
    $("#hperiodoActual").val(id);
    obtenerNotas(id);
  });

  function comenzarCargado() {
    $("#loader").removeAttr("style");
    $(".content").attr("style", "display:none");
  }

  function terminarCargado() {
    $(".content").removeAttr("style");
    $("#loader").attr("style", "display:none");
  }

  function terminarMainCargado() {
    $("#mainLoader").attr("style", "display:none");
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
      $("#titlePeriodos").remove();
      $("#containerNotas").remove();
      $("#containerAsistencia").remove();
      $("#containerDeuda").removeAttr("style");
      $("#containerDeuda").fadeIn();
    }
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
    chart.data = [
      {
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
        url: "http://wsnotas.nur.edu:8880/api/Registros/GetAlumnoImagen",
        dataType: "json",
        success: cargarImagem,
        error: errorSesion,
      });
    }
  }

  function cargarImagem(resultado) {
    var imagen = "data:image/png;base64," + resultado.Data;
    $("#imgUsuario").attr("src", imagen);
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
        url: "http://wsnotas.nur.edu:8880/api/Registros/GetAlumnoInfo",
        dataType: "json",
        success: resultado,
        error: errorSesion,
      });
    }
  }

  function resultado(resultado) {
    const {
      SREGISTRO,
      SAPELLIDOP,
      SAPELLIDOM,
      SNOMBRES,
      SCELULAR,
      STELEFONO,
      SEMAIL,
      LHORASERVICIO,
    } = resultado.Data;
    var NombreCompleto =
      SREGISTRO + " " + SNOMBRES + " " + SAPELLIDOP + " " + SAPELLIDOM;
    $("#nombreEstudiante").text(NombreCompleto);
    $("#inputTelefono").val(STELEFONO);
    $("#inputCelular").val(SCELULAR);
    $("#inputEmail").val(SEMAIL);
    $("#tituloNombreEstudiante").text(NombreCompleto);
    cargarCreditos(LHORASERVICIO);
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
        url: "http://wsnotas.nur.edu:8880/api/Registros/GetAlumnoCarreras",
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
    resultado.Data.forEach(function (element) {
      const {
        LCARRERA_ID,
        SCARRERA_DSC,
        LPERIODOACTUAL,
        LPERIODOACTUAL_ID,
      } = element;
      $("#MasterPeriodoActual").val(LPERIODOACTUAL_ID);
      localStorage.setItem("MasterPeriodoActual", LPERIODOACTUAL_ID);
      $("#hperiodoActual").val(LPERIODOACTUAL_ID);
      $("#dperiodoActual").val(LPERIODOACTUAL);
      $("#periodoActual").text(LPERIODOACTUAL);
      if (count == 0) {
        localStorage.setItem("corrPeActId", LPERIODOACTUAL_ID);
        obtenerNotas(LPERIODOACTUAL_ID);
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
      count++;
    });
    realizarAjaxHistorial();
    $("#carreraPerfil").text(carreras);
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
        url: "http://wsnotas.nur.edu:8880/api/Registros/GetPeriodosCursados",
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
    resultado.Data.forEach(function (element) {
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
        url: "http://wsnotas.nur.edu:8880/api/Registros/GetPeriodosOferta",
        dataType: "json",
        data: JSON.stringify(usuario),
        success: periodosOfertas,
        error: errorSesion,
      });
    }
  }

  function periodosOfertas(resultado) {
    for (i in resultado.Data) {
      var element = resultado.Data[i];
      const { SPERIODO_DSC, LPERIODO_ID } = element;
      var opcion = $("<option></option>");
      opcion.attr("value", LPERIODO_ID);
      opcion.text(SPERIODO_DSC);
      $("#periodosOferta").append(opcion);
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
        url: "http://wsnotas.nur.edu:8880/api/Registros/GetNotasFaltas",
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
    resultado.Data.forEach(function (element) {
      const {
        SCODMATERIA,
        SSIGLA,
        DOCENTE,
        EXFINAL,
        FINAL,
        PAR1,
        PAR2,
        SMATERIA_DSC,
        LCENTRO_ID,
      } = element;
      var tr = $("<tr ></tr>");
      var tdCodMateria = $("<td></td>").text(SCODMATERIA);
      var tdMateria = $("<td></td>").text(SMATERIA_DSC);
      var tdCodgrupo = $("<td></td>").text(SSIGLA);
      var tdDocente = $("<td></td>").text(DOCENTE);
      var tdExFinal = $("<td></td>").text(EXFINAL);
      var tdFinal = $("<td></td>").text(FINAL);
      var tdPar1 = $("<td></td>").text(PAR1);
      var tdPar2 = $("<td></td>").text(PAR2);
      tr.append(tdCodMateria);
      tr.append(tdMateria);
      tr.append(tdCodgrupo);
      tr.append(tdDocente);
      tr.append(tdPar1);
      tr.append(tdPar2);
      tr.append(tdExFinal);
      tr.append(tdFinal);
      $("#tablaNotas").append(tr);
      cargarAsistencias(element);
    });
  }

  function cargarAsistencias(element) {
    const { SCODMATERIA, SSIGLA, DOCENTE, SMATERIA_DSC, LCENTRO_ID } = element;
    var tr = $("<tr ></tr>");
    var tdCodMateria = $("<td></td>").text(SCODMATERIA);
    var tdMateria = $("<td></td>").text(SMATERIA_DSC);
    var tdCodgrupo = $("<td></td>").text(SSIGLA);
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
        async: false,
        data: JSON.stringify(usuario),
        url: "http://wsnotas.nur.edu:8880/api/Registros/GetAlumnoOferta",
        dataType: "json",
      })
      .done(function (resultado) {
        if (resultado.Data.length == 0) response = false;
      });
    return response;
  }
});

function consultarCXC() {
  $("#containerNotas").hide();
  $("#containerAsistencia").hide();
  $("#containerPensul").hide();
  $("#containerPerfil").hide();
  $("#containerPlanPagos").fadeIn();
  $("#containerPlanPagos").empty();
  $("#containerHistorial").hide();
  $("#bodyClick").click();
  var token = localStorage.getItem("token");
  var pPeriodoId = localStorage.getItem("MasterPeriodoActual");
  if (pPeriodoId <= 0) {
    pPeriodoId = localStorage.getItem("corrPeActId");
  }
  var data = new Object();
  data.pPeriodoId = pPeriodoId;

  jQuery.ajax({
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    type: "POST",
    data: JSON.stringify(data),
    url: "http://wsnotas.nur.edu:8880/api/Registros/GetPlanPagos",
    dataType: "json",
    success: mostrarResultado,
    error: errorSesion,
  });
}

function mostrarResultado(response) {
  var planes = response.Data;
  var carrera = "";
  var centro = "";
  var datos = [];

  for (let index = 0; index < planes.length; index++) {
    var detalles = planes[index].DETALLE;
    var cuotas = detalles.length;
    var rowPlan = [];
    var arrayPlanes = [];
    var saldoTotal = 0;
    var pagadoTotal = 0;
    var cuotaTotal = 0;
    if (cuotas > 1) {
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
      carrera = datosPlanAlumno.SCARRERA_DSC;
      centro = datosPlanAlumno.SCENTRO_DSC;
      centro = titleCase(centro);

      var items = {
        carrera,
        centro,
        cuotas,
        arrayPlanes,
        saldoTotal,
        pagadoTotal,
        cuotaTotal,
      };

      if (saldoTotal > 0) {
        datos.push(items);
      }
    }
  }

  datos = sortByKey(datos, "carrera");
  var final = "";

  for (let index = 0; index < datos.length; index++) {
    var planRow = datos[index].arrayPlanes;
    var detalleRow = "";
    var html =
      `<div class="row"><div class="col-md-12"><div class="card"><div class="header"><h4 class="title"><strong>Plan de pagos</strong></h4>
              <h5 class="title">` +
      datos[index].carrera +
      `</h5><h5 class="title">` +
      datos[index].centro +
      `</h5></div>
              <div class="content table-responsive table-full-width"><table class="table table-hover table-striped">
              <thead><th>#</th><th>Fecha Vencimiento</th><th>Cuota (Bs)</th><th>Pagado (Bs)</th><th>Saldo (Bs)</th><th>Estado</th>
              </thead><tbody>`;
    var htmlEnd =
      `<tr class="filaFinal"><td colspan="2"><strong>Total</strong></td><td><strong>` +
      fnDosDigitos(cuotaTotal) +
      `</strong></td><td><strong>` +
      fnDosDigitos(pagadoTotal) +
      `</strong></td><td><strong>` +
      fnDosDigitos(saldoTotal) +
      `</strong></td><td></td></tr></tbody></table></div></div></div></div>`;
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
        "</td><td>" +
        planRow[aux].estado +
        "</td></tr>";
    }
    final += html + detalleRow + htmlEnd;
  }

  if (final == "") {
    final = `<div class="row"><div class="col-md-12"><div class="card"><div class="alert alert-deuda" role="alert"><h2 class="alert-heading">No tiene planes de pago</h2>
    <p>No tiene deudas pendientes en esta gestión.</p></div></div></div></div>`;
  }
  var parrafo =
    "<p>*Datos referenciales, para validar la información apersonarse a Cuentas por Cobrar por favor.</p>";
  $("#containerPlanPagos").append(final);
  $("#containerPlanPagos").append(parrafo);
}

function titleCase(str) {
  var splitStr = str.toLowerCase().split(" ");
  for (var i = 0; i < splitStr.length; i++) {
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  return splitStr.join(" ");
}

function sortByKey(array, key) {
  return array.sort(function (a, b) {
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
  return (
    ("0" + fechaFormat.getDate()).slice(-2) +
    "/" +
    ("0" + (fechaFormat.getMonth() + 1)).slice(-2) +
    "/" +
    fechaFormat.getFullYear()
  );
}

function fnDosDigitos(numero) {
  if (numero == 0) {
    return 0;
  }
  return Number(numero).toFixed(2);
}

/*   ACTUALIZAR EMAIL-TELEFONO   */

$("#infoPersonal input[type=text]").click(function () {
  this.removeAttribute("readonly");
  $("#SaveEmail").show(300);
});

$("#SaveEmail").click(function () {
  var pTelefono = $("#inputTelefono").val().trim();
  var pCelular = $("#inputCelular").val().trim();
  var pEmail = $("#inputEmail").val().trim();
  if (pTelefono == "" || pCelular == "" || pEmail == "") {
    swal(
      "Completa tus datos",
      "Ayudanos a mantenernos en contacto contigo.",
      "info"
    );
  } else {
    var token = localStorage.getItem("token");
    var datos = new Object();
    datos.pTelefono = pTelefono;
    datos.pCelular = pCelular;
    datos.pEmail = pEmail;
    if (token != "") {
      jQuery.ajax({
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        type: "POST",
        url: "http://wsnotas.nur.edu:8880/api/Registros/UpdateEmailTelefono",
        dataType: "json",
        data: JSON.stringify(datos),
        success: function (response) {
          if (response.Status) {
            swal("Guardado", "", "success");
            location.reload();
          } else
            swal("Ups!", "Algo anda mal, tus datos no se guardaron.", "info");
        },
        error: function () {
          swal("Ups!", "Algo anda mal, tus datos no se guardaron.", "info");
        },
      });
    }
  }
});

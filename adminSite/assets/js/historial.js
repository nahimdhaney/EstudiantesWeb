$(document).ready(function() {
    cargarPagina();
});

function cargarPagina() {
    comenzarMainCargado();
    obtenerHistorial();
}

function comenzarMainCargado() {
    $("#mainContainer").attr("style", "display:none");
    $("#mainLoader").removeAttr("style");
}

function terminarMainCargado() {
    $("#mainLoader").attr("style", "display:none");
    $("#mainContainer").removeAttr("style");
}

function obtenerHistorial() {
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
            Authorization: "Bearer " + token
        },
        type: "POST",
        url: "http://wsnotas.nur.edu:8880/api/Registros/GetAlumnoHistorial",
        dataType: "json",
        data: JSON.stringify(usuario),
        success: cargarHistorial,
        error: errorSesion
    });
}

function errorSesion() {
    localStorage.removeItem("token");
    var url = "../index.html";
    $(location).attr("href", url);
}

function cargarHistorial(resultado) {
    var semestre = " SEMESTRE";
    var espacio = " - ";
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
        if (!MATERIAS.SPERIODO_DSC.localeCompare("-")) {
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
            html = html.replace(
                "{Semestre}",
                obtenerNumerosCardinales(semestre) + " Semestre"
            );
            html = html.replace("{tableId}", tablaId);
            var div = $("<div ></div>").addClass("col-md-6");
            div.append(html);
            $("#contentMaster").append(div);
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
    }
    terminarMainCargado();
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
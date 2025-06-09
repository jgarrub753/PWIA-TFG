let equipo1 = null;
let equipo2 = null;
let seleccionadoIzquierda = null;
let seleccionadoDerecha = null;

function seleccionar(img, lado) {
    const nombre = img.alt;

    if (lado === 'left') {
        if (nombre === equipo1) {
            img.classList.remove('selected');
            equipo1 = null;
            seleccionadoIzquierda = null;
            document.getElementById('seleccionIzquierda').style.display = "none";
            document.getElementById('seleccionIzquierdaNombre').textContent = "";
            return;
        }
        if (nombre === equipo2) return;
        if (seleccionadoIzquierda) seleccionadoIzquierda.classList.remove('selected');
        img.classList.add('selected');
        equipo1 = nombre;
        seleccionadoIzquierda = img;

        const izquierdaImg = document.getElementById('seleccionIzquierda');
        izquierdaImg.src = img.src;
        izquierdaImg.style.display = "block";
        document.getElementById('seleccionIzquierdaNombre').textContent = nombre;

    } else {
        if (nombre === equipo2) {
            img.classList.remove('selected');
            equipo2 = null;
            seleccionadoDerecha = null;
            document.getElementById('seleccionDerecha').style.display = "none";
            document.getElementById('seleccionDerechaNombre').textContent = "";
            return;
        }
        if (nombre === equipo1) return;
        if (seleccionadoDerecha) seleccionadoDerecha.classList.remove('selected');
        img.classList.add('selected');
        equipo2 = nombre;
        seleccionadoDerecha = img;

        const derechaImg = document.getElementById('seleccionDerecha');
        derechaImg.src = img.src;
        derechaImg.style.display = "block";
        document.getElementById('seleccionDerechaNombre').textContent = nombre;
    }
}

async function enviarSeleccion() {
    if (!equipo1 || !equipo2) {
        alert("Debes seleccionar dos equipos distintos.");
        return;
    }

    const response = await fetch("/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ equipo1, equipo2 })
    });

    const resultadoDiv = document.getElementById("resultado");
    resultadoDiv.innerHTML = "";

    if (!response.ok) {
        const error = await response.json();
        resultadoDiv.innerHTML = `<p style="color:red;">Error: ${error.error}</p>`;
        return;
    }

    const data = await response.json();

    if (!data.estadisticas || Object.keys(data.estadisticas).length === 0) {
        resultadoDiv.innerHTML = "<p style='color:red;'>No se obtuvieron estadísticas.</p>";
        return;
    }

    let tablaHTML = `
<h3 style="text-align: center">
    <img src="${data.equipos[equipo1].logo}" alt="Escudo ${equipo1}" style="width: 60px; height: 60px; vertical-align: middle; margin-left: 8px;">
    <span style="color: red">${equipo1}</span>
    <span style="font-family: 'Times New-Roman', Times, serif; font-size: 30px; color:beige">VS</span>
    <span style="color: blue">${equipo2}</span>
    <img src="${data.equipos[equipo2].logo}" alt="Escudo ${equipo2}" style="width: 60px; height: 60px; vertical-align: middle; margin-left: 8px;">
</h3>
<div class="parrafo-pronos">
    <p id="pronosticoTexto" style="padding: 1em;">${data.pronostico}</p>
</div>

<div style="display: flex; flex-direction: column; align-items: center; margin: 20px 0;">
    <p class="mensaje-alerta">⚠️ Si en alguna temporada sale "No compite", significa que ese equipo ha jugado en una categoría inferior a Primera División.</p>
    <button class="boton-predi" onclick="reproducirAudioPronostico()">🔊 Escuchar pronóstico</button>
</div>`;

    tablaHTML += `<div style="display: flex; flex-direction: column; align-items: center; gap: 40px; margin-top: 20px;">`;

    for (const equipo of [equipo1, equipo2]) {
        tablaHTML += `
<div>
    <h4 style="text-align: center; color:blue">
        <img src="${data.equipos[equipo].logo}" alt="Escudo de ${equipo}" style="width: 60px; height: 60px; vertical-align: middle; margin-left: 8px;">
        ${equipo}
    </h4>
    <table border="1" cellpadding="6" style="border-collapse: collapse; margin: 0 auto;">
        <thead>
            <tr>
                <th>Temporada</th>
                <th>Victorias</th>
                <th>Empates</th>
                <th>Derrotas</th>
                <th>Goles a favor</th>
                <th>Goles en contra</th>
                <th>Posición</th>
            </tr>
        </thead>
        <tbody>`;

        const temporadas = data.estadisticas[equipo];
        for (const temporada in temporadas) {
            const stats = temporadas[temporada];
            tablaHTML += `
        <tr>
            <td>${temporada}</td>
            <td>${stats.wins}</td>
            <td>${stats.draws}</td>
            <td>${stats.losses}</td>
            <td>${stats.gf}</td>
            <td>${stats.ga}</td>
            <td>${stats.pos}</td>
        </tr>`;
        }

        tablaHTML += `</tbody></table></div>`;
    }

    tablaHTML += `</div>`;

    if (data.enfrentamientos_historicos?.resumen) {
        const resumen = data.enfrentamientos_historicos.resumen;
        tablaHTML += `
<h3 style="text-align:center; margin-top:40px; color: blue;">Resumen Histórico de Enfrentamientos</h3>
<table border="1" cellpadding="6" style="border-collapse: collapse; margin: 0 auto 20px auto; color: white; background-color: green;">
    <thead>
        <tr>
            <th>${equipo1} Victorias</th>
            <th>${equipo2} Victorias</th>
            <th>Empates</th>
            <th>Total Partidos</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>${resumen[`${equipo1}_victorias`]}</td>
            <td>${resumen[`${equipo2}_victorias`]}</td>
            <td>${resumen.empates}</td>
            <td>${resumen.total_partidos}</td>
        </tr>
    </tbody>
</table>`;
    }

    if (Array.isArray(data.enfrentamientos_historicos?.ultimos_partidos)) {
        tablaHTML += `
<h3 style="text-align:center; margin-top:40px; color: blue;">Últimos Partidos</h3>
<table border="1" cellpadding="6" style="border-collapse: collapse; margin: 0 auto 20px auto; color: white; background-color: green;">
    <thead>
        <tr>
            <th>Fecha</th>
            <th>Competición</th>
            <th>Resultado</th>
        </tr>
    </thead>
    <tbody>`;
        for (const partido of data.enfrentamientos_historicos.ultimos_partidos) {
            tablaHTML += `
        <tr>
            <td>${partido.fecha}</td>
            <td>${partido.competicion}</td>
            <td>${partido.resultado}</td>
        </tr>`;
        }
        tablaHTML += `</tbody></table>`;
    }

    if (data.jugadores_historicos) {
        tablaHTML += `
<h3 style="text-align:center; margin-top:40px; color: blue;">Jugadores Históricos</h3>
<div style="display: flex; justify-content: center; gap: 60px; margin-bottom: 40px;">`;

        for (const equipo of [equipo1, equipo2]) {
            const jugadores = data.jugadores_historicos[equipo] || [];
            tablaHTML += `
    <div>
        <h4 style="text-align:center; color: blue;">
            <img src="${data.equipos[equipo].logo}" alt="Escudo ${equipo}" style="width: 50px; height: 50px; vertical-align: middle;"> ${equipo}
        </h4>
        <table border="1" cellpadding="6" style="border-collapse: collapse; margin: 0 auto; background-color: lightblue; color: black; border-radius: 12px;">
            <thead><tr><th>Jugador</th></tr></thead>
            <tbody>`;
            for (const jugador of jugadores) {
                tablaHTML += `<tr><td>${jugador}</td></tr>`;
            }
            tablaHTML += `</tbody></table></div>`;
        }

        tablaHTML += `</div>`;
    }
    tablaHTML += `<button class="boton-predi" id="btnDescargarCSV" style="margin-left: 10px;">⬇️ Descargar CSV</button>`;
    tablaHTML += `<button class="boton-predi" id="btnDescargarPDF" style="margin-left: 10px;">📄 Descargar PDF</button>`;


    tablaHTML += `<br><button class="renueva" onclick="location.reload()">Seleccionar otros equipos</button>`;

    document.getElementById("seleccionContainer").style.display = "none";
    resultadoDiv.innerHTML = tablaHTML;
    // Añadimos evento para el botón de descarga CSV y el del PDF
    document.getElementById("btnDescargarCSV").addEventListener("click", () => {
        descargarCSV(data, equipo1, equipo2);
    });
    document.getElementById("btnDescargarPDF").addEventListener("click", () => {
    descargarPDF();
});

}

async function reproducirAudioPronostico() {
    const texto = document.getElementById("pronosticoTexto").textContent;
    if (!texto) {
        alert("No hay texto para reproducir.");
        return;
    }

    try {
        const response = await fetch("/audio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ texto })
        });

        if (!response.ok) {
            const error = await response.json();
            alert("Error generando audio: " + error.error);
            return;
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        const contenedorAudioExistente = document.getElementById("contenedorAudio");
        if (contenedorAudioExistente) contenedorAudioExistente.remove();

        const contenedorAudio = document.createElement("div");
        contenedorAudio.id = "contenedorAudio";
        contenedorAudio.style.marginTop = "10px";
        contenedorAudio.style.textAlign = "right";

        const audio = document.createElement("audio");
        audio.src = audioUrl;
        audio.controls = true;
        audio.style.verticalAlign = "middle";

        contenedorAudio.appendChild(audio);
        const resultadoDiv = document.getElementById("resultado");
        const divBotonAudio = resultadoDiv.querySelector("button.boton-predi").parentNode;
        divBotonAudio.appendChild(contenedorAudio);
        audio.play();
    } catch (error) {
        alert("Error generando o reproduciendo el audio.");
        console.error(error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const imagenesIzquierda = Array.from(document.querySelectorAll("#grid1 .grid-item"));
    const imagenesDerecha = Array.from(document.querySelectorAll("#grid2 .grid-item"));

    function deselectAll() {
        imagenesIzquierda.forEach(img => img.classList.remove("selected"));
        imagenesDerecha.forEach(img => img.classList.remove("selected"));
        equipo1 = null;
        equipo2 = null;
        seleccionadoIzquierda = null;
        seleccionadoDerecha = null;
        document.getElementById('seleccionIzquierda').style.display = "none";
        document.getElementById('seleccionIzquierdaNombre').textContent = "";
        document.getElementById('seleccionDerecha').style.display = "none";
        document.getElementById('seleccionDerechaNombre').textContent = "";
    }

    document.getElementById("random-match-btn").addEventListener("click", () => {
        deselectAll();

        const equipoAImg = imagenesIzquierda[Math.floor(Math.random() * imagenesIzquierda.length)];
        const equipoA = equipoAImg.alt;

        let equipoBImg;
        let equipoB;
        do {
            equipoBImg = imagenesDerecha[Math.floor(Math.random() * imagenesDerecha.length)];
            equipoB = equipoBImg.alt;
        } while (equipoB === equipoA);

        seleccionar(equipoAImg, 'left');
        seleccionar(equipoBImg, 'right');
    });
});
function descargarCSV(data) {
    let csv = "";

    // Tabla 1: Estadísticas por equipo y temporada
    csv += `--- Estadísticas por equipo y temporada ---\n`;
    csv += `"Equipo","Temporada","Victorias","Empates","Derrotas","Goles a favor","Goles en contra","Posición"\n`;
    for (const equipo of [equipo1, equipo2]) {
        const stats = data.estadisticas[equipo];
        for (const temporada in stats) {
            const s = stats[temporada];
            csv += `"${equipo}","${temporada}",${s.wins},${s.draws},${s.losses},${s.gf},${s.ga},${s.pos}\n`;
        }
    }

    csv += `\n`;

    // Tabla 2: Pronóstico
    csv += `--- Pronóstico ---\n`;
    csv += `"Pronóstico"\n`;
    csv += `"${data.pronostico.replace(/"/g, '""')}"\n`;

    csv += `\n`;

    // Tabla 3: Resumen histórico de enfrentamientos
    if (data.enfrentamientos_historicos?.resumen) {
        const resumen = data.enfrentamientos_historicos.resumen;
        csv += `--- Historial de enfrentamientos ---\n`;
        csv += `"Estadística","${equipo1}","${equipo2}","Empates"\n`;
        csv += `"Victorias",${resumen[`${equipo1}_victorias`]},${resumen[`${equipo2}_victorias`]},${resumen.empates}\n`;
        csv += `"Total partidos",${resumen.total_partidos},,,\n`;
        csv += `\n`;
    }

    // Tabla 4: Jugadores históricos
    if (data.jugadores_historicos) {
        csv += `--- Jugadores históricos ---\n`;
        csv += `"Equipo","Jugadores históricos"\n`;
        for (const equipo of [equipo1, equipo2]) {
            const jugadores = data.jugadores_historicos[equipo] || [];
            const jugadoresStr = jugadores.length > 0 ? jugadores.map(j => j.replace(/"/g, '""')).join(", ") : "No disponibles";
            csv += `"${equipo}","${jugadoresStr}"\n`;
        }
    }

    // Crear Blob con BOM
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });

    // Descargar
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pronostico_${equipo1}_vs_${equipo2}.csv`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function descargarPDF() {
    const resultado = document.getElementById("resultado");
    if (!resultado || resultado.innerHTML.trim() === "") {
        alert("Primero genera un pronóstico.");
        return;
    }

    // Usa html2canvas para capturar el contenido como imagen
    const canvas = await html2canvas(resultado, {
        scale: 2,
        useCORS: true,
        windowWidth: document.body.scrollWidth
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jspdf.jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 0;

    if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    } else {
        let heightLeft = imgHeight;
        while (heightLeft > 0) {
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            position -= pageHeight;
            if (heightLeft > 0) {
                pdf.addPage();
            }
        }
    }

    
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pronostico_${equipo1}_vs_${equipo2}.pdf`; // Nombre del documento que vamos a crear
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}



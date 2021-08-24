const socket = io('http://localhost:6767');
var botonSOS = false

//Enviamos comando
function enviarComando(comando, significado) {
    if (comando == 'emergency') {
        botonSOS = true;
    }
    var enviandoComando = document.querySelector("#enviandoComando");
    enviandoComando.textContent = 'Enviando comando: ' + significado;
    socket.emit('command', comando);
}

//Respuesta del dron
socket.on('status', message => {
    var respuestaDron = document.querySelector("#respuestaDron");
    respuestaDron.textContent = "Respuesta dron: " + message;
});

//VOZ
window.onload = function () {
    var divVoz = document.querySelector("#voz");
    if (!('webkitSpeechRecognition' in window)) {
        alert("¡API de voz no soportada! (Chrome)");
    } else {
        var empezar = document.querySelector(".empezar");
        var parar = document.querySelector(".parar");
    
        var voz = new webkitSpeechRecognition();
    
        voz.lang = "es-ES";
        voz.continuous = true;  // Cuando se deja de hablar no se desactiva el micro
        voz.interimResults = false;  // Cuando nos quedamos callados nos devuelve el "resultado"
    
        voz.onresult = function (event) {
            var results = event.results;
            var comando = event.results[results.length - 1][0].transcript;
            //Quitamos espacios principio y final
            comando = comando.replace(/^ /, "");
            comando = comando.replace(/ $/, "");

            console.log(comando);
            divVoz.textContent = "Voz: " + comando;
            if (comando == 'despegar') {
                enviarComando('takeoff', "Despegar");
            } else if (comando == 'aterrizar') {
                enviarComando('land', "Aterrizar");
            } else if (comando == 'adelante') {
                enviarComando('forward 100', "Adelante (100cm)");
            } else if (comando == 'atrás') {
                enviarComando('back 100', "Atrás (100cm)");
            } else if (comando == 'izquierda') {
                enviarComando('left 100', "Izquierda (100cm)");
            } else if (comando == 'derecha') {
                enviarComando('right 100', "Derecha (100cm)");
            } else if (comando == 'emergencia') {
                enviarComando('emergency', "Parar motores");
            } else if (comando == 'batería') {
                enviarComando('battery?', "Batería");
            } else {
                divVoz.textContent = 'El comando "' + comando + '" no existe';
            }
        }
    
        empezar.addEventListener("click", () => {
            alert("Micrófono encendido");
            voz.start();
        });
    
        parar.addEventListener("click", () => {
            voz.abort();
            alert("Micrófono apagado");
			divVoz.textContent = '';
        });
    
        voz.onerror = (event) => {
            if (event.error !== 'aborted') {
                alert("Error micrófono: " + event.error);
            }
            
        }
    }
}

const retrasoComandos = {
    takeoff: 8000,
    land: 5000,
    'up 100': 8000,
    'up 50': 8000,
    'down 100': 8000,
    'left 100': 8000,
    'right 100': 8000,
    'forward 100': 8000,
    'forward 200': 8000,
    'back 100': 5000,
    'ccw 180': 8000,
    'cw 180': 8000,
    'ccw 90': 8000,
    'cw 90': 8000,
    'flip l': 4000,
    'flip r': 4000,
    'flip f': 4000,
    'flip b': 4000,
    'speed 100': 3000,
    'battery?': 500,
    'speed?': 500,
    'time?': 500,
};

const significadoComandos = {
    takeoff: "Despegar",
    land: "Aterrizar",
    'up 100': "Subir 100cm",
    'up 50': "Subir 50cm",
    'down 100': "Bajar 100cm",
    'left 100': "Izquierda 100cm",
    'right 100': "Derecha 100cm",
    'forward 100': "Adelante 100cm",
    'forward 200': "Adelante 200cm",
    'back 100': "Atrás 100cm",
    'ccw 180': "Giro izq 180°",
    'cw 180': "Giro der 180°",
    'ccw 90': "Giro izq 90°",
    'cw 90': "Giro der 90°",
    'flip l': "Flip izq",
    'flip r': "Flip der",
    'flip f': "Flip ade",
    'flip b': "Flip atr",
    'speed 100': "Vel. 100%",
    'battery?': "Batería",
    'speed?': "Vel. actual",
    'time?': "Tiempo vuelo",
};

//Vuelos automaticos

var comandosPrueba = ['takeoff', 'ccw 180', 'cw 180', 'land'];
var comandosCuadrado = ['takeoff', 'left 100', 'up 100', 'right 100', 'down 100', 'land'];
var comandosRectangulo = ['takeoff', 'up 50', 'forward 200', 'cw 90', 'forward 100', 'cw 90', 'forward 200', 'cw 90', 'forward 100', 'cw 90', 'land'];
var comandosRandom = ['takeoff', 'up 100', 'flip f', 'flip l', 'flip f', 'flip r', 'flip r', 'cw 180'];
let i = 0;
const delay = ms => new Promise(res => setTimeout(res, ms));

async function vueloPrueba() {
    botonSOS = false;
    var enviandoComando = document.querySelector("#enviandoComando");
    var retrasoComando = document.querySelector("#retrasoComando");
    var respuestaDron = document.querySelector("#respuestaDron");
    respuestaDron.textContent = "";
    retrasoComando.textContent = "";

    do {
        var cancelarVuelo = false;
        var comando = comandosPrueba[i];
        var retraso = retrasoComandos[comando];
        enviandoComando.textContent = 'Enviando comando: ' + significadoComandos[comando];
        if (!botonSOS) {
            socket.emit('command', comando);
        }
        var segundos = (retraso / 1000) - 1;
        retrasoComando.textContent = '';
        var downloadTimer = setInterval(function () {
            if (segundos <= 0) {
                clearInterval(downloadTimer);
            } else {
                if (segundos <= 1) {
                    retrasoComando.textContent = 'Siguiente comando (' + significadoComandos[comandosPrueba[i + 1]] + ') en: ' + segundos + " segundo";
                    if (cancelarVuelo) {
                        retrasoComando.textContent = "";
                    }
                    if (comandosPrueba[i + 1] == undefined) {
                        retrasoComando.textContent = 'Finalizando en: ' + segundos + " segundo";
                    }
                } else {
                    retrasoComando.textContent = 'Siguiente comando (' + significadoComandos[comandosPrueba[i + 1]] + ') en: ' + segundos + " segundos";
                    if (cancelarVuelo) {
                        retrasoComando.textContent = "";
                    }
                    if (comandosPrueba[i + 1] == undefined) {
                        retrasoComando.textContent = 'Finalizando en: ' + segundos + " segundos";
                    }
                }
            }
            segundos -= 1;
        }, 1000);
        if (!botonSOS) {
            await delay(retraso);
        } else {
            cancelarVuelo = true;
            delay.reject;
        }
        i += 1;
    } while (i < comandosPrueba.length);
    i = 0;
    enviandoComando.textContent = "Finalizado vuelo automatico de prueba!";
    retrasoComando.textContent = "";
    respuestaDron.textContent = "";
    if (botonSOS) {
        enviandoComando.textContent = "Botón de emergencia pulsado, vuelo finalizado!";
    }
    botonSOS = false;
}

async function vueloRandom() {
    botonSOS = false;
    var enviandoComando = document.querySelector("#enviandoComando");
    var retrasoComando = document.querySelector("#retrasoComando");
    var respuestaDron = document.querySelector("#respuestaDron");
    respuestaDron.textContent = "";

    do {
        var cancelarVuelo = false;
        var comando = comandosRandom[i];
        var retraso = retrasoComandos[comando];
        enviandoComando.textContent = 'Enviando comando: ' + significadoComandos[comando];
        if (!botonSOS) {
            socket.emit('command', comando);
        }
        var segundos = (retraso / 1000) - 1;
        retrasoComando.textContent = '';
        var downloadTimer = setInterval(function () {
            if (segundos <= 0) {
                clearInterval(downloadTimer);
            } else {
                if (segundos <= 1) {
                    retrasoComando.textContent = 'Siguiente comando (' + significadoComandos[comandosRandom[i + 1]] + ') en: ' + segundos + " segundo";
                    if (cancelarVuelo) {
                        retrasoComando.textContent = "";
                    }
                    if (comandosRandom[i + 1] == undefined) {
                        retrasoComando.textContent = 'Finalizando en: ' + segundos + " segundo";
                    }
                } else {
                    retrasoComando.textContent = 'Siguiente comando (' + significadoComandos[comandosRandom[i + 1]] + ') en: ' + segundos + " segundos";
                    if (cancelarVuelo) {
                        retrasoComando.textContent = "";
                    }
                    if (comandosRandom[i + 1] == undefined) {
                        retrasoComando.textContent = 'Finalizando en: ' + segundos + " segundos";
                    }
                }
            }
            segundos -= 1;
        }, 1000);
        if (!botonSOS) {
            await delay(retraso);
        } else {
            cancelarVuelo = true;
            delay.reject;
        }
        i += 1;
    } while (i < comandosRandom.length);
    i = 0;
    enviandoComando.textContent = "Finalizado vuelo random!";
    retrasoComando.textContent = '';
    respuestaDron.textContent = "";
    if (botonSOS) {
        enviandoComando.textContent = "Botón de emergencia pulsado, vuelo finalizado!";
    }
    botonSOS = false;
}

async function vueloCuadrado() {
    botonSOS = false;
    var enviandoComando = document.querySelector("#enviandoComando");
    var retrasoComando = document.querySelector("#retrasoComando");
    var respuestaDron = document.querySelector("#respuestaDron");
    respuestaDron.textContent = "";

    do {
        var cancelarVuelo = false;
        var comando = comandosCuadrado[i];
        var retraso = retrasoComandos[comando];
        enviandoComando.textContent = 'Enviando comando: ' + significadoComandos[comando];
        if (!botonSOS) {
            socket.emit('command', comando);
        }
        var segundos = (retraso / 1000) - 1;
        retrasoComando.textContent = '';
        var downloadTimer = setInterval(function () {
            if (segundos <= 0) {
                clearInterval(downloadTimer);
            } else {
                if (segundos <= 1) {
                    retrasoComando.textContent = 'Siguiente comando (' + significadoComandos[comandosCuadrado[i + 1]] + ') en: ' + segundos + " segundo";
                    if (cancelarVuelo) {
                        retrasoComando.textContent = "";
                    }
                    if (comandosCuadrado[i + 1] == undefined) {
                        retrasoComando.textContent = 'Finalizando en: ' + segundos + " segundo";
                    }
                } else {
                    retrasoComando.textContent = 'Siguiente comando (' + significadoComandos[comandosCuadrado[i + 1]] + ') en: ' + segundos + " segundos";
                    if (cancelarVuelo) {
                        retrasoComando.textContent = "";
                    }
                    if (comandosCuadrado[i + 1] == undefined) {
                        retrasoComando.textContent = 'Finalizando en: ' + segundos + " segundos";
                    }
                }
            }
            segundos -= 1;
        }, 1000);
        if (!botonSOS) {
            await delay(retraso);
        } else {
            cancelarVuelo = true;
            delay.reject;
        }
        i += 1;
        retrasoComando.textContent = '';
    } while (i < comandosCuadrado.length);
    i = 0;
    enviandoComando.textContent = "Finalizado cuadrado!";
    respuestaDron.textContent = "";
    retrasoComando.textContent = '';
    if (botonSOS) {
        enviandoComando.textContent = "Botón de emergencia pulsado, vuelo finalizado!";
    }
    botonSOS = false;
}

async function vueloRectangulo() {
    botonSOS = false;
    var enviandoComando = document.querySelector("#enviandoComando");
    var retrasoComando = document.querySelector("#retrasoComando");
    var respuestaDron = document.querySelector("#respuestaDron");
    respuestaDron.textContent = "";

    do {
        var cancelarVuelo = false;
        var comando = comandosRectangulo[i];
        var retraso = retrasoComandos[comando];
        enviandoComando.textContent = 'Enviando comando: ' + significadoComandos[comando];
        if (!botonSOS) {
            socket.emit('command', comando);
        }
        var segundos = (retraso / 1000) - 1;
        retrasoComando.textContent = '';
        var downloadTimer = setInterval(function () {
            if (segundos <= 0) {
                clearInterval(downloadTimer);
            } else {
                if (segundos <= 1) {
                    retrasoComando.textContent = 'Siguiente comando (' + significadoComandos[comandosRectangulo[i + 1]] + ') en: ' + segundos + " segundo";
                    if (cancelarVuelo) {
                        retrasoComando.textContent = "";
                    }
                    if (comandosRectangulo[i + 1] == undefined) {
                        retrasoComando.textContent = 'Finalizando en: ' + segundos + " segundo";
                    }
                } else {
                    retrasoComando.textContent = 'Siguiente comando (' + significadoComandos[comandosRectangulo[i + 1]] + ') en: ' + segundos + " segundos";
                    if (cancelarVuelo) {
                        retrasoComando.textContent = "";
                    }
                    if (comandosRectangulo[i + 1] == undefined) {
                        retrasoComando.textContent = 'Finalizando en: ' + segundos + " segundos";
                    }
                }
            }
            segundos -= 1;
        }, 1000);
        if (!botonSOS) {
            await delay(retraso);
        } else {
            cancelarVuelo = true;
            delay.reject;
        }
        i += 1;
    } while (i < comandosRectangulo.length);
    i = 0;
    enviandoComando.textContent = "Finalizado rectángulo!";
    respuestaDron.textContent = "";
    retrasoComando.textContent = '';
    if (botonSOS) {
        enviandoComando.textContent = "Botón de emergencia pulsado, vuelo finalizado!";
    }
    botonSOS = false;
}
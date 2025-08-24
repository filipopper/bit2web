// Configurar puerto serial
serial.redirect(SerialPin.P0, SerialPin.P1, BaudRate.BaudRate9600)

// Variables de sensores y botones
let enviarLuz = true
let enviarTemp = true
let enviarAccel = true
let enviarBotones = true

// Variables de intervalo y pulsaciones
let intervaloDefault = 1000    // intervalo inicial en ms
let deltaIntervalo = 500       // aumento por pulsación
let intervalo = intervaloDefault
let pulsacionesA = 0           // 0-4 pulsaciones
let timerDatos = 0

// Variables para LED central
let t = 0
let fadeValue = 0

// Matriz de LEDs base
let baseLEDs: number[][] = []
for (let y = 0; y < 5; y++) {
    baseLEDs[y] = []
    for (let x = 0; x < 5; x++) baseLEDs[y][x] = 0
}

// LED asignado para botón B
const LED_B = { x: 4, y: 4 }  // abajo a la derecha

// Función para actualizar LEDs
function actualizarPantalla() {
    let now = control.millis()
    for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 5; x++) {
            if (x == 2 && y == 2) {
                // Fade sincronizado con intervalo
                fadeValue = Math.round((Math.sin(2 * Math.PI * now / intervalo) + 1) * 127.5)
                led.plotBrightness(x, y, fadeValue)
            } else {
                led.plotBrightness(x, y, baseLEDs[y][x])
            }
        }
    }
}
// Función de envío de datos
function enviarDatos() {
    let json = "{"
    json += "\"ts\":" + control.millis()
    if (enviarLuz) json += ",\"luz\":" + input.lightLevel()
    if (enviarTemp) json += ",\"temp\":" + input.temperature()
    if (enviarAccel) {
        json += ",\"accX\":" + input.acceleration(Dimension.X)
        json += ",\"accY\":" + input.acceleration(Dimension.Y)
        json += ",\"accZ\":" + input.acceleration(Dimension.Z)
    }
    if (enviarBotones) {
        json += ",\"btnA\":" + (input.buttonIsPressed(Button.A) ? 1 : 0)
        json += ",\"btnB\":" + (input.buttonIsPressed(Button.B) ? 1 : 0)
    }
    let velocidad = 1000 / intervalo
    let velocidadStr = "" + Math.round(velocidad * 100) / 100
    json += ",\"intervalo\":" + intervalo
    json += ",\"velocidad\":" + velocidadStr
    json += "}"
    serial.writeLine(json)
}

// Actualizar esquinas según sensores
function actualizarEsquinas() {
    baseLEDs[0][0] = enviarLuz ? 150 : 0
    baseLEDs[4][0] = enviarTemp ? 150 : 0
    baseLEDs[0][4] = enviarAccel ? 150 : 0
    baseLEDs[LED_B.y][LED_B.x] = enviarBotones ? 150 : 0
}

// Botón A: aumentar intervalo escalonado (máx 4 pulsaciones, luego reset)
input.onButtonPressed(Button.A, function () {
    if (!enviarBotones) return

    pulsacionesA += 1
    if (pulsacionesA > 4) {
        pulsacionesA = 0
        intervalo = intervaloDefault
    } else {
        intervalo = intervaloDefault + deltaIntervalo * pulsacionesA
    }

    // Actualizar fila A (ignorar columna central)
    let indices = [0, 1, 3, 4]
    for (let i of indices) baseLEDs[2][i] = 0
    for (let i = 0; i < pulsacionesA; i++) baseLEDs[2][indices[i]] = 150
})

// Botón B: activar/desactivar envío de botones
input.onButtonPressed(Button.B, function () {
    enviarBotones = !enviarBotones
    baseLEDs[LED_B.y][LED_B.x] = enviarBotones ? 150 : 0

    if (!enviarBotones) {
        let indices = [0, 1, 3, 4]
        for (let i of indices) baseLEDs[2][i] = 0
    }
})

// Loop principal: actualizar LEDs y animación
loops.everyInterval(50, function () {
    t += 1
    actualizarEsquinas()
    actualizarPantalla()
})

// Loop envío de datos
loops.everyInterval(50, function () {
    if (control.millis() - timerDatos >= intervalo) {
        enviarDatos()
        timerDatos = control.millis()
    }
})

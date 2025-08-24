Este proyecto implementa un **wrapper de datos de sensores de micro:bit** para transmitirlos en formato JSON a un **ESP32**, que los procesa y muestra en un **captive portal web** en tiempo real.  

La micro:bit lee luz, temperatura, aceleración y el estado de los botones, genera un JSON con timestamp, intervalo de envío y velocidad de transmisión, y lo envía vía puerto serial al ESP32.  

El LED central indica visualmente la frecuencia de envío (respiración sincronizada con el intervalo), las esquinas muestran sensores activos y la fila de LEDs refleja pulsaciones del Botón A. Botón B habilita o deshabilita el control de botones.  

Se utiliza para **monitorización remota de sensores de micro:bit** con feedback visual y control dinámico de la frecuencia de envío mediante botones físicos.

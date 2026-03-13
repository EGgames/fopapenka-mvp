# Historias de Usuario — Fopapenka MVP

**Proyecto:** Fopapenka — Penca de pronósticos de fútbol  
**Versión:** 1.0 MVP  
**Fecha:** Marzo 2026

---

## Épicas

| ID | Épica |
|---|---|
| E1 | Gestión de torneos y campeonatos |
| E2 | Gestión de equipos y fixtures |
| E3 | Pronósticos de usuarios |
| E4 | Carga de resultados y puntuación |
| E5 | Ranking de la penca |
| E6 | Autenticación y registro (código de invitación + cédula) |
| E7 | Chat general |
| E8 | Administración de la penca |
| E9 | Gestión de pencas (multi-penca) |

---

## E1 — Gestión de torneos

### US-01: Crear torneo
**Como** administrador  
**Quiero** crear un nuevo torneo (ej. Apertura 2026)  
**Para** organizar los pronósticos de los usuarios en torno a ese campeonato

**Criterios de aceptación:**
- El admin puede ingresar: nombre del torneo, año y modo (acumulativo o nuevo ranking).
- El torneo queda en estado `activo` al crearse.
- No puede haber dos torneos activos al mismo tiempo.
- El sistema confirma la creación con un mensaje de éxito.

---

### US-02: Finalizar torneo
**Como** administrador  
**Quiero** marcar un torneo como finalizado  
**Para** cerrar la posibilidad de nuevos pronósticos y congelar el ranking final

**Criterios de aceptación:**
- Solo se puede finalizar un torneo si todas sus fixtures tienen resultados cargados.
- Al finalizar, se genera el ranking definitivo del torneo.
- Los usuarios reciben notificación de cierre del torneo.
- El torneo pasa a estado `finalizado`.

---

### US-03: Elegir modo de continuidad al crear torneo
**Como** administrador  
**Quiero** elegir si el nuevo torneo acumula puntos del anterior o comienza desde cero  
**Para** gestionar el ranking global de la penca según lo acordado con los jugadores

**Criterios de aceptación:**
- Al crear un torneo, se presenta la opción: "Acumular puntos" o "Reiniciar ranking".
- Si se elige acumular: los puntos del nuevo torneo se suman al ranking histórico de cada usuario.
- Si se elige reiniciar: el ranking global se pone a cero para todos los usuarios antes de comenzar.
- La decisión queda registrada y es visible en el historial de torneos.

---

## E2 — Gestión de equipos y fixtures

### US-04: Cargar equipos del torneo
**Como** administrador  
**Quiero** cargar los equipos participantes de un torneo  
**Para** poder armar las fixtures con esos equipos

**Criterios de aceptación:**
- El admin puede agregar equipos uno a uno o por lista.
- Cada equipo tiene: nombre y escudo (imagen opcional).
- No se pueden duplicar equipos en el mismo torneo.
- Los equipos son editables mientras el torneo no tenga partidos jugados.

---

### US-05: Crear fixtures y partidos
**Como** administrador  
**Quiero** crear las fechas del torneo y asignar los partidos a cada fecha  
**Para** que los usuarios puedan pronosticar los encuentros

**Criterios de aceptación:**
- El admin puede crear una fixture con nombre y número (ej. "Fecha 1").
- A cada fixture se le asignan partidos: equipo local vs. equipo visitante.
- Se puede indicar fecha y hora del partido (opcional).
- Los partidos quedan en estado `programado` al crearse.
- No se puede asignar el mismo equipo dos veces en la misma fixture.

---

### US-06: Ver calendario completo del torneo
**Como** usuario registrado  
**Quiero** ver todas las fechas y partidos del torneo  
**Para** planificar mis pronósticos con anticipación

**Criterios de aceptación:**
- Se muestra la lista de fixtures en orden.
- Cada fixture muestra sus partidos con equipos, fecha/hora y estado (programado/jugado).
- Los partidos jugados muestran el resultado.
- La vista es accesible sin necesidad de haber pronosticado.

---

## E3 — Pronósticos de usuarios

### US-07: Pronosticar resultado de un partido
**Como** jugador inscrito en una penca  
**Quiero** ingresar mi pronóstico de goles para cada partido  
**Para** acumular puntos cuando acierte

**Criterios de aceptación:**
- El usuario puede ingresar goles del equipo local y visitante para cada partido.
- Solo se puede pronosticar en partidos con estado `programado`.
- Una vez que el partido está `jugado`, el pronóstico se bloquea.
- Se puede editar el pronóstico hasta que el partido comience.
- Si el usuario no pronostica un partido, su puntaje en ese partido es 0.

---

### US-08: Ver mis pronósticos
**Como** jugador  
**Quiero** ver todos mis pronósticos enviados  
**Para** hacer seguimiento de mis predicciones y resultados

**Criterios de aceptación:**
- Se muestran todos los pronósticos del usuario agrupados por fixture.
- Cada pronóstico muestra: partido, mi predicción, resultado real (si ya se jugó) y puntos obtenidos.
- Los partidos pendientes de resultados muestran mi pronóstico en estado "en espera".

---

### US-09: Ver pronósticos de otros jugadores (post-resultado)
**Como** jugador  
**Quiero** ver qué pronosticaron los otros jugadores una vez que el partido se jugó  
**Para** comparar predicciones y generar conversación

**Criterios de aceptación:**
- Los pronósticos de otros usuarios solo son visibles después de que el resultado fue cargado.
- Se muestran en una tabla comparativa por partido.
- No se revelan pronósticos ajenos antes de que el partido termine.

---

## E4 — Carga de resultados y puntuación

### US-10: Cargar resultado de un partido
**Como** administrador  
**Quiero** ingresar el resultado final de un partido  
**Para** que el sistema calcule automáticamente los puntos de cada usuario

**Criterios de aceptación:**
- El admin selecciona el partido y carga goles local y visitante.
- El partido pasa a estado `jugado`.
- El sistema calcula automáticamente los puntos de cada pronóstico:
  - **3 puntos**: el marcador exacto coincide.
  - **1 punto**: el resultado (victoria local / empate / victoria visitante) coincide pero el marcador es distinto.
  - **0 puntos**: el resultado no coincide.
- El ranking se actualiza en tiempo real tras la carga.
- Solo se puede cargar resultado una vez; existe opción de corrección con confirmación.

---

### US-11: Corregir resultado cargado por error
**Como** administrador  
**Quiero** corregir un resultado cargado incorrectamente  
**Para** que los puntos se recalculen con el marcador correcto

**Criterios de aceptación:**
- Solo el admin puede modificar un resultado ya cargado.
- Al corregir, el sistema recalcula todos los puntos de ese partido.
- El ranking se actualiza automáticamente.
- La corrección queda registrada en un log de auditoría.

---

## E5 — Ranking de la penca

### US-12: Ver ranking del torneo actual
**Como** jugador  
**Quiero** ver el ranking de puntos del torneo en curso  
**Para** saber en qué posición estoy respecto a los demás participantes

**Criterios de aceptación:**
- Se muestra una tabla con: posición, nombre de usuario, puntos en el torneo y partidos pronosticados.
- El ranking se actualiza automáticamente al cargarse nuevos resultados.
- La posición del usuario autenticado se resalta visualmente.
- Se puede filtrar por fixture/fecha.

---

### US-13: Ver ranking acumulado histórico
**Como** jugador  
**Quiero** ver el ranking con puntos acumulados de todos los torneos  
**Para** conocer al campeón histórico de la penca

**Criterios de aceptación:**
- Se muestra tabla con puntos totales históricos por jugador.
- Si el torneo actual está configurado como acumulativo, sus puntos se reflejan en tiempo real.
- Se puede ver el detalle de puntos por torneo al hacer clic en un jugador.

---

## E6 — Autenticación y registro

### US-14: Unirse a una penca con código de invitación
**Como** usuario nuevo  
**Quiero** ingresar el código de invitación de una penca, elegir mi apodo y registrarme con mi cédula  
**Para** poder participar en esa penca y pronosticar partidos

**Criterios de aceptación:**
- Pantalla inicial muestra un campo para ingresar el código de invitación de la penca.
- Si el código es válido, se muestra el nombre de la penca y el formulario de registro.
- El formulario solicita: **apodo** (nickname) y **cédula de identidad** (ej. `44444444`).
- El apodo debe ser único dentro de esa penca (no globalmente).
- La cédula se almacena **siempre hasheada con bcrypt**; nunca en texto plano. Mínimo 6 dígitos numéricos.
- No se requiere email para registrarse.
- Al registrarse, el usuario queda autenticado automáticamente con un JWT.
- Si el código de penca no existe o está inactivo, se muestra mensaje de error claro.
- Si el apodo ya está tomado en esa penca, se informa y se solicita otro.

---

### US-15: Iniciar sesión en una penca
**Como** usuario ya registrado en una penca  
**Quiero** ingresar el código de penca, mi apodo y mi cédula para iniciar sesión  
**Para** acceder a mis pronósticos, el ranking y el chat de esa penca

**Criterios de aceptación:**
- El login solicita: código de penca (o selección de penca si el usuario ya ingresó antes) + apodo + cédula.
- Se devuelve un JWT con payload `{ userId, pencaId, role }`, vigencia 24 horas.
- Opción "recordarme" extiende el token a 7 días.
- Mensaje claro si las credenciales son incorrectas (sin revelar si falla el apodo o la cédula).
- Un usuario puede tener sesiones en múltiples pencas a la vez (JWT distinto por penca).

---

### US-16: Cerrar sesión
**Como** usuario autenticado  
**Quiero** poder cerrar sesión  
**Para** proteger mi cuenta en dispositivos compartidos

**Criterios de aceptación:**
- El token JWT se invalida en el cliente (se elimina del storage).
- El usuario es redirigido a la pantalla de ingreso de código de penca.

---

## E7 — Chat general

### US-17: Enviar mensaje en el chat general
**Como** jugador registrado en la penca  
**Quiero** escribir mensajes en el chat general  
**Para** interactuar con los demás participantes

**Criterios de aceptación:**
- Solo usuarios autenticados pueden enviar mensajes.
- El mensaje muestra: nombre de usuario, texto y timestamp.
- Los mensajes se envían en tiempo real (WebSocket / Socket.io).
- Los mensajes persisten en base de datos y son visibles al recargar.
- Máximo 500 caracteres por mensaje.

---

### US-18: Ver historial de mensajes del chat
**Como** jugador  
**Quiero** ver los mensajes anteriores del chat al ingresar  
**Para** seguir el contexto de la conversación

**Criterios de aceptación:**
- Al abrir el chat se cargan los últimos 50 mensajes.
- Se puede hacer scroll hacia arriba para cargar mensajes anteriores (paginación).
- Los mensajes nuevos aparecen al final automáticamente.

---

## E8 — Administración de la penca

### US-19: Ver panel de administración
**Como** administrador de una penca  
**Quiero** tener un panel centralizado  
**Para** gestionar torneos, equipos, fixtures, resultados y usuarios desde un solo lugar

**Criterios de aceptación:**
- El panel es accesible solo para el admin de esa penca.
- Muestra: nombre de la penca, código de invitación visible, torneo activo, próxima fixture sin resultados, cantidad de jugadores activos.
- Accesos directos a: cargar resultado, crear fixture, ver ranking, gestionar usuarios.

---

### US-20: Gestionar usuarios de la penca
**Como** administrador  
**Quiero** ver la lista de jugadores registrados en mi penca y poder desactivar cuentas  
**Para** moderar la penca

**Criterios de aceptación:**
- Lista de jugadores con: apodo (nickname), rol, fecha de ingreso y estado (activo/inactivo).
- **No se muestra la cédula** en ningún listado ni pantalla de administración.
- El admin puede desactivar un jugador (no lo elimina, solo lo suspende).
- Un jugador desactivado no puede iniciar sesión ni pronosticar.
- El admin puede reactivar un jugador.

---

## E9 — Gestión de pencas

### US-21: Crear una nueva penca
**Como** administrador  
**Quiero** crear una nueva penca con nombre y código de invitación  
**Para** invitar jugadores y comenzar a organizar torneos

**Criterios de aceptación:**
- El admin ingresa el nombre de la penca.
- El sistema genera automáticamente un `invite_code` alfanumérico único (ej. `AMIGOS2026`), que también puede ser personalizado por el admin.
- El código es visible en el panel de administración para poder compartirlo.
- Si se elige un código ya existente, el sistema lo informa y solicita otro.
- La penca queda en estado `activa` al crearse.

---

### US-22: Regenerar código de invitación
**Como** administrador  
**Quiero** regenerar el código de invitación de mi penca  
**Para** invalidar el código anterior si fue compartido por error

**Criterios de aceptación:**
- El admin puede solicitar un nuevo código; el anterior deja de ser válido de inmediato.
- Los jugadores ya registrados con el código anterior no se ven afectados.
- El sistema pide confirmación antes de regenerar.

---

### US-23: Ver mis pencas
**Como** jugador  
**Quiero** ver todas las pencas en las que participo  
**Para** acceder rápidamente a cada una sin tener que ingresar el código nuevamente

**Criterios de aceptación:**
- Al iniciar la app, si el dispositivo tiene tokens guardados, se muestran las pencas activas del usuario.
- El usuario puede seleccionar a qué penca entrar.
- También puede ingresar a una penca nueva con un código diferente.

---

## Resumen de historias

| ID | Historia | Épica | Rol | Prioridad MVP |
|---|---|---|---|---|
| US-01 | Crear torneo | E1 | Admin | Alta |
| US-02 | Finalizar torneo | E1 | Admin | Alta |
| US-03 | Modo de continuidad | E1 | Admin | Media |
| US-04 | Cargar equipos | E2 | Admin | Alta |
| US-05 | Crear fixtures y partidos | E2 | Admin | Alta |
| US-06 | Ver calendario | E2 | Jugador | Alta |
| US-07 | Pronosticar partido | E3 | Jugador | Alta |
| US-08 | Ver mis pronósticos | E3 | Jugador | Alta |
| US-09 | Ver pronósticos ajenos post-resultado | E3 | Jugador | Media |
| US-10 | Cargar resultado | E4 | Admin | Alta |
| US-11 | Corregir resultado | E4 | Admin | Media |
| US-12 | Ranking torneo actual | E5 | Jugador | Alta |
| US-13 | Ranking acumulado histórico | E5 | Jugador | Media |
| US-14 | Registro con código de invitación + cédula | E6 | Usuario | Alta |
| US-15 | Login (penca + apodo + cédula) | E6 | Usuario | Alta |
| US-16 | Logout | E6 | Usuario | Alta |
| US-17 | Enviar mensaje en chat | E7 | Jugador | Media |
| US-18 | Ver historial del chat | E7 | Jugador | Media |
| US-19 | Panel de administración | E8 | Admin | Alta |
| US-20 | Gestionar jugadores de la penca | E8 | Admin | Media |
| US-21 | Crear una nueva penca | E9 | Admin | Alta |
| US-22 | Regenerar código de invitación | E9 | Admin | Media |
| US-23 | Ver mis pencas | E9 | Jugador | Alta |

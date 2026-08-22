# Gestion de Eventos

Aplicacion web para gestionar eventos. El proyecto usa Angular 19, componentes Standalone y Tailwind CSS.

Este documento explica la organizacion del proyecto de una forma sencilla para que cualquier persona pueda comenzar a trabajar en el.

## Antes de comenzar

Necesitas tener instalado Node.js. Luego ejecuta:

```bash
npm install
npm start
```

Abre `http://localhost:4200/` en el navegador.

## Estructura del proyecto

```text
src/app/
├── core/
│   ├── interceptors/
│   ├── services/
│   └── guards/
├── pages/
├── shared/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   ├── pipes/
│   ├── template/
│   └── utils/
├── app.component.ts
├── app.component.html
├── app.config.ts
└── app.routes.ts
```

## Que significa cada carpeta

### `core/`

Aqui van las cosas generales de la aplicacion. Son funcionalidades que se pueden necesitar en muchas pantallas.

Dentro de `core` usamos estas carpetas:

#### `core/interceptors/`

Un interceptor revisa o modifica las solicitudes HTTP antes de que lleguen al servidor. Tambien puede revisar las respuestas o manejar errores comunes.

Ejemplos:

- Agregar el token de autenticacion a cada solicitud.
- Mostrar u ocultar un indicador de carga.
- Manejar errores HTTP generales.

#### `core/services/`

Un servicio contiene logica que no deberia estar escrita directamente en un componente. Se puede utilizar desde varias paginas.

Ejemplos:

- Consumir la API de eventos.
- Iniciar y cerrar sesion.
- Compartir informacion entre componentes.

#### `core/guards/`

Un guard decide si una persona puede entrar a una ruta. Normalmente revisa si inicio sesion o si tiene los permisos necesarios.

Ejemplo: impedir que una persona no autenticada entre a la pantalla de administracion.

Otros ejemplos de elementos que pueden vivir directamente en `core`:

- Servicios para iniciar sesion.
- Servicios para consumir la API.
- Configuraciones generales.

Regla sencilla: si una funcionalidad es global, probablemente pertenece a `core`.

### `pages/`

Aqui van las pantallas completas de la aplicacion. Normalmente cada pagina se conecta con una ruta.

Ejemplos:

- `events`: listado de eventos.
- `event-form`: crear o editar un evento.
- `event-detail`: ver la informacion de un evento.

Una pagina puede usar servicios de `core` y componentes reutilizables de `shared`.

### `shared/`

Aqui van los componentes que pueden reutilizarse en varias paginas. Esta carpeta sigue la idea de Atomic Design.

#### `shared/atoms/`

Son las piezas mas pequenas de la interfaz. Cada una hace una sola cosa.

Ejemplos: boton, input, etiqueta, icono o spinner.

#### `shared/molecules/`

Son grupos pequenos formados por dos o mas atoms.

Ejemplos: buscador con input y boton, selector de fecha o campo de formulario con su mensaje de error.

#### `shared/organisms/`

Son partes mas grandes de la interfaz, formadas por atoms y molecules.

Ejemplos: tarjeta de evento, tabla de asistentes, menu de navegacion o formulario completo.

#### `shared/template/`

Define la estructura comun de las paginas. Por ejemplo, encabezado, menu lateral, contenido principal y pie de pagina.

El template define donde va cada parte, pero no deberia contener datos especificos de un evento.

#### `shared/pipes/`

Contiene pipes que transforman datos para mostrarlos en pantalla.

Ejemplos: mostrar una fecha con un formato, traducir un estado o dar formato a una cantidad.

#### `shared/utils/`

Contiene funciones auxiliares pequenas y reutilizables.

Ejemplos: validar un correo, formatear una fecha o convertir un valor.

## Angular Standalone

Este proyecto usa componentes Standalone. Esto significa que cada componente declara sus propias dependencias en `imports`.

No se crean `NgModule` para agrupar componentes. Por ejemplo:

```ts
@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-card.component.html'
})
export class EventCardComponent {}
```

La configuracion general esta en `app.config.ts` y las rutas estan en `app.routes.ts`.

## Atomic Design explicado de forma simple

La interfaz se construye de menor a mayor:

```text
Atom       -> boton
Molecule   -> buscador
Organism   -> tarjeta de evento
Template   -> estructura de la pagina
Page       -> pantalla completa con datos
```

Por ejemplo, una pagina de eventos puede usar un organismo `event-card`, que a su vez usa atoms como `button` y `status-badge`.

## Regla para los estilos CSS: BEM

Usamos Tailwind CSS para estilos rapidos y clases utilitarias. Si un componente necesita un archivo CSS propio, las clases deben seguir la metodologia **BEM**.

BEM significa:

- **Bloque:** componente independiente.
- **Elemento:** parte interna del bloque.
- **Modificador:** variacion del bloque o elemento.

La forma de escribir una clase es:

```text
bloque__elemento--modificador
```

Ejemplo:

```html
<article class="event-card event-card--featured">
  <h2 class="event-card__title">Innovacion y futuro digital</h2>
  <span class="event-card__status event-card__status--active">Activo</span>
</article>
```

```css
.event-card {
  padding: 1.5rem;
}

.event-card__title {
  margin: 0;
}

.event-card--featured {
  border: 2px solid #4f46e5;
}
```

Reglas importantes:

1. Escribir las clases en minusculas y separar palabras con guiones.
2. Usar `__` para los elementos.
3. Usar `--` para los modificadores.
4. Evitar nombres genericos como `.title` o `.container`.
5. Mantener el archivo CSS junto al componente que lo utiliza.

## Reglas para saber donde crear algo

- Si es una pantalla completa, crearla en `pages`.
- Si es un componente pequeno, crearlo en `shared/atoms`.
- Si combina varios componentes pequenos, usar `shared/molecules`.
- Si es una seccion grande reutilizable, usar `shared/organisms`.
- Si sirve para toda la aplicacion, usar `core`.
- Si transforma datos en el HTML, usar `shared/pipes`.
- Si es una funcion auxiliar pura, usar `shared/utils`.

## Comandos utiles

Crear un componente atom:

```bash
ng generate component shared/atoms/button
```

Crear un componente molecule:

```bash
ng generate component shared/molecules/search-field
```

Crear un organismo:

```bash
ng generate component shared/organisms/event-card
```

Crear una pagina:

```bash
ng generate component pages/events
```

Crear un servicio global:

```bash
ng generate service core/services/auth
```

Crear un pipe:

```bash
ng generate pipe shared/pipes/event-status
```

## Compilar y probar

```bash
npm run build
npm test
```

## Ejecutar con Docker

El proyecto incluye un `Dockerfile` con dos etapas:

1. Node.js instala las dependencias y compila la aplicacion Angular.
2. Nginx sirve los archivos compilados en una imagen mas pequena.

Tambien se incluye `nginx.conf` para que las rutas de Angular funcionen correctamente al recargar una pagina. El archivo `.dockerignore` evita copiar archivos innecesarios al contenedor.

Construir la imagen:

```bash
docker build -t gestion-eventos .
```

Ejecutar el contenedor:

```bash
docker run --name gestion-eventos-app -p 8080:80 gestion-eventos
```

Abrir `http://localhost:8080/` en el navegador.

Para detener y eliminar el contenedor:

```bash
docker stop gestion-eventos-app
docker rm gestion-eventos-app
```

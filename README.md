# ¿Reconoces el escudo? — Quiz de las 5 grandes ligas

Quiz interactivo para adivinar el nombre de un equipo a partir de su escudo (Premier League, LaLiga, Serie A, Bundesliga y Ligue 1). Diseño oscuro con efecto cristal, 100 % responsivo, sin dependencias ni paso de compilación.

## Cómo ejecutarlo

1. Descomprime la carpeta.
2. Abre `index.html` con doble clic en cualquier navegador moderno.
3. Necesitas conexión a internet: los escudos y la tipografía (Sora) se cargan en línea.

Opcional, con servidor local: `npx serve .` o la extensión **Live Server** de VS Code.

## Estructura

| Archivo      | Contenido                                         |
|--------------|---------------------------------------------------|
| `index.html` | Estructura de las 3 pantallas (inicio, quiz, resultados) |
| `style.css`  | Tema, glassmorphism, animaciones y responsividad  |
| `script.js`  | Configuración, preguntas y lógica del juego       |

## Personalizar las preguntas

Edita el arreglo `QUESTIONS` en `script.js`. Cada pregunta es un objeto:

```js
{
  liga: "LaLiga",                                  // etiqueta que se muestra
  escudo: "Spain - LaLiga/Real Madrid.png",        // ruta o URL completa (https://...)
  respuesta: "Real Madrid",                        // opción correcta
  incorrectas: ["FC Barcelona", "Sevilla", "Valencia"]  // exactamente 3
}
```

Las opciones y el orden de las preguntas se mezclan automáticamente en cada partida.

## Usar escudos propios (modo sin conexión)

1. Crea una carpeta `img/` junto a `index.html` y guarda ahí tus imágenes.
2. En `script.js` cambia `CONFIG.logosBase` a `"img/"`.
3. En cada pregunta, pon el nombre del archivo en `escudo` (por ejemplo `"real-madrid.png"`).

Si una imagen no carga, el quiz muestra un signo "?" en lugar del escudo.

## Otros ajustes

- `CONFIG.nextDelay`: milisegundos que se muestra el acierto/error (por defecto 1500).
- `CONFIG.shuffleQuestions`: `false` para mantener el orden del arreglo.
- `MESSAGES`: mensajes motivacionales por rango de puntaje.
- Colores: variables al inicio de `style.css` (`--violet`, `--blue`, `--ok`, `--bad`).
- Atajos: teclas **1–4** eligen la opción en escritorio.

## Nota sobre los escudos

Por defecto las imágenes se enlazan desde el repositorio comunitario `luukhopman/football-logos`; no se incluyen en este proyecto. Los escudos son marcas registradas de sus clubes: úsalos solo con fines ilustrativos y revisa las licencias antes de publicar el quiz.

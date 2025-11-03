
---

````markdown
# Configuración del Proyecto Angular

```bash
nvm install 22.12.0 && nvm use 22.12.0

npx @angular/cli@20 new my-app --routing --style=scss
cd my-app
````

---

## Estructura de Carpetas

```
src/
 └── app/
      ├── core/
      │     ├── api/                ← low‐level HTTP clients, etc.
      │     ├── services/           ← singleton app‐wide services
      │     ├── guards/
      │     └── models/             ← global/shared interfaces/types
      │
      ├── shared/
      │     ├── components/         ← reusable UI bits (buttons, etc.)
      │     ├── directives/
      │     ├── pipes/
      │     └── models/             ← shared interfaces/types used by many features
      │
      ├── features/
      │     ├── feature-A/
      │     │     ├── components/
      │     │     ├── services/
      │     │     ├── models/
      │     │     └── feature-A.module.ts (or standalone setup)
      │     └── feature-B/
      │           ├── …
      │
      ├── app.routes.ts                ← routing setup
      └── app.component.ts
```

---


## Decisiones de Diseño

### Buscadores: ID, Nombre, Ingredientes

Se evaluó entre usar **FormBuilder** o componentes simples.
Se eligió **inputs individuales** por la simpleza y libertad de personalización, además de facilitar las pruebas unitarias.
Sin embargo, en aplicaciones con muchos filtros podría no ser viable.

---

### Grilla o Tarjetas

Se optó por **grilla** debido a:

* Facilidad de personalización y futuros filtros o ordenamientos.
* Mayor legibilidad con grandes volúmenes de datos.
* Permite mostrar más información en menos espacio.
  El **detalle del cóctel** se presenta en formato **Card** (responsive para mobile/desktop).

---

### Carga de Datos

**Loading state simple**: texto con ícono, para mantener la interfaz ligera y clara.

---

### Listas Largas: Infinite Scroll

Se implementó el **Sentinel approach**, un método eficiente y simple.
Permite ajustar el *trigger margin* según las necesidades de UX.

---

### Favoritos

* Implementado con un **switch**, intuitivo y consistente con la app.
* Muestra resultados solo tras una búsqueda.
* Posibilidad de agregar función para mostrar todos los favoritos (decisión pendiente).
* Ícono de favorito **filled/outlined** según estado del cóctel.

---

### Persistencia de Datos

Se evaluó usar **IndexedDB**, pero se descartó por complejidad innecesaria.
En frontend, suele reservarse para casos de alto rendimiento.
Si se requiriera rendimiento extremo, se podría usar **DuckDB** + **Parquets**.
Finalmente, se eligió **localStorage**, que persiste entre pestañas (a diferencia de sessionStorage).

---

### Estado Global

El archivo `cocktails.store.ts` utiliza **Angular Signals**.
Esto permite un flujo de datos **reactivo, eficiente y fácilmente rastreable**.

#### Separación de Responsabilidades (SoC)

* **API Layer (`cocktails.api.ts`):** llamadas HTTP.
* **State Layer (`cocktails.store.ts`):** estado, lógica de negocio y persistencia.
* **View Layer:** presentación e interacción con el usuario.

---

### Componentes Standalone

Se eliminan los `NgModules`, haciendo los componentes más **autocontenidos y reutilizables**.

---

### Sincronización de Estado

El `CocktailsStore` guarda automáticamente el estado de la app (búsquedas, favoritos, etc.) en **localStorage**
y **sincroniza entre pestañas** mediante eventos de `storage`, mejorando la experiencia del usuario.

---

### Pruebas Unitarias

Cada componente y servicio tiene su correspondiente archivo `.spec.ts`.

---

### Modularidad

La estructura `core`, `features`, `shared` garantiza **orden, reutilización y escalabilidad**.

---



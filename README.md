# 🏛️ BVH · Shell del portal de la Bolsa de Valores de La Habana (work in progress...)

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deployed-brightgreen)](https://tusuario.github.io/bvh-landing/)
[![Apache 2.0 License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)
[![Made with ❤️ in Cuba](https://img.shields.io/badge/Made%20with-❤️%20in%20Cuba-red)](https://github.com/tu-usuario/bvh-landing)

Landing page institucional para la **Bolsa de Valores de La Habana (BVH)**, una plataforma moderna de información financiera y educación para emprendedores cubanos, dentro y fuera de la isla.

![Vista previa de BVH](https://www.image2url.com/r2/default/images/1782945410682-fdfe61de-4146-4a7d-ae72-be4e5f0b152f.png)

---

## 📖 Descripción

Esta landing page representa la identidad digital de la **Bolsa de Valores de La Habana**, un proyecto que rescata el legado financiero cubano de la primera mitad del siglo XX y lo proyecta hacia el siglo XXI con una infraestructura moderna, transparente y educativa.

El sitio incluye:

- **Ticker en tiempo real** con datos simulados de empresas cubanas (AZCUBA, ETECSA, CIMEX, GAESA, BFI, CUBACAB, ISLAZUL, CUBANA, TRD, CUPET).
- **Índices sectoriales** (General, Tecnología, Turismo, Agroindustria, Energía).
- **Tabla de cotizaciones** con precios y variaciones diarias.
- **Historia y valores institucionales** (transparencia, rigor técnico, neutralidad, excelencia).
- **Servicios** para emprendedores (educación, consultoría, club de inversión).
- **Instituto BVH** con oferta formativa (cursos y certificaciones).
- **Habana Stock Exchange (HSE)** como núcleo operativo (libro de órdenes simulado).
- **Formulario de suscripción** a boletín informativo.
- **Modo claro/oscuro** con persistencia en `localStorage`.
- **Diseño 100% responsivo** y accesible (mobile-first).

---

## 🚀 Características principales

- ✅ **Ticker animado** con actualización automática cada 3 segundos (simulación de mercado).
- ✅ **Cambio de tema** (claro/oscuro) con persistencia (recuerda tu preferencia).
- ✅ **Menú móvil** desplegable con hamburguesa.
- ✅ **Scroll suave** a secciones internas con offset para navegación fija.
- ✅ **SVG incrustado** para el logo (sin dependencias externas).
- ✅ **Variables CSS** para fácil personalización de colores y tipografía.
- ✅ **Optimizado para GitHub Pages** (con soporte para `.nojekyll`).
- ✅ **Sin dependencias externas** (todo vanilla HTML/CSS/JS).

---

## 📁 Estructura de archivos
```
/
├── index.html # Página principal (todo el HTML + CSS inline + JavaScript inline)
├── README.md # Este archivo que estás leyendo
├── LICENCE # Archivo de Licencia de uso del software
└── svg # Carpeta que contiene los archivos svg utilizados en el proyecto
    ├── logo.svg # Logo empleado en el modo claro
    ├── logo_dark.svg # Logo empleado en el modo oscuro
    ├── logotipo.svg # Logotipo empleado en el modo claro
    └── logotipo_dark.svg # Logotipo empleado en el modo oscuro
```

> **Nota:** No se utilizan imágenes externas ni fuentes de terceros; todo el contenido (incluidos íconos y logo) está incrustado en el HTML/CSS para máxima portabilidad.

---

## 🛠️ Tecnologías utilizadas

- **HTML5** semántico y accesible.
- **CSS3** con variables CSS, flexbox, grid, animaciones y `@media queries`.
- **JavaScript vanilla** (DOM, eventos, `localStorage`, `setInterval`).
- **SVG** para el logo y gráficos decorativos.
- **GitHub Pages** para el despliegue gratuito.

---

## ⚙️ Cómo ejecutar localmente

1. **Clona este repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/bvh.git
   cd bvh

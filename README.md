# Azure Issue Template Generator 🚀

Una herramienta web moderna y eficiente diseñada para simplificar la creación de Work Items en Azure DevOps mediante el uso de plantillas dinámicas e inteligentes.

[![Firebase Hosting](https://img.shields.io/badge/Deployment-Firebase_Hosting-orange?logo=firebase)](https://azure-issue-gen-4554.web.app)
[![Ionic Framework](https://img.shields.io/badge/Framework-Ionic_7-3880ff?logo=ionic)](https://ionicframework.com/)
[![Angular](https://img.shields.io/badge/Framework-Angular_17-dd0031?logo=angular)](https://angular.io/)

## ✨ Características Principales

- **Gestión de Plantillas Dinámicas**: Crea y edita plantillas personalizadas usando sintaxis de variables `{{variable}}`.
- **Selector de Plantillas Adaptativo**: Flujo de trabajo optimizado que prioriza la selección de la plantilla antes de mostrar el formulario.
- **Parsing Inteligente de Títulos**: Campo "Auto-Parser" que detecta y extrae automáticamente el ID y el Título desde un string copiado de Azure (ej: `User Story 123: Mi Título`).
- **Formularios Dinámicos**: Generación automática de campos basada en las variables detectadas en la plantilla.
- **Persistencia Local**: Tus plantillas y configuraciones se guardan localmente para acceso rápido y privacidad.
- **Diseño Premium**: Interfaz moderna basada en Material Design 3 con soporte para modo claro/oscuro.

## 🛠️ Stack Tecnológico

- **Frontend**: [Ionic Framework](https://ionic.io/) con [Angular](https://angular.io/).
- **Lenguaje**: TypeScript.
- **Estilos**: SCSS y Vanilla CSS siguiendo MD3.
- **Hosting**: [Firebase Hosting](https://firebase.google.com/docs/hosting).
- **Iconos**: [Ionicons](https://ionicons.com/).

## 🚀 Instalación y Uso Local

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/tu-usuario/issue-azure-template-generator.git
   cd issue-azure-template-generator
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar en desarrollo**:
   ```bash
   npm run start
   # o usando ionic cli
   ionic serve
   ```

## 📦 Despliegue

La aplicación se despliega automáticamente en Firebase Hosting. Para realizar un nuevo despliegue manual:

```bash
# 1. Generar build de producción
npm run build -- --configuration production

# 2. Desplegar a Firebase
firebase deploy --only hosting
```

O usa el workflow asistido: `.agent/workflows/deploy-firebase.md`.

## 🌐 Live Demo

Puedes acceder a la versión productiva aquí:  
[**https://azure-issue-gen-4554.web.app**](https://azure-issue-gen-4554.web.app)

---
Desarrollado con ❤️ para agilizar el flujo de trabajo en Azure DevOps.

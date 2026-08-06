# DecarbCityTwin

DecarbCityTwin is a platform for health-driven and equitable decarbonization of
the built environment.

## Project structure

```text
DecarbCityTwin/
├── Website/     Primary frontend and Clarity Air API proxy
└── VR/          Independent WebXR application
```

## Website

The React/Vite Website contains the public project site, digital-twin dashboard,
research and module pages, and the Clarity Air live-data interface.

```bash
cd Website
npm install
npm run dev
```

Production check:

```bash
npm run build
```

## VR

The `VR` directory remains an independent application with its own dependencies,
build, assets, tests, and documentation. Website cleanup must not modify it.

See `VR/README.md` for its local startup and validation commands.

## Data security

- Keep API keys only in ignored `.env.local` files.
- Do not commit `.auth`, browser profiles, or generated output.
- Use `.env.example` files only for empty configuration templates.

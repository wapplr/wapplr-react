import wapplrServer from 'wapplr';
import reactRender from "./reactRender";

export default function createServer(p = {}) {
    const wapp = p.wapp || wapplrServer({...p});
    reactRender({wapp, ...p});
    return wapp;
}

export function createMiddleware(p = {}) {
    return function reactMiddleware(req, res, next) {
        const wapp = req.wapp || p.wapp || createServer(p);
        reactRender({wapp, ...p});
        next();
    }
}

const defaultConfig = {
    config: {
        globals: {
            DEV: (typeof DEV !== "undefined") ? DEV : undefined,
            WAPP: (typeof WAPP !== "undefined") ? WAPP : undefined,
            RUN: (typeof RUN !== "undefined") ? RUN : undefined,
            TYPE: (typeof TYPE !== "undefined") ? TYPE : undefined,
            ROOT: (typeof ROOT !== "undefined") ? ROOT : __dirname
        }
    }
}

export async function run(p = defaultConfig) {

    const wapp = await createServer(p);
    const globals = wapp.globals;
    const {DEV} = globals;

    const app = wapp.server.app;
    app.use(createMiddleware({wapp, ...p}));
    wapp.server.listen();

    if (typeof DEV !== "undefined" && DEV && module.hot){
        app.hot = module.hot;
        module.hot.accept("./index");
    }

    return wapp;
}

if (typeof RUN !== "undefined" && RUN === "wapplr-react") {
    run();
}

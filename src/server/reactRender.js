import React from "react"
import ReactDOMServer from "react-dom/server"
import Html from "./Html"
import Log from "../common/Log"
import {defaultDescriptor} from "../common/utils"

export default function reactRender(p = {}) {

    const {wapp} = p;
    const middleware = wapp.server.middlewares.render;

    if (!middleware._initializedWapplrReact) {

        wapp.contents.addComponent({
            html: Html
        })

        wapp.contents.add({
            log: {
                render: Log,
                renderType: "react"
            },
        })

        middleware.addHandle({
            react: function(req, res, next) {
                if (wapp.response.content && wapp.response.content.renderType === "react") {

                    res.status(wapp.response.statusCode || 200);

                    const Content = wapp.response.content.render;
                    const contentText = ReactDOMServer.renderToStaticMarkup(<Content wapp={wapp} />)
                    const RenderHtml = wapp.contents.getComponent("html") || Html;
                    res.send("<!DOCTYPE html>" + ReactDOMServer.renderToStaticMarkup(<RenderHtml wapp={wapp} contentText={contentText}/>));
                    next();

                } else {
                    next();
                }
            },
        })

        Object.defineProperty(middleware, "_initializedWapplrReact", {
            ...defaultDescriptor,
            writable: false,
            enumerable: false,
            value: true
        });

    }

    return middleware;

}

import React from "react";
import ReactDOMServer from "react-dom/server";
import Html from "./Html";
import Log from "../common/Log";
import {defaultDescriptor} from "../common/utils";
import {WappContext, withWapp} from "../common/Wapp";

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

                    res.wapp.response.status(wapp.response.statusCode || 200);

                    const Content = wapp.response.content.render;
                    const Render = withWapp(Content);

                    const contentText = ReactDOMServer.renderToStaticMarkup(
                        <WappContext.Provider value={{ wapp }}>
                            <Render />
                        </WappContext.Provider>
                    )

                    const RenderHtml = wapp.contents.getComponent("html") || Html;

                    res.wapp.response.send("<!DOCTYPE html>" +
                        ReactDOMServer.renderToStaticMarkup(
                            <WappContext.Provider value={{ wapp }}>
                                <RenderHtml contentText={contentText}/>
                            </WappContext.Provider>
                        )
                    );

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

        Object.defineProperty(middleware, "wapp", {...defaultDescriptor, writable: false, enumerable: false, value: wapp});

    }

    return middleware;

}

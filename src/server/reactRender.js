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
        });

        wapp.contents.add({
            log: {
                render: Log,
                renderType: "react"
            },
        });

        middleware.addHandle({
            react: function(req, res, next) {
                if (res.wappResponse.content && res.wappResponse.content.renderType === "react") {

                    res.wappResponse.status(res.wappResponse.statusCode || 200);

                    const Content = res.wappResponse.content.render;
                    const RenderContent = withWapp(Content);

                    if (res.wapplrReactEndType === "component"){

                        function Render() {
                            return (
                                <WappContext.Provider value={{ wapp, req, res }}>
                                    <RenderContent />
                                </WappContext.Provider>
                            )
                        }

                        res.wappResponse.send({Render, wapp, req, res});

                        return;
                    }

                    const contentText = ReactDOMServer.renderToStaticMarkup(
                        <WappContext.Provider value={{ wapp, req, res }}>
                            <RenderContent />
                        </WappContext.Provider>
                    );

                    const RenderHtml = wapp.contents.getComponent("html") || Html;

                    res.wappResponse.send("<!DOCTYPE html>" +
                        ReactDOMServer.renderToStaticMarkup(
                            <WappContext.Provider value={{ wapp, req, res }}>
                                <RenderHtml contentText={contentText}/>
                            </WappContext.Provider>
                        )
                    );

                    next();

                } else {
                    next();
                }
            },
        });

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

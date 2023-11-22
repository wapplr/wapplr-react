import React, {useContext} from "react";
import style from "wapplr/dist/common/template/app_css.js";

import {WappContext} from "../../common/Wapp";

export default function Html(props) {

    const { wapp, req, res } = useContext(WappContext);

    const { contentText = "", children, appStyle = style } = props;

    const config = wapp.server.config;

    const {
        siteName = "Wapplr",
        assets = {},
        lang = "en_US",
        viewport = "width=device-width, initial-scale=1",
        themeColor = "#ffffff",
        manifest = "/manifest.json",
        icon = "data:image/png;base64,iVBORw0KGgo=",
        appleTouchIcon,
    } = config;

    const {
        store,
        content = {},
        statusCode = 200,
        containerElementId = "app",
        appStateName = "APP_STATE"
    } = res.wappResponse;

    const state = (store) ? store.getState() : {};

    let { title = "", description = "", author = "Wapplr" } = content;

    if (typeof title === "function") {
        title = title({ wapp, req, res })
    }
    title = `${(title) ? title : (statusCode === 404) ? "Not Found | " + siteName : "Untitled Page | " + siteName}`;

    if (typeof description === "function") {
        description = description({ wapp, req, res })
    }
    description = (description) ? description : (title && title.split) ? title.split(" | ")[0] : title;

    if (typeof author === "function") {
        author = author({ wapp, req, res })
    }
    author = (author || siteName);

    wapp.styles.use(appStyle);

    const styles = wapp.styles.getCssText();
    const csStyles = assets.getCsStyles();

    const stateText = `window["${appStateName}"] = ${JSON.stringify(state)}`;
    const scripts = assets.getScripts();

    const ExtendedHeadComponent = wapp.contents.getComponent("head");

    return (
        <html lang={lang.split("_")[0]}>
            <head>
                <meta charSet="UTF-8" />
                <title>{title}</title>
                <meta name={"description"} content={description} />
                <meta name={"author"} content={author} />
                <meta name={"viewport"} content={viewport} />
                <meta name={"theme-color"} content={themeColor} />
                <link rel={"manifest"} href={manifest} />
                <link rel={"icon"} href={icon} />
                <link rel={"apple-touch-icon"} href={appleTouchIcon || icon} />
                {(ExtendedHeadComponent) ? <ExtendedHeadComponent /> : null}
                {(styles && styles.length) ? styles.map(function(style, i) {
                    return <style key={"style-"+i} id={style.id} dangerouslySetInnerHTML={{ __html: style.cssText }} />
                }) : null}
                {(csStyles && csStyles.length) ? csStyles.map(function(css, i) {
                    return <link
                        key={"css-"+i}
                        rel={"stylesheet"}
                        as={"style"}
                        type={"text/css"}
                        href={css}
                    />
                }) : null}
            </head>
            <body>
                {
                    children ?
                        <div className={appStyle.app} id={containerElementId} >
                            {children}
                        </div> :
                        <div className={appStyle.app} id={containerElementId} dangerouslySetInnerHTML={{__html: contentText}}/>
                }
                {(stateText) ? <script dangerouslySetInnerHTML={{ __html: stateText }} /> : null}
                {(scripts && scripts.length) ? scripts.map(function(script, i) {
                    return <script key={i} src={script} />
                }) : null}
            </body>
        </html>
    )
}

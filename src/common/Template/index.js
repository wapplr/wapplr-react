import React, {useEffect} from "react";
import style from "wapplr/dist/common/template/template_css.js";
import WapplrLogo from "../Logo";

export default function Template (props) {

    const {wapp, children, footerMenu = [{name: "HOME", href:"/"}, {name: "404", href:"/404"}, {name: "500", href:"/500"}, {name: "EXTERNAL", href:"https://google.com", target:"_blank"}], Logo = WapplrLogo} = props;
    const {styles} = wapp;
    const {siteName = "Wapplr"} = wapp.settings;
    const copyright = `${siteName} ${new Date().getFullYear()} ©`;

    styles.use(style);

    useEffect(function (){
        window.addEventListener("scroll", function (e) {
            const header = document.querySelector("." + style.header);
            header.classList.toggle(style.sticky, window.scrollY > 0 )
        })
    }, [])

    const renderedLogo = Logo({wapp});

    return (
        <div className={style.page}>
            <header className={style.header}>
                <div className={style.innerHeader}>
                    <div className={style.logo}>
                        {renderedLogo}
                    </div>
                </div>
            </header>
            <main className={style.content}>{children}</main>
            <footer className={style.footer}>
                <div>
                    <div className={style.menu}>
                        {[...footerMenu.map(function (menu, key) {
                            const target = menu.target || "self";
                            const noreferrer = (target === "_blank") ? "noreferrer" : null;
                            return <div key={key}><a className={style.button} target={target} href={menu.href} rel={noreferrer}>{menu.name}</a></div>
                        })]}
                    </div>
                    <div className={style.copyright}>
                        {copyright}
                    </div>
                </div>
            </footer>
        </div>
    )
}

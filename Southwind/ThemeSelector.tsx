import { faPalette } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect } from "react";
import { NavDropdown } from 'react-bootstrap';

const BOOTSWATCH_THEMES = [
    "cerulean", "cosmo", "cyborg", "darkly", "flatly", "journal",
    "litera", "lumen", "lux", "materia", "minty", "morph", "pulse",
    "quartz", "sandstone", "simplex", "sketchy", "slate", "solar",
    "spacelab", "superhero", "united", "vapor", "yeti", "zephyr"
];

const BOOTSWATCH_VERSION = "5.3.3";
function setBootswatchTheme(theme: string) {

    const id = "bootswatch-theme-css";
    // Dev mode style injected by Vite
    const devTheme = document.querySelector<HTMLStyleElement>(
        'style[data-vite-dev-id*="custom.scss"]'
    );

    // Build mode style link
    const buildTheme = document.querySelector<HTMLLinkElement>(
        'link[href*="theme-"][href$=".css"]'
    );

    let existing = document.getElementById(id) as HTMLLinkElement | null;

    if (theme) {
        if (devTheme) {
            devTheme.disabled = true;
        }
        if (buildTheme) {
            buildTheme.disabled = true;
        }

        if (!existing) {
            existing = document.createElement("link");
            existing.id = id;
            existing.rel = "stylesheet";

            if (devTheme && devTheme.parentNode) {
                devTheme.parentNode.insertBefore(existing, devTheme.nextSibling);
            } else {
                document.head.appendChild(existing);
            }
        }

        existing.href = `https://cdn.jsdelivr.net/npm/bootswatch@${BOOTSWATCH_VERSION}/dist/${theme}/bootstrap.min.css`;
    } else {
        // setting back to default
        if (existing) existing.remove();

        if (devTheme) devTheme.disabled = false;   // re-enable dev style
        if (buildTheme) buildTheme.disabled = false; // re-enable build style
    }
}

export function ThemeSelector() {
    const [bootswatchTheme, setBootswatchThemeState] = React.useState(localStorage.getItem("bootswatch-theme") || "");

    useEffect(() => {
        setBootswatchTheme(bootswatchTheme || "");
    }, [bootswatchTheme]);

    const handleSelectBootswatch = (theme: string) => {
        setBootswatchTheme(theme);
        setBootswatchThemeState(theme);
        localStorage.setItem("bootswatch-theme", theme);
    };

    return (
        <div style={{ display: "flex", alignItems: "center" }}>
        <NavDropdown title={<> <FontAwesomeIcon icon={faPalette} /> {bootswatchTheme ? (bootswatchTheme.firstUpper()) : "Default"}</>}>
                <NavDropdown.Item
                    active={bootswatchTheme === ""}
                    onClick={() => handleSelectBootswatch("")}
                >
                    Default Bootstrap
                </NavDropdown.Item>
                {BOOTSWATCH_THEMES.map(theme => (
                    <NavDropdown.Item
                        key={theme}
                        active={bootswatchTheme === theme}
                        onClick={() => handleSelectBootswatch(theme)}
                  >
                    {(theme.firstUpper())}
                    </NavDropdown.Item>
                ))}
            </NavDropdown>
        </div>
    );
};

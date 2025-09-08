import { faPalette } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import { NavDropdown } from "react-bootstrap";

const BOOTSWATCH_THEMES: Record<string, "light" | "dark"> = {
  cerulean: "light",
  cosmo: "light",
  cyborg: "dark",
  darkly: "dark",
  flatly: "light",
  journal: "light",
  litera: "light",
  lumen: "light",
  lux: "light",
  materia: "light",
  minty: "light",
  morph: "light",
  pulse: "light",
  quartz: "light",
  sandstone: "light",
  simplex: "light",
  sketchy: "light",
  slate: "dark",
  solar: "dark",
  spacelab: "light",
  superhero: "dark",
  united: "light",
  vapor: "dark",
  yeti: "light",
  zephyr: "light"
};

const BOOTSWATCH_VERSION = "5.3.3";
const THEME_LINK_ID = "bootswatch-theme-css";

function setBootswatchTheme(theme: string) {
  // Dev mode style injected by Vite
  const devTheme = document.querySelector<HTMLStyleElement>(
    'style[data-vite-dev-id*="custom.scss"]'
  );
  // Build mode style link
  const buildTheme = document.querySelector<HTMLLinkElement>(
    'link[href*="theme-"][href$=".css"]'
  );

  // Reset to default (no bootswatch theme)
  if (!theme) {
    document.querySelectorAll(`link#${THEME_LINK_ID}`).forEach(el => el.remove());
    if (devTheme) devTheme.disabled = false;
    if (buildTheme) buildTheme.disabled = false;
    return;
  }


  if (devTheme) devTheme.disabled = true;
  if (buildTheme) buildTheme.disabled = true;

  const url = `https://cdn.jsdelivr.net/npm/bootswatch@${BOOTSWATCH_VERSION}/dist/${theme}/bootstrap.min.css`;

  // Preload first
  const preload = document.createElement("link");
  preload.rel = "stylesheet";
  preload.href = url;

  preload.onload = () => {
    // remove old theme
    document.querySelectorAll(`link#${THEME_LINK_ID}`).forEach(el => el.remove());

    // apply new theme
    const link = document.createElement("link");
    link.id = THEME_LINK_ID;
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);

    preload.remove();
  };

  preload.onerror = () => {
    console.error(`Failed to load theme ${theme}`);
    preload.remove();
  };

  document.head.appendChild(preload);
}

export function ThemeSelector() {
  const [bootswatchTheme, setBootswatchThemeState] = React.useState(
    localStorage.getItem("bootswatch-theme") || ""
  );

  useEffect(() => {
    setBootswatchTheme(bootswatchTheme);
  }, [bootswatchTheme]);

  const handleSelectBootswatch = (theme: string) => {
    setBootswatchThemeState(theme);
    var mode = BOOTSWATCH_THEMES[theme] ?? "light";
    window.dispatchEvent(new CustomEvent("change-theme-mode", {detail: mode }))
    localStorage.setItem("bootswatch-theme", theme);
  };

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <NavDropdown
        title={
          <>
            <FontAwesomeIcon icon={faPalette} />{" "}
            {bootswatchTheme
              ? bootswatchTheme.firstUpper()
              : "Default"}
          </>
        }
      >
        <NavDropdown.Item
          active={bootswatchTheme === ""}
          onClick={() => handleSelectBootswatch("")}
        >
          Default Bootstrap
        </NavDropdown.Item>
        {Object.keys(BOOTSWATCH_THEMES).map((theme) => (
          <NavDropdown.Item
            key={theme}
            active={bootswatchTheme === theme}
            onClick={() => handleSelectBootswatch(theme)}
          >
            {theme.firstUpper()}
          </NavDropdown.Item>
        ))}
      </NavDropdown>
    </div>
  );
}


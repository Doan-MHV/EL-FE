"use client";

import {
  Experimental_CssVarsProvider as CssVarsProvider,
  experimental_extendTheme as extendTheme,
} from "@mui/material/styles";
import { PropsWithChildren, useMemo } from "react";

function ThemeProvider(props: PropsWithChildren<{}>) {
  const theme = useMemo(() => extendTheme(), []);

  return (
    <CssVarsProvider theme={theme} defaultMode="system">
      {props.children}
    </CssVarsProvider>
  );
}

export default ThemeProvider;

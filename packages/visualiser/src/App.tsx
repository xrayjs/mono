import type { Component } from "solid-js";
import { TokenProvider } from "./context/TokenContext";
import { AppShell } from "./components/layout/AppShell";
import { DropZone } from "./components/upload/DropZone";
import { TokenExplorer } from "./components/explorer/TokenExplorer";

const App: Component = () => {
  return (
    <TokenProvider>
      <DropZone>
        <AppShell>
          <TokenExplorer />
        </AppShell>
      </DropZone>
    </TokenProvider>
  );
};

export default App;

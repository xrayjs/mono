import type { ParentComponent } from "solid-js";
import { Header } from "./Header";
import { CodePanel } from "./CodePanel";

export const AppShell: ParentComponent = (props) => {
  return (
    <div class="h-screen bg-neutral-50 flex flex-col overflow-hidden">
      <Header />
      <div class="flex-1 flex min-h-0">
        {/* Code panel (left side) */}
        <CodePanel />
        {/* Preview panel (right side) */}
        <main class="flex-1 overflow-auto p-6 bg-neutral-50">
          {props.children}
        </main>
      </div>
    </div>
  );
};

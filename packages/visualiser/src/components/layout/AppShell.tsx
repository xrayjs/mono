import type { ParentComponent } from "solid-js";
import { Header } from "./Header";

export const AppShell: ParentComponent = (props) => {
  return (
    <div class="min-h-screen bg-neutral-50 flex flex-col">
      <Header />
      <main class="flex-1 overflow-auto p-6">
        {props.children}
      </main>
    </div>
  );
};

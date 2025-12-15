import {
  type ParentComponent,
  createSignal,
  onMount,
  onCleanup,
  Show,
} from "solid-js";
import { useTokens } from "../../context/TokenContext";

export const DropZone: ParentComponent = (props) => {
  const { loadFile } = useTokens();
  const [isDragging, setIsDragging] = createSignal(false);
  let dragCounter = 0;

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter++;

    if (e.dataTransfer?.types.includes("Files")) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter--;

    if (dragCounter === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter = 0;
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file) return;

    // Check if it's a JSON file
    if (file.type === "application/json" || file.name.endsWith(".json")) {
      await loadFile(file);
    }
  };

  onMount(() => {
    document.addEventListener("dragenter", handleDragEnter);
    document.addEventListener("dragleave", handleDragLeave);
    document.addEventListener("dragover", handleDragOver);
    document.addEventListener("drop", handleDrop);
  });

  onCleanup(() => {
    document.removeEventListener("dragenter", handleDragEnter);
    document.removeEventListener("dragleave", handleDragLeave);
    document.removeEventListener("dragover", handleDragOver);
    document.removeEventListener("drop", handleDrop);
  });

  return (
    <>
      {props.children}
      <Show when={isDragging()}>
        <div class="fixed inset-0 z-50 bg-blue-500/10 backdrop-blur-sm flex items-center justify-center">
          <div class="bg-white rounded-xl shadow-2xl p-12 text-center border-2 border-dashed border-blue-400">
            <div class="text-6xl mb-4">📁</div>
            <h2 class="text-2xl font-semibold text-neutral-900 mb-2">
              Drop your token file
            </h2>
            <p class="text-neutral-500">Accepts .json and .tokens.json files</p>
          </div>
        </div>
      </Show>
    </>
  );
};

/**
 * Example tokens loaded by default when no file is provided.
 * Based on the DTCG token format.
 */
export const exampleTokens = {
  colors: {
    $type: "color" as const,
    $description: "Brand color palette",
    primary: {
      $value: {
        colorSpace: "srgb" as const,
        components: [0.2, 0.4, 1] as [number, number, number],
      },
      $description: "Primary brand color",
    },
    secondary: {
      $value: {
        colorSpace: "oklch" as const,
        components: [0.7, 0.15, 280] as [number, number, number],
      },
      $description: "Secondary brand color",
    },
    accent: {
      $value: {
        colorSpace: "srgb" as const,
        components: [0.95, 0.3, 0.4] as [number, number, number],
      },
      $description: "Accent color for highlights",
    },
    neutral: {
      $description: "Neutral grayscale colors",
      100: {
        $value: {
          colorSpace: "srgb" as const,
          components: [0.95, 0.95, 0.95] as [number, number, number],
        },
      },
      200: {
        $value: {
          colorSpace: "srgb" as const,
          components: [0.9, 0.9, 0.9] as [number, number, number],
        },
      },
      300: {
        $value: {
          colorSpace: "srgb" as const,
          components: [0.8, 0.8, 0.8] as [number, number, number],
        },
      },
      500: {
        $value: {
          colorSpace: "srgb" as const,
          components: [0.5, 0.5, 0.5] as [number, number, number],
        },
      },
      700: {
        $value: {
          colorSpace: "srgb" as const,
          components: [0.3, 0.3, 0.3] as [number, number, number],
        },
      },
      900: {
        $value: {
          colorSpace: "srgb" as const,
          components: [0.1, 0.1, 0.1] as [number, number, number],
        },
      },
    },
    semantic: {
      $description: "Semantic colors for UI feedback",
      success: {
        $value: {
          colorSpace: "srgb" as const,
          components: [0.2, 0.7, 0.4] as [number, number, number],
        },
      },
      warning: {
        $value: {
          colorSpace: "srgb" as const,
          components: [0.95, 0.7, 0.2] as [number, number, number],
        },
      },
      error: {
        $value: {
          colorSpace: "srgb" as const,
          components: [0.9, 0.25, 0.2] as [number, number, number],
        },
      },
      info: {
        $value: {
          colorSpace: "srgb" as const,
          components: [0.2, 0.6, 0.9] as [number, number, number],
        },
      },
    },
  },
};

export type ExampleTokens = typeof exampleTokens;

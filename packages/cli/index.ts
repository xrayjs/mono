#!/usr/bin/env node

/**
 * DTCG Design Tokens CLI
 * Validate design token files against the W3C DTCG specification
 */

import * as p from "@clack/prompts";
import chalk from "chalk";
import {
  readFileSync,
  existsSync,
  statSync,
  readdirSync,
  watch,
} from "node:fs";
import { resolve, relative, extname, join } from "node:path";
import {
  validateTokenJSON,
  type ValidationResult,
  type ValidationError,
} from "@xray/validator";

// Parse CLI arguments
const args = process.argv.slice(2);
const flags = {
  help: args.includes("--help") || args.includes("-h"),
  watch: args.includes("--watch") || args.includes("-w"),
  json: args.includes("--json"),
  quiet: args.includes("--quiet") || args.includes("-q"),
};
const paths = args.filter((arg) => !arg.startsWith("-"));

function printHelp(): void {
  console.log(`
${chalk.bold("dtcg-validate")} - Validate DTCG design token files

${chalk.bold("Usage:")}
  dtcg-validate <file|directory> [options]

${chalk.bold("Options:")}
  -h, --help     Show this help message
  -w, --watch    Watch files for changes
  -q, --quiet    Only show errors, no success messages
  --json         Output results as JSON

${chalk.bold("Examples:")}
  dtcg-validate tokens.json
  dtcg-validate ./tokens/
  dtcg-validate tokens.json --watch
  dtcg-validate ./tokens/ --json
`);
}

function formatPath(filePath: string): string {
  return chalk.cyan(relative(process.cwd(), filePath) || filePath);
}

function formatError(error: ValidationError, filePath: string): string {
  const path =
    error.path.length > 0
      ? chalk.yellow(error.path.join("."))
      : chalk.dim("(root)");
  const code = chalk.dim(`[${error.code}]`);
  const message = error.message;

  return `  ${chalk.red("✖")} ${path} ${code}\n    ${message}`;
}

function formatWarning(warning: ValidationError): string {
  const path =
    warning.path.length > 0
      ? chalk.yellow(warning.path.join("."))
      : chalk.dim("(root)");
  const message = warning.message;

  return `  ${chalk.yellow("⚠")} ${path}\n    ${message}`;
}

function printResult(filePath: string, result: ValidationResult): void {
  if (flags.json) {
    return; // JSON output is handled separately
  }

  if (result.valid) {
    if (!flags.quiet) {
      const tokenCount = result.tokens.size;
      const groupCount = result.groups.size;
      console.log(
        `${chalk.green("✓")} ${formatPath(filePath)} ${chalk.dim(`(${tokenCount} tokens, ${groupCount} groups)`)}`
      );

      if (result.warnings.length > 0) {
        console.log(chalk.yellow(`  ${result.warnings.length} warning(s):`));
        for (const warning of result.warnings) {
          console.log(formatWarning(warning));
        }
      }
    }
  } else {
    console.log(`${chalk.red("✖")} ${formatPath(filePath)}`);
    console.log(chalk.red(`  ${result.errors.length} error(s):`));
    for (const error of result.errors) {
      console.log(formatError(error, filePath));
    }

    if (result.warnings.length > 0) {
      console.log(chalk.yellow(`  ${result.warnings.length} warning(s):`));
      for (const warning of result.warnings) {
        console.log(formatWarning(warning));
      }
    }
  }
}

function isTokenFile(filePath: string): boolean {
  // Only match files that are explicitly token files
  return (
    filePath.endsWith(".tokens") ||
    filePath.endsWith(".tokens.json") ||
    filePath.endsWith(".tokens5.json")
  );
}

function findTokenFiles(dirPath: string): string[] {
  const files: string[] = [];

  function walk(dir: string): void {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (
        entry.isDirectory() &&
        !entry.name.startsWith(".") &&
        entry.name !== "node_modules"
      ) {
        walk(fullPath);
      } else if (entry.isFile() && isTokenFile(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  walk(dirPath);
  return files;
}

function validateFile(filePath: string): ValidationResult | null {
  try {
    const content = readFileSync(filePath, "utf-8");
    return validateTokenJSON(content);
  } catch (err) {
    const error = err as Error;
    console.log(`${chalk.red("✖")} ${formatPath(filePath)}`);
    console.log(`  ${chalk.red("Error reading file:")} ${error.message}`);
    return null;
  }
}

interface ValidationSummary {
  total: number;
  passed: number;
  failed: number;
  warnings: number;
  results: Array<{ file: string; result: ValidationResult }>;
}

function validateFiles(filePaths: string[]): ValidationSummary {
  const summary: ValidationSummary = {
    total: filePaths.length,
    passed: 0,
    failed: 0,
    warnings: 0,
    results: [],
  };

  for (const filePath of filePaths) {
    const result = validateFile(filePath);
    if (result) {
      printResult(filePath, result);
      summary.results.push({ file: filePath, result });

      if (result.valid) {
        summary.passed++;
      } else {
        summary.failed++;
      }
      summary.warnings += result.warnings.length;
    } else {
      summary.failed++;
    }
  }

  return summary;
}

function printSummary(summary: ValidationSummary): void {
  if (flags.json) {
    const jsonOutput = {
      summary: {
        total: summary.total,
        passed: summary.passed,
        failed: summary.failed,
        warnings: summary.warnings,
      },
      files: summary.results.map(({ file, result }) => ({
        file: relative(process.cwd(), file),
        valid: result.valid,
        errors: result.errors,
        warnings: result.warnings,
        tokenCount: result.tokens.size,
        groupCount: result.groups.size,
      })),
    };
    console.log(JSON.stringify(jsonOutput, null, 2));
    return;
  }

  if (summary.total > 1 || flags.quiet) {
    console.log();
    if (summary.failed === 0) {
      console.log(
        chalk.green.bold(`✓ All ${summary.total} file(s) valid`) +
          (summary.warnings > 0
            ? chalk.yellow(` (${summary.warnings} warning(s))`)
            : "")
      );
    } else {
      console.log(
        chalk.red.bold(`✖ ${summary.failed}/${summary.total} file(s) invalid`) +
          (summary.warnings > 0
            ? chalk.yellow(` (${summary.warnings} warning(s))`)
            : "")
      );
    }
  }
}

async function watchFiles(filePaths: string[]): Promise<void> {
  const directories = new Set<string>();

  for (const filePath of filePaths) {
    const dir = resolve(filePath, "..");
    directories.add(dir);
  }

  p.intro(chalk.bgCyan.black(" DTCG Validator "));
  console.log(
    chalk.dim(`Watching ${filePaths.length} file(s) for changes...\n`)
  );
  console.log(chalk.dim("Press Ctrl+C to stop\n"));

  // Initial validation
  validateFiles(filePaths);

  // Set up watchers
  for (const dir of directories) {
    watch(dir, { recursive: true }, (eventType, filename) => {
      if (filename && isTokenFile(filename)) {
        const fullPath = join(dir, filename);
        if (existsSync(fullPath)) {
          console.log(
            chalk.dim(`\n--- ${new Date().toLocaleTimeString()} ---\n`)
          );
          const result = validateFile(fullPath);
          if (result) {
            printResult(fullPath, result);
          }
        }
      }
    });
  }

  // Keep process alive
  await new Promise(() => {});
}

async function main(): Promise<void> {
  if (flags.help) {
    printHelp();
    process.exit(0);
  }

  if (paths.length === 0) {
    // Interactive mode
    p.intro(chalk.bgCyan.black(" DTCG Validator "));

    const input = await p.text({
      message: "Enter file or directory path to validate:",
      placeholder: "./tokens.json",
      validate: (value) => {
        if (!value) return "Please enter a path";
        if (!existsSync(value)) return "Path does not exist";
        return undefined;
      },
    });

    if (p.isCancel(input)) {
      p.cancel("Cancelled");
      process.exit(0);
    }

    paths.push(input);
  }

  // Resolve all paths to files
  const filesToValidate: string[] = [];

  for (const inputPath of paths) {
    const resolvedPath = resolve(inputPath);

    if (!existsSync(resolvedPath)) {
      console.log(chalk.red(`Error: Path does not exist: ${inputPath}`));
      process.exit(1);
    }

    const stat = statSync(resolvedPath);

    if (stat.isDirectory()) {
      const files = findTokenFiles(resolvedPath);
      if (files.length === 0) {
        console.log(
          chalk.yellow(`Warning: No token files found in ${inputPath}`)
        );
      }
      filesToValidate.push(...files);
    } else if (stat.isFile()) {
      filesToValidate.push(resolvedPath);
    }
  }

  if (filesToValidate.length === 0) {
    console.log(chalk.red("Error: No token files to validate"));
    process.exit(1);
  }

  if (flags.watch) {
    await watchFiles(filesToValidate);
  } else {
    if (!flags.json && !flags.quiet) {
      p.intro(chalk.bgCyan.black(" DTCG Validator "));
    }

    const summary = validateFiles(filesToValidate);
    printSummary(summary);

    process.exit(summary.failed > 0 ? 1 : 0);
  }
}

main().catch((err) => {
  console.error(chalk.red("Fatal error:"), err);
  process.exit(1);
});

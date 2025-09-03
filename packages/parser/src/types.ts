import type { MyceliaGraph, RenderableTree, TagRegistry } from '@mycelia/core';

/**
 * Parser configuration options
 */
export interface ParserConfig {
  registry?: TagRegistry;
  contentGlob?: string;
  outputPath?: string;
  generateIds?: boolean;
  preserveSource?: boolean;
}

/**
 * Result from parsing operation with dual outputs
 */
export interface ParseResult {
  graph: MyceliaGraph;
  renderTree: RenderableTree;
  errors: ParseError[];
  warnings: string[];
}

/**
 * Parse error with source location
 */
export interface ParseError {
  message: string;
  file: string;
  line?: number;
  column?: number;
  severity: 'error' | 'warning';
}

/**
 * Parser interface that all parsers must implement
 */
export interface Parser {
  parse(files: string[] | string, config?: ParserConfig): Promise<ParseResult>;
  parseContent(content: string, filename: string, config?: ParserConfig): Promise<ParseResult>;
}
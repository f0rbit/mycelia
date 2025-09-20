import type { MyceliaGraph, TagRegistry } from '@mycelia/core';

/**
 * Parser configuration options
 */
export interface ParserConfig {
  registry?: TagRegistry;
  content_glob?: string;
  output_path?: string;
  generate_ids?: boolean;
  preserve_source?: boolean;
}

/**
 * Simplified result from parsing operation - graph only
 */
export interface ParseResult {
  graph: MyceliaGraph;
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
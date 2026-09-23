import React from 'react';

function cleanBoldText(text: string): string {
  return text
    .replace(/\r?\n+/g, ' ')
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanNonBoldText(text: string): string {
  return text
    .replace(/\r?\n+/g, ' ')
    .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/(^|\s)#+\s+/g, '$1')
    .replace(/(^|\s)>\s*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1') // single asterisk italic *italic* -> italic
    .replace(/_([^_]+)_/g, '$1')   // single underscore italic _italic_ -> italic
    .replace(/[*_]/g, '')          // strip any stray leftover asterisks or underscores
    .replace(/\s+/g, ' ');
}

/**
 * Parses basic inline markdown (specifically **bold** or __bold__) in blog excerpts,
 * truncates the visible text to `maxLength`, closes any open <strong> tags properly if
 * truncated mid-bold, and strips other markdown syntax (links, headers, etc.) to plain text.
 */
export function renderExcerpt(rawText: string | undefined | null, maxLength: number = 100): React.ReactNode {
  if (!rawText) return null;

  // 1. Normalize __bold__ to **bold** first (before splitting)
  const normalized = rawText.replace(/__([^_]+)__/g, '**$1**');

  // 2. Tokenize by **bold** pattern BEFORE running any other markdown cleanup regexes
  const parts = normalized.split(/(\*\*[^*]+\*\*)/g);

  let visibleChars = 0;
  const nodes: React.ReactNode[] = [];
  let isTruncated = false;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    const isBold = /^\*\*([^*]+)\*\*$/.test(part);
    const textContent = isBold
      ? cleanBoldText(part.slice(2, -2))
      : cleanNonBoldText(part);

    if (!textContent) continue;

    if (visibleChars >= maxLength) {
      isTruncated = true;
      break;
    }

    if (visibleChars + textContent.length > maxLength) {
      const remaining = maxLength - visibleChars;
      const truncatedText = textContent.slice(0, remaining);
      visibleChars += remaining;
      isTruncated = true;

      if (isBold) {
        nodes.push(<strong key={i}>{truncatedText}</strong>);
      } else {
        nodes.push(truncatedText);
      }
      break;
    } else {
      visibleChars += textContent.length;
      if (isBold) {
        nodes.push(<strong key={i}>{textContent}</strong>);
      } else {
        nodes.push(textContent);
      }
    }
  }

  // Calculate total visible length across all tokens
  const totalVisibleLen = parts.reduce((acc, part) => {
    if (!part) return acc;
    const isBold = /^\*\*([^*]+)\*\*$/.test(part);
    const textContent = isBold
      ? cleanBoldText(part.slice(2, -2))
      : cleanNonBoldText(part);
    return acc + textContent.length;
  }, 0);

  if (totalVisibleLen > maxLength || isTruncated) {
    nodes.push('...');
  }

  return <>{nodes}</>;
}

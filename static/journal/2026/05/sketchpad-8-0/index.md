---
title: "Sketchpad 8.0"
date: "2026-05-04"
draft: true
categories:
  - "apps"
tags:
  - "drawing-app"
  - "sketchpad"
coverImage: "images/placeholder.svg"
excerpt: "A cleaner, faster Sketchpad built around the way people actually make things."
---

<script>
	import { PullQuote, Divider } from '@goobits/blog/ui/elements'
</script>

Sketchpad 8.0 is the largest platform update we have made in years.

It is not a flashy release built around one new button. Most of the work is deeper than that: cleaner vector import and export, faster brushes, better document management, stronger geometry tools, and a more durable foundation for saving and syncing artwork.

The goal is simple: Sketchpad should feel lighter when you draw, more predictable when you edit, and safer when your document gets big.

<PullQuote>Sketchpad should feel lighter when you draw, more predictable when you edit, and safer when your document gets big.</PullQuote>

<Divider>Vector work</Divider>

SVG, PDF, and JSON document exchange have been rebuilt around a cleaner vector IO foundation. That means imported artwork should retain more of what makes it useful: gradients, masks, filters, transforms, patterns, `<use>` references, and viewport behavior.

PDF import and export also get a stronger vector-first path. Clipart conversion is cleaner, and the document model is better prepared for richer vector authoring inside Sketchpad itself.

This is the less glamorous part of a drawing app, but it matters. If a file comes in cleaner, it is easier to trust. If it exports cleaner, it is easier to keep working somewhere else.

<Divider>Shape editing</Divider>

Sketchpad 8.0 adds a new PathOps geometry layer powered by a Skia-based WASM runtime.

That gives us a much better base for boolean vector operations: union, cut, merge, split, silhouette, and batch cleanup workflows. These are the kinds of operations that need to be boringly reliable. If you are editing SVGs or complex clipart, the geometry should do what you expect instead of falling apart at the edges.

<Divider>Drawing feel</Divider>

Brush rendering has been reworked to do less unnecessary work.

Strokes now benefit from incremental processing, smoother Chaikin handling, partial texture uploads, render coalescing, and per-stroke canvas caching. In practice, that means drawing should feel steadier, especially with larger documents or repeated strokes.

This also improves brush outlines, compound paths, spraypaint behavior, airbrush spacing, stamp consistency, and GPU-backed rendering.

<PullQuote>The best performance work is the kind you stop noticing.</PullQuote>

<Divider>Documents</Divider>

The document picker needed attention. Large libraries should not feel slow or fragile.

The new picker supports virtualized grids, faster image thumbnails, cached thumbnail metadata, search, sort, multi-select, range selection, marquee selection, keyboard navigation, trash, and better mobile/touch behavior.

It is also more polished: better contrast, cleaner menus, more predictable rename behavior, and selection that feels less surprising.

<Divider>Assets and foundations</Divider>

The asset pipeline is easier to extend now. Sketchpad 8.0 adds WebGradients and mshr stacked-gradient imports, cleaner gradient parsing, better asset catalog modeling, and a modernized asset factory.

That gives us a better path for shared palettes, presets, gradients, clipart, and reusable visual resources.

Some of the most important work in 8.0 is infrastructure: filesystem hardening, storage migration prep, non-blocking JSON save/export, online backup service foundations, and early sync/storage work.

Most of that is invisible when things are working. That is the point. Saving, restoring, exporting, and backing up documents should become more dependable over time.

Sketchpad 8.0 also cleans up package boundaries and platform infrastructure, including new vector IO and SVG package boundaries, account/session groundwork, license service foundations, and server workspace cleanup.

Those changes make the codebase easier to evolve. They also set up the next wave of Sketchpad work without turning every new feature into a fight with old assumptions.

<Divider>Next</Divider>

Sketchpad has always lived between drawing app, design tool, classroom utility, and creative playground. Version 8.0 keeps that spirit, but gives the platform a stronger frame underneath it.

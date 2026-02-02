#!/usr/bin/env node
/**
 * Remove (near) white backgrounds by turning them transparent.
 *
 * Usage:
 *   node scripts/remove-white-bg.js input.png [output.png] [--threshold 20] [--feather 10] [--decontaminate 1]
 *
 * Notes:
 * - Designed for sprites with a solid/near-solid white background.
 * - Uses a threshold + feather to avoid jagged edges on anti-aliased pixels.
 * - Optionally "decontaminates" edge colors to avoid white halos when composited.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import process from 'node:process';

function printUsageAndExit(exitCode = 1) {
  // Keep this concise; it’s a CLI helper.
  // eslint-disable-next-line no-console
  console.log(
    [
      'Remove white background (make transparent).',
      '',
      'Usage:',
      '  node scripts/remove-white-bg.js <input.png> [output.png] [--threshold 20] [--feather 10] [--decontaminate 1]',
      '',
      'Options:',
      '  --threshold  <0..255>  How close to white counts as background (default: 20)',
      '  --feather    <0..255>  Soft edge band beyond threshold (default: 10)',
      '  --decontaminate <0|1>  Remove white spill from semi-transparent edges (default: 1)',
    ].join('\n'),
  );
  process.exit(exitCode);
}

function parseArgs(argv) {
  const positional = [];
  const opts = { threshold: 20, feather: 10, decontaminate: 1 };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) {
      positional.push(a);
      continue;
    }

    const key = a.slice(2);
    const value = argv[i + 1];
    if (value == null || value.startsWith('--')) printUsageAndExit(1);

    if (key === 'threshold') {
      opts.threshold = Number(value);
      i++;
      continue;
    }
    if (key === 'feather') {
      opts.feather = Number(value);
      i++;
      continue;
    }
    if (key === 'decontaminate') {
      opts.decontaminate = Number(value);
      i++;
      continue;
    }

    printUsageAndExit(1);
  }

  if (!Number.isFinite(opts.threshold) || opts.threshold < 0 || opts.threshold > 255) {
    // eslint-disable-next-line no-console
    console.error('Invalid --threshold. Expected number 0..255.');
    process.exit(1);
  }
  if (!Number.isFinite(opts.feather) || opts.feather < 0 || opts.feather > 255) {
    // eslint-disable-next-line no-console
    console.error('Invalid --feather. Expected number 0..255.');
    process.exit(1);
  }
  if (![0, 1].includes(opts.decontaminate)) {
    // eslint-disable-next-line no-console
    console.error('Invalid --decontaminate. Expected 0 or 1.');
    process.exit(1);
  }

  return { positional, opts };
}

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

function clamp255(n) {
  return Math.max(0, Math.min(255, n));
}

function alphaForDistanceToWhite(distance, threshold, feather) {
  // distance: 0 means pure white. Larger means farther from white.
  // If within threshold -> fully transparent (alpha 0).
  // If between threshold and threshold+feather -> ramp alpha from 0..1.
  // Else -> keep fully opaque (alpha 1).
  if (distance <= threshold) return 0;
  if (feather <= 0) return 1;
  if (distance >= threshold + feather) return 1;
  return clamp01((distance - threshold) / feather);
}

async function main() {
  const { positional, opts } = parseArgs(process.argv.slice(2));
  const input = positional[0];
  if (!input) printUsageAndExit(1);

  const output =
    positional[1] ??
    path.join(path.dirname(input), `${path.basename(input, path.extname(input))}.transparent.png`);

  const inputBuf = await fs.readFile(input);
  const image = sharp(inputBuf, { failOn: 'none' }).ensureAlpha();

  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  if (info.channels !== 4) {
    // eslint-disable-next-line no-console
    console.error(`Unexpected channel count: ${info.channels}. Expected 4 (RGBA).`);
    process.exit(1);
  }

  const out = Buffer.from(data); // copy
  const { threshold, feather, decontaminate } = opts;

  for (let i = 0; i < out.length; i += 4) {
    const r = out[i];
    const g = out[i + 1];
    const b = out[i + 2];
    const a = out[i + 3];

    // Skip already-transparent pixels.
    if (a === 0) continue;

    // Euclidean distance to white in RGB space.
    const dr = 255 - r;
    const dg = 255 - g;
    const db = 255 - b;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

    const keepAlphaFactor = alphaForDistanceToWhite(dist, threshold, feather);
    if (keepAlphaFactor === 1) continue;

    // Multiply alpha by the keep factor (0..1) to preserve antialiased edges.
    const newA = Math.round(a * keepAlphaFactor);
    out[i + 3] = newA;

    // Remove white spill from edge pixels so they don't halo when composited.
    // Assumes the original background was white (255,255,255) and the pixel was a mix:
    //   observed = subject * alpha + white * (1 - alpha)
    // Solve for subject (approx):
    //   subject = (observed - white * (1 - alpha)) / alpha
    if (decontaminate === 1 && newA > 0 && newA < 255) {
      const alpha = newA / 255;
      const inv = 1 - alpha;
      out[i] = clamp255((r - 255 * inv) / alpha);
      out[i + 1] = clamp255((g - 255 * inv) / alpha);
      out[i + 2] = clamp255((b - 255 * inv) / alpha);
    }
  }

  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(output);

  // eslint-disable-next-line no-console
  console.log(`Wrote: ${output}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err?.stack || err);
  process.exit(1);
});

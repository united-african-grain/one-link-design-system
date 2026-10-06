/**
 * Where a field was read from (M3.ING.06): EvidenceViewer outlines regions over the image, and FieldCheck names its
 * middle column and reports the field being looked at. Read from the components' source, like the other component tests.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const COMPONENTS = join(fileURLToPath(new URL('..', import.meta.url)), 'project/components');
const read = (p) => readFileSync(join(COMPONENTS, p), 'utf8');

describe('[M3.ING.06] where a field was read from', () => {
  test('[M3.ING.06] regions follow the image through zoom and letterbox, the active one solid, and without regions the frame is as before', () => {
    const src = read('records/EvidenceViewer.jsx');
    assert.match(src, /src && regions && regions\.length \?/, 'regions are drawn only when given');
    assert.match(src, /viewBox=\{`0 0 \$\{natural\.w\} \$\{natural\.h\}`\} preserveAspectRatio="xMidYMid meet"/, 'the outline uses the image\'s own size and its contain fit');
    assert.match(src, /strokeOpacity=\{on \? 1 : 0\.35\}/, 'the active region is solid, the rest faint');
    assert.match(src, /stroke="var\(--content-accent-brand\)"/, 'a token colour, never a literal');
    assert.match(src, /\) : src \? \(\s*<img src=\{src\} alt=\{alt\} draggable=\{false\} style=\{\{ display: 'block', width: `\$\{level \* 100\}%`/, 'without regions the image is drawn as before');
  });

  test('[M3.ING.06] FieldCheck names its reading column and tells the screen which field is looked at', () => {
    const src = read('records/FieldCheck.jsx');
    assert.match(src, /readLabel = 'Read from slip'/);
    assert.equal((src.match(/\{readLabel\}/g) ?? []).length, 2, 'the head and the stacked label both use it');
    assert.match(src, /onMouseEnter=\{onFieldFocus \? \(\) => onFieldFocus\(f\.key\) : undefined\} onFocus=\{onFieldFocus \? \(\) => onFieldFocus\(f\.key\) : undefined\}/);
  });
});

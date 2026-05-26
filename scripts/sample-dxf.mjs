import { writeFileSync } from 'node:fs';
import { deriveParams } from '../src/geneva/params.ts';
import { buildWheelProfile, buildCrankProfile } from '../src/geneva/geometry.ts';
import { profilesToDxf } from '../src/geneva/exporters/dxf.ts';

const params = deriveParams({ mode: 'b', b: 55, n: 6, p: 4, t: 0.1 });
const dxf = profilesToDxf([buildWheelProfile(params), buildCrankProfile(params)]);
writeFileSync('sample.dxf', dxf);
console.log('Wrote sample.dxf');

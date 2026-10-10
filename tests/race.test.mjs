import test from 'node:test';
import assert from 'node:assert/strict';
import {transition} from '../lib/race.ts';
const a={pageid:1,title:'Start'},b={pageid:2,title:'Zwischenziel'},z={pageid:3,title:'Ziel'};
test('Start, Wechsel, Zurück und wiederholte Besuche',()=>{let s=transition(a,[a],[a],b,0,3);assert.equal(s.clicks,1);s=transition(b,s.path,s.stack,a,s.clicks,3,true);assert.equal(s.clicks,2);assert.deepEqual(s.path,[a,b,a]);assert.deepEqual(s.stack,[a]);s=transition(a,s.path,s.stack,z,s.clicks,3);assert.equal(s.clicks,3);assert.equal(s.won,true)});
test('Gleiche ID / Weiterleitung ist kein Artikelwechsel',()=>{const s=transition(a,[a],[a],{...a,title:'Alias'},0,3);assert.equal(s.changed,false);assert.equal(s.clicks,0);assert.deepEqual(s.path,[a])});
test('Zielerkennung anhand der ID statt Titel',()=>{const s=transition(a,[a],[a],{...z,title:'Anderer Titel'},0,3);assert.equal(s.won,true)});

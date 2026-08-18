#!/usr/bin/env node
/* Lists every media slot the site references and whether a file exists yet. */
import fs from 'node:fs';
import path from 'node:path';
import { services } from './services.js';
import { home, about, servicesIndex, team, gallery } from './pages.js';

const slots = new Set(['hero', 'og']);

const add = (value) => value && slots.add(value);

add(home.hero.media);
add(home.intro.figure.media);
home.pillars.items.forEach((item) => add(item.media));
add('team-teaser');

add(about.hero.media);
add(about.story.figure.media);
add('about-fleet');

add(servicesIndex.hero.media);
add(team.hero.media);
team.members.forEach((member) => add(member.media));
gallery.items.forEach((item) => add(item.media));
add('contact-map');

services.forEach((service) => {
  add(service.media.hero);
  service.media.gallery.forEach(add);
});

const dir = path.join(process.cwd(), 'public', 'media');
const existing = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
const has = (name) => existing.some((file) => file.replace(/\.[^.]+$/, '') === name);

const list = [...slots].sort();
const missing = list.filter((name) => !has(name));

console.log(`\nMedia slots: ${list.length} total · ${list.length - missing.length} filled · ${missing.length} waiting\n`);
list.forEach((name) => console.log(`  ${has(name) ? '✓' : '·'}  ${name}`));
console.log(`\nDrop files into public/media/ named <slot>.<webp|avif|jpg|png|svg|mp4>\n`);

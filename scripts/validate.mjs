import fs from 'node:fs';
import path from 'node:path';
import { load } from 'cheerio';

const root = path.resolve('_site');
const read = name => JSON.parse(fs.readFileSync(`src/_data/${name}.json`, 'utf8'));
const site = read('site');
const pages = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const filename = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(filename);
    else if (filename.endsWith('.html')) pages.push(filename);
  }
}
walk(root);
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const idCache = new Map();
let checkedLinks = 0;
for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  const $ = load(html);
  const relative = path.relative(root, file);
  check($('h1').length === 1, `${relative}: expected one H1`);
  check(!!$('title').text().trim(), `${relative}: missing title`);
  check(!!$('meta[name="description"]').attr('content'), `${relative}: missing description`);
  check($('html').attr('lang') === 'en', `${relative}: missing English language`);
  check($('main').length === 1, `${relative}: missing main landmark`);
  const navigation = $('.primary-nav a').map((_, node) => $(node).attr('href')).get();
  check(JSON.stringify(navigation) === JSON.stringify(site.navigation.map(item => item.url)), `${relative}: navigation differs from the original nine tabs`);
  const ids = $('[id]').map((_, node) => $(node).attr('id')).get();
  check(new Set(ids).size === ids.length, `${relative}: duplicate IDs`);
  check(!$('iframe,form[action],input[type="email"]').length, `${relative}: unexpected external service or submission form`);
  check(!/mailto:|[\w.+-]+@[\w.-]+\.[a-z]{2,}/i.test(html), `${relative}: unobfuscated email address`);
  $('img').each((_, node) => {
    check(!!$(node).attr('alt')?.trim(), `${relative}: image without alternative text`);
    check($(node).attr('src')?.startsWith('/assets/'), `${relative}: image is not local`);
  });
  $('a[href],img[src],script[src],link[href]').each((_, node) => {
    const value = $(node).attr('href') ?? $(node).attr('src');
    if (!value || value.startsWith('tel:')) return;
    check(!/^javascript:/i.test(value), `${relative}: unsafe URL`);
    if (/^https?:\/\//.test(value)) {
      if (node.name === 'img' || node.name === 'script' || (node.name === 'link' && $(node).attr('rel') === 'stylesheet')) check(false, `${relative}: remote runtime asset`);
      return;
    }
    const url = new URL(value, `https://kiwi-biolab.org/${relative.replace(/index\.html$/, '')}`);
    let target = path.join(root, decodeURIComponent(url.pathname));
    if (url.pathname.endsWith('/')) target = path.join(target, 'index.html');
    check(fs.existsSync(target), `${relative}: broken local link ${value}`);
    if (url.hash && fs.existsSync(target) && target.endsWith('.html')) {
      if (!idCache.has(target)) {
        const doc = load(fs.readFileSync(target, 'utf8'));
        idCache.set(target, new Set(doc('[id]').map((_, el) => doc(el).attr('id')).get()));
      }
      check(idCache.get(target).has(decodeURIComponent(url.hash.slice(1))), `${relative}: missing fragment ${value}`);
    }
    checkedLinks++;
  });
}
for (const [name, minimum] of [['events', 11], ['news', 39], ['talks', 14], ['taskForces', 4], ['publications', 43]]) {
  const data = read(name);
  check(data.length >= minimum, `${name}: migrated records missing (expected at least ${minimum})`);
  check(new Set(data.map(item => item.id)).size === data.length, `${name}: duplicate record IDs`);
  for (const record of data) {
    check(!!record.source, `${name}: record ${record.id} has no source`);
    for (const key of ['body', 'intro', 'citation']) if (record[key]) {
      const fragment = load(record[key]);
      check(!fragment('script,style,iframe,form,input').length, `${name}/${record.id}: unsafe or obsolete markup`);
      check(!/zoom\.us|zoom\.[a-z]+\/|mailto:/i.test(record[key]), `${name}/${record.id}: expired meeting or email link`);
    }
  }
}
for (const [route, anchors] of Object.entries(read('legacyAnchors'))) {
  const doc = load(fs.readFileSync(path.join(root, route, 'index.html'), 'utf8'));
  const ids = new Set(doc('[id]').map((_, el) => doc(el).attr('id')).get());
  for (const anchor of anchors) check(ids.has(anchor), `Missing original section anchor ${route}#${anchor}`);
}
const dois = read('publications').map(item => item.doi?.toLowerCase()).filter(Boolean);
check(new Set(dois).size === dois.length, 'Duplicate publication DOIs');
for (const force of read('taskForces')) check(force.body.length > 100, `Missing expanded task-force content: ${force.id}`);
check(read('team').groups.reduce((n, group) => n + group.members.length, 0) === 22, 'Original team roster incomplete');
check(read('team').former.length === 5, 'Former-member roster incomplete');
for (const item of site.navigation) check(fs.existsSync(path.join(root, item.url, 'index.html')), `Missing route ${item.url}`);
check(fs.readFileSync('_site/CNAME', 'utf8').trim() === 'kiwi-biolab.org', 'Custom domain changed');
check(fs.existsSync('_site/.nojekyll'), 'Missing .nojekyll');
check(fs.existsSync('_site/sitemap.xml') && fs.existsSync('_site/robots.txt'), 'Missing discovery files');
check(fs.existsSync(path.join(root, site.logo)), 'Missing user-provided logo');
check(site.logo.endsWith('/kiwi-biolab-logo.png'), 'User-provided logo is not selected');
for (const asset of read('assetCredits')) if (asset.available !== false) check(fs.existsSync(asset.path), `Missing credited asset ${asset.path}`);
if (errors.length) {
  console.error(errors.map(error => `✗ ${error}`).join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Validated ${pages.length} HTML pages and ${checkedLinks} local links/assets.`);
  console.log('PASS: routes, navigation, anchors, metadata, accessible images, content migration, DOI uniqueness, email obfuscation, original logo, and Pages artifact.');
}

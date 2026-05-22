import {execFileSync} from 'node:child_process';
import {existsSync, readdirSync, readFileSync, statSync} from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const textExtensions = new Set(['.css', '.html', '.js', '.md']);
const ignoredDirs = new Set(['.git', 'node_modules']);
const errors = [];

function walk(dir) {
    const entries = readdirSync(dir, {withFileTypes: true});
    const files = [];

    for (const entry of entries) {
        if (ignoredDirs.has(entry.name)) continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...walk(fullPath));
        } else if (textExtensions.has(path.extname(entry.name))) {
            files.push(fullPath);
        }
    }

    return files;
}

function relative(file) {
    return path.relative(root, file);
}

function checkExists(ref, source) {
    if (!ref || ref.startsWith('http') || ref.startsWith('data:') || ref.startsWith('#')) return;
    if (ref === 'url' || ref.startsWith('var(') || ref.startsWith('linear-gradient(')) return;
    if (ref.includes('${')) return;

    const cleanRef = ref.split('?')[0].replace(/[;,]$/, '');
    const candidates = [
        path.join(root, cleanRef),
        path.join(root, 'cozy-glade', cleanRef),
    ];

    if (!candidates.some(existsSync)) {
        errors.push(`${relative(source)} references missing file: ${ref}`);
    }
}

function findInlineHandlers(text) {
    const handlers = [];
    const attrRegex = /\son[a-z]+\s*=\s*["']([^"']+)["']/gi;
    let attrMatch;

    while ((attrMatch = attrRegex.exec(text)) !== null) {
        handlers.push(attrMatch[1]);
    }

    const scriptCallRegex = /<script>\s*([A-Za-z_$][\w$]*)\s*\(/g;
    let scriptMatch;

    while ((scriptMatch = scriptCallRegex.exec(text)) !== null) {
        handlers.push(scriptMatch[1] + '(');
    }

    return handlers;
}

function checkAppSyntax() {
    try {
        execFileSync(process.execPath, ['--check', 'app.js'], {
            cwd: root,
            stdio: 'pipe',
        });
    } catch (error) {
        errors.push(`app.js failed syntax check:\n${error.stderr?.toString() || error.message}`);
    }
}

function checkReferences(files) {
    const refPatterns = [
        /\bloadMarkdown(?:Mobile|FromSearch)?\('([^']+)'\)/g,
        /\bsrc="([^"]+)"/g,
        /^image:\s*([^\n]+)/gm,
        /<!--\s*cover:\s*([^-\n][\s\S]*?)\s*-->/g,
        /url\(['"]?([^'")]+\.(?:png|jpe?g|gif|webp|svg))['"]?\)/g,
    ];

    for (const file of files) {
        const text = readFileSync(file, 'utf8');
        for (const pattern of refPatterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const ref = match[1].trim();
                if (ref === 'season') continue;
                checkExists(ref, file);
            }
        }
    }
}

function checkInlineHandlers(files) {
    const appJs = readFileSync(path.join(root, 'app.js'), 'utf8');
    const definedFunctions = new Set(
        [...appJs.matchAll(/\b(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/g)].map(match => match[1])
    );
    const allowedGlobals = new Set(['document', 'event']);

    for (const file of files) {
        const text = readFileSync(file, 'utf8');
        for (const handler of findInlineHandlers(text)) {
            const calls = [...handler.matchAll(/(?:^|[^\w$.])([A-Za-z_$][\w$]*)\s*\(/g)].map(match => match[1]);
            for (const call of calls) {
                if (allowedGlobals.has(call)) continue;
                if (!definedFunctions.has(call)) {
                    errors.push(`${relative(file)} calls undefined inline handler: ${call}()`);
                }
            }
        }
    }
}

function checkMovedMoodboard() {
    const moodboardDir = path.join(root, 'cozy-glade/img/moodboard');
    if (!existsSync(moodboardDir) || !statSync(moodboardDir).isDirectory()) {
        errors.push('cozy-glade/img/moodboard is missing');
    }
}

const files = walk(root);
checkAppSyntax();
checkReferences(files);
checkInlineHandlers(files);
checkMovedMoodboard();

if (errors.length > 0) {
    console.error(`Smoke check failed with ${errors.length} issue${errors.length === 1 ? '' : 's'}:\n`);
    for (const error of errors) {
        console.error(`- ${error}`);
    }
    process.exit(1);
}

console.log('Smoke check passed.');

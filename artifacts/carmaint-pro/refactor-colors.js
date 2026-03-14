const fs = require('fs');

const srcDir = 'd:/مشروع موقع متابعة سائق/Asset-Manager/artifacts/carmaint-pro/src';

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(srcDir);
let changedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Headings and general text
    content = content.replace(/\btext-white\b/g, 'text-foreground');
    content = content.replace(/\btext-slate-200\b/g, 'text-foreground');
    content = content.replace(/\btext-slate-300\b/g, 'text-foreground');
    content = content.replace(/\btext-slate-400\b/g, 'text-muted-foreground');
    content = content.replace(/\btext-slate-500\b/g, 'text-muted-foreground');
    content = content.replace(/\btext-gray-400\b/g, 'text-muted-foreground');
    content = content.replace(/\btext-gray-300\b/g, 'text-foreground');
    
    // Backgrounds
    content = content.replace(/\bbg-slate-800\b/g, 'bg-card border border-border');
    content = content.replace(/\bbg-slate-900\b/g, 'bg-background');
    content = content.replace(/\bbg-slate-950\b/g, 'bg-background');
    content = content.replace(/\bbg-slate-700\b/g, 'bg-muted border border-border');
    content = content.replace(/\bbg-white\/5\b/g, 'bg-black\/5');
    content = content.replace(/\bbg-white\/10\b/g, 'bg-black\/10');
    content = content.replace(/\bbg-white\/20\b/g, 'bg-black\/20');
    
    // Borders
    content = content.replace(/\bborder-white\/10\b/g, 'border-black\/10');
    content = content.replace(/\bborder-white\/20\b/g, 'border-black\/20');
    content = content.replace(/\bborder-slate-800\b/g, 'border-border');
    content = content.replace(/\bborder-slate-700\b/g, 'border-border');

    // Restore text-white for solid buttons 
    // We do a simple pass: if the line contains bg-primary, bg-emerald, bg-destructive, bg-amber, bg-secondary,
    // we replace text-foreground back to text-white just on that line.
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const solidBgs = ['bg-primary', 'bg-secondary', 'bg-destructive', 'bg-emerald', 'bg-amber', 'bg-blue', 'bg-red'];
        if (solidBgs.some(bg => lines[i].includes(bg))) {
            lines[i] = lines[i].replace(/\btext-foreground\b/g, 'text-white');
        }
    }
    content = lines.join('\n');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        changedCount++;
    }
});
console.log(`Updated ${changedCount} files.`);

import * as fs from 'fs';
import * as os from 'os';

const RESERVED_FIELDS = [
    'marker_bit',
    'reserved',
    'reserved_bits'
];

interface Structure {
    name: string;
    elements: Element[];
    emittedFields: string[];
}

type Element = Field | While | If | Compound | For;

interface For {
    type: 'for';
    expression: string;
    body: Compound;
}

interface Field {
    type: 'field';
    name: string;
    bits: number;
    mnemonic: string;
}

interface While {
    type: 'while';
    expression: string;
    body: Compound;
}

interface If {
    type: 'if';
    expression: string;
    body: Compound;
    else?: Compound | If;
}

interface Compound {
    type: 'compound';
    elements: Element[];
}

function parseWhile(lines: string[]): While {
    let [ _, expression ] = /^while \((.*)\) \{$/.exec(lines.shift());
    let element: While = {
        type: 'while',
        expression,
        body: { type: 'compound', elements: [] },
    };

    while (lines.length > 0) {
        if (lines[0] === '}') {
            lines.shift();
            break;
        }
        element.body.elements.push(parseElement(lines));
    }

    return element;
}

function parseFor(lines: string[]): For {
    let [ _, expression ] = /^for \((.*)\) \{$/.exec(lines.shift());
    let element: For = {
        type: 'for',
        expression,
        body: { type: 'compound', elements: [] },
    };

    while (lines.length > 0) {
        if (lines[0] === '}') {
            lines.shift();
            break;
        }
        element.body.elements.push(parseElement(lines));
    }

    console.log(`FOR REMAINING:`);
    console.dir(lines);
    return element;
}

function parseIf(lines: string[]): If {
    let [ _, expression ] = /^if \((.*)\) \{$/.exec(lines.shift());
    let element: If = {
        type: 'if',
        expression,
        body: { type: 'compound', elements: [] },
        else: undefined
    };

    while (lines.length > 0) {
        if (lines[0] === '}') {
            lines.shift();
            break;
        }
        element.body.elements.push(parseElement(lines));
    }

    if (lines[0] === 'else {') {
        let body: Compound = { type: 'compound', elements: [] };
        lines.shift();

        while (lines.length > 0) {
            if (lines[0] as string === '}') {
                lines.shift();
                break;
            }
            body.elements.push(parseElement(lines));
        }

        element.else = body;
    } else if (lines[0].startsWith('else if')) {
        let elseLine = lines.shift();
        elseLine.replace(/^else /, '');
        lines.unshift(elseLine);
        element.else = parseIf(lines);
    }

    return element;
}

function tokenize(line: string) {
    let word: string = '';
    let words: string[] = [];
    let quote: string;

    for (let char of line.split('')) {
        if (char === `'`) {
            quote = quote ? undefined : char;
            continue;
        } else if (!quote && char === ' ') {
            words.push(word);
            word = '';
        } else {
            word += char;
        }
    }

    if (word)
        words.push(word);

    return words;
}

function parseElement(lines: string[]): Element {
    let line = lines.shift();
    let words = tokenize(line);
    let name = words[0];



    if (words[words.length - 1] === '{') {
        if (name === 'while') {
            lines.unshift(line);
            return parseWhile(lines);
        } else if (name === 'for') {
            lines.unshift(line);
            return parseFor(lines);
        } else if (name === 'if') {
            lines.unshift(line);
            return parseIf(lines);
        } else {
            throw new Error(`Unknown control structure: ${name}`);
        }
    }

    return <Field>{
        type: 'field', 
        name, 
        bits: Number(words[1]), 
        mnemonic: words[2]
    };
}

function parseStructure(lines: string[]): Structure {
    let line1 = lines.shift();
    let match = /^(.*) ?\(\) \{$/.exec(line1);
    if (!match) {
        throw new Error(`Invalid start of structure: '${line1}'`);
    }

    let struct: Structure = {
        name: match[1],
        elements: [],
        emittedFields: []
    }

    while (lines.length > 0) {
        if (lines[0] === '}') {
            lines.shift();
            break;
        }
        struct.elements.push(parseElement(lines));
    }

    return struct;
}

function emitElement(struct: Structure, element: Element, indent: number): string[] {
    switch (element.type) {
        case 'compound':
            return emitCompound(struct, element, indent);
        case 'field':
            return emitField(struct, element, indent);
        case 'if':
            return emitIf(struct, element, indent);
        case 'while':
            return emitWhile(struct, element, indent);
        case 'for':
            return emitFor(struct, element, indent);
        default:
            element satisfies never;
    }
}

function emitIndent(count: number) {
    return Array(count + 1).join('    ');
}

function emitField(struct: Structure, field: Field, indent: number) {
    let propertyName: string;
    
    if (field.name.startsWith(`'`)) {
        propertyName = `$const`;
    } else {
        propertyName = camelCase(field.name);
    }
    
    let I = emitIndent(indent);

    let outputLines = [];

    let type = 'number';
    let visibility = '';
    let decorator = 'Field';
    let value: string;

    if (field.bits === 1)
        type = 'boolean';

    if (/^[01]+$/.test(propertyName)) {
        visibility = 'private';
        propertyName = '$fixedBits';
        type = '';
        value = `0b${field.name.replace(/ /g, '_')} as const`;
    }

    if (RESERVED_FIELDS.includes(field.name)) {
        visibility = 'private';
        decorator = 'Reserved';
        propertyName = `$${propertyName}`;
    }

    // ---

    if (struct.emittedFields.includes(propertyName)) {
        let number = 2;
        while (struct.emittedFields.includes(`${propertyName}${number}`))
            number += 1;
        propertyName = `${propertyName}${number}`;
    }
    
    if (propertyName.endsWith('()')) {
        propertyName = propertyName.replace(/\(\)$/, '');
        type = upperCamelCase(propertyName);
    }

    //outputLines.push(`${I }/** @see ${field.name} */`);
    outputLines.push(
        `${I }`
        + `@${decorator}(${isNaN(field.bits) ? '' : field.bits}) `
        + `${visibility ? `${visibility} ` : ``}`
        + `${propertyName}` 
        + `${type ? `: ${type}` : ``}`
        + `${value ? ` = ${value}` : ``}`
        + `;`
    );
    //outputLines.push(``);

    struct.emittedFields.push(propertyName);

    return outputLines;
}

function emitIf(struct: Structure, field: If, indent: number) {
    let I = emitIndent(indent);
    let lines: string[] = [];

    lines.push(`${I }// if (${field.expression}) {`);
    lines.push(...emitCompound(struct, field.body, indent + 1));

    if (field.else?.type === 'if') {
        let ifLines = emitIf(struct, field.else, indent);
        ifLines[0] = ifLines[0].replace(/\/\/ /, '// } else ');
        lines.push(...ifLines);
    } else if (field.else?.type === 'compound') {
        lines.push(`${I }// } else {`);
        lines.push(...emitCompound(struct, field.else, indent + 1));
        lines.push(`${I }// }`);
    } else {
        lines.push(`${I }// }`);
    }

    return lines;
}

function emitWhile(struct: Structure, field: While, indent: number) {
    let I = emitIndent(indent);
    let lines: string[] = [];

    lines.push(`${I }// while (${field.expression}) {`);
    lines.push(...emitCompound(struct, field.body, indent + 1));
    lines.push(`${I }// }`);

    return lines;
}

function emitFor(struct: Structure, field: For, indent: number) {
    let I = emitIndent(indent);
    let lines: string[] = [];

    lines.push(`${I }// for (${field.expression}) {`);
    lines.push(...emitCompound(struct, field.body, indent + 1));
    lines.push(`${I }// }`);

    return lines;
}

function emitCompound(struct: Structure, field: Compound, indent: number) {
    let I = emitIndent(indent);
    let lines: string[] = [];

    for (let element of field.elements) {
        lines.push(...emitElement(struct, element, indent));
    }

    return lines;
}

function emitStruct(struct: Structure) {    
    let lines = [
        `import { BitstreamElement, Field, Reserved } from '@astronautlabs/bitstream';`,
        ``
    ];

    let className = upperCamelCase(struct.name);

    lines.push(`/**`);
    lines.push(` * @see ${struct.name}`);
    lines.push(` */`);
    lines.push(`export class ${className} extends BitstreamElement {`);

    for (let element of struct.elements)
        lines.push(...emitElement(struct, element, 1));
    
    lines.push(`}`);

    return lines;
}

function main([ filename ]: string[]) {
    let content = fs.readFileSync('./struct-bitcode.txt');
    let lines = content.toString().split(/\r?\n/).map(x => x.trim()).filter(x => x !== '');
    let struct = parseStructure(lines);

    console.dir(struct, { depth: 100 });

    let outputLines = emitStruct(struct);

    fs.writeFileSync('./src/generated-struct.ts', outputLines.join(os.EOL));
}

function upperCamelCase(str: string) {
    str = camelCase(str);
    str = str[0].toUpperCase() + str.slice(1);
    return str;
}

function camelCase(str: string) {
    str = str.toLowerCase().replace(/[ _-](.)/g, (_, letter: string) => letter.toUpperCase());
    return str;
}

main(process.argv.slice(2));
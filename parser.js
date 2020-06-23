/**
 * Enum for ScanError
 * @readonly
 * @enum {number}
 */
const ScanError = {
    None: 0,
    UnexpectedEndOfString: 1,
    UnexpectedEndOfCommand: 2,
};

/**
 * Enum for SyntaxKind
 * @readonly
 * @enum {number}
 */
const SyntaxKind = {
    Prefix: 1,
    Identifier: 2,
    StringLiteral: 3,
    SemicolonToken: 4,
    PipelineToken: 5,
    RedirectToken: 6,
    Unknown: 7,
    EOC: 8,
};

/**
 * Enum for ParseErrorCode
 * @enum {number}
 */
const ParseErrorCode = {
    UnexpectedEndOfString: 1,
    UnexpectedEndOfCommand: 2,
};

class ParseError {
        /**
     * @type {ParseErrorCode}
     */
    error;

    /**
     * @type {number}
     */
    offset;

    /**
     * @type {number}
     */
    length;
};

export default class Parser {
    /**
     * @type {number}
     */
    static pos;

    /**
     * @type {number}
     */
    static len;

    /**
     * @type {string}
     */
    static text;

    /**
     * @type {SyntaxKind}
     */
    static token;

    /**
     * @type {ScanError}
     */
    static scanError;

    /**
     * method for parse commands
     * @param {string} text command text
     */
    static parse(text) {
        this.pos = 0;
        this.len = text.length;
        this.text = text;
        this.token = SyntaxKind.Unknown;
        this.scanError = ScanError.None;

        const result = [[]];
        let current = 0;

        while (true) {
            this._scanNext();

            // for debug
            // console.log(this.value);

            if (this.scanError !== ScanError.None) {
                throw new Error(this.scanError);
            }

            if (this.token === SyntaxKind.EOC) {
                break;
            }

            switch (this.token) {
            case SyntaxKind.Prefix:
            case SyntaxKind.StringLiteral:
            case SyntaxKind.Identifier:
                result[current].push(this.value);
                break;
            case SyntaxKind.SemicolonToken:
                if (result[current][0].type !== 'stdout') {
                    result[current].unshift({
                        type: 'stdout',
                        content: 'stdout',
                    });
                }
                result.push([]);
                current++;
                break;
            case SyntaxKind.PipelineToken:
                result[current].unshift({
                    type: 'stdout',
                    content: 'pipe',
                });
                result.push([]);
                current++;
                break;
            case SyntaxKind.RedirectToken:
                result[current].unshift({
                    type: 'stdout',
                    content: 'file',
                });
                result.push([]);
                current++;
                result[current].unshift({
                    type: 'stdout',
                    content: 'file',
                });
            }
        }

        if (result[result.length - 1].length === 0) {
            result.pop();
        }

        return result;
    }

    /**
     * @return {SyntaxKind}
     */
    static _scanNext() {
        this.value = '';
        this.scanError = ScanError.None;

        if (this.pos >= this.len) {
            return this.token = SyntaxKind.EOC;
        }

        let ch = this.text.charAt(this.pos);

        if (this._isWhiteSpace(ch)) {
            do {
                this.pos++;
                ch = this.text.charAt(this.pos);
            } while (this._isWhiteSpace(ch));
        }

        const tokenOffset = this.pos;

        switch (ch) {
        case '"':
        case '\'':
        case '`':
            this.value = this._scanString();
            return this.token = SyntaxKind.StringLiteral;
        case process.env.PREFIX:
            this.pos += process.env.PREFIX.length;
            this.value = {
                type: 'prefix',
                content: process.env.PREFIX,
            };
            return this.token = SyntaxKind.Prefix;
        case '\n':
        case ';':
            this.pos++;
            this.value = {
                type: 'semicolon',
                content: ';',
            };
            return this.token = SyntaxKind.SemicolonToken;
        case '|':
            this.pos++;
            this.value = {
                type: 'pipe',
                content: '|',
            };
            return this.token = SyntaxKind.PipelineToken;
        case '>':
            this.pos++;
            this.value = {
                type: 'redirect',
                content: '>',
            };
            return this.token = SyntaxKind.RedirectToken;
        default:
            while (
                this.pos < this.len
                && this._isUnknownContentCharacter(ch)
            ) {
                this.pos++;
                ch = this.text.charAt(this.pos);
            }

            if (tokenOffset !== this.pos) {
                this.value = {
                    type: 'string',
                    content: this.text.substring(tokenOffset, this.pos),
                };
                return this.token = SyntaxKind.Identifier;
            }

            this.value += ch;
            pos++;
            return this.token = SyntaxKind.Unknown;
        }
    }

    /**
     * method for scan string
     * @return {string}
     */
    static _scanString() {
        let result = '';
        let start = this.pos++;
        let quote = null;

        switch (this.text.charAt(start)) {
        case '"':
        case '\'':
            quote = this.text.charAt(start);
            break;
        case '`':
            if (
                this.text.charAt(start + 1) === '`'
                && this.text.charAt(start + 2) === '`'
            ) {
                quote = '```';
            } else {
                quote = '`';
            }
        }

        while (true) {
            if (this.pos >= this.len) {
                result += this.text.substring(start, this.pos);
                this.scanError = ScanError.UnexpectedEndOfString;
                break;
            }

            const ch = this.text.charAt(this.pos);

            if (
                (
                    '"' === quote
                    && ch === '"'
                )
                || (
                    '\'' === quote
                    && ch === '\''
                )
                || (
                    '`' === quote
                    && ch === '`'
                )
                || (
                    '```' === quote
                    && this.text.substring(this.pos, this.pos + 3) === '```'
                )
            ) {
                result += this.text.substring(start + quote.length, (this.pos += quote.length) - quote.length);
                if ('```' === quote) {
                    result = {
                        type: 'codeblock',
                        lang: result.substring(0, (/\n/g.exec(result) || {index: 0}).index),
                        content: result.slice((/\n/g.exec(result) || {index: -1}).index+1),
                    };
                } else {
                    result = {
                        type: 'string',
                        content: result,
                    };
                }
                break;
            }

            if (ch === '\\') {
                result += this.text.substring(start, this.pos++);

                if (this.pos >= this.len) {
                    this.scanError = ScanError.UnexpectedEndOfString;
                    break;
                }

                result += this.text.charAt(this.pos++);

                start = this.pos;
            }

            this.pos++;
        }
        return result;
    }

    /**
     * is ch a white space
     * @param {string} ch
     */
    static _isWhiteSpace(ch) {
        return ch === ' '
            || ch === '\t'
            || ch === '\r';
    }

    /**
     * is ch an unknown content character
     * @param {string} ch
     */
    static _isUnknownContentCharacter(ch) {
        if (this._isWhiteSpace(ch)) {
            return false;
        }
        switch (ch) {
        case '"':
        case '\'':
        case '`':
        case '\n':
        case ';':
        case '|':
        case '>':
            return false;
        }
        return true;
    }
}

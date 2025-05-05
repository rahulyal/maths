import { Vector2D } from "../../schemas/canvas.ts";

interface PathSegment {
  type: "move" | "line" | "curve" | "close";
  points: Vector2D[];
}

interface GlyphPath {
  paths: PathSegment[];
  width: number;
  height: number;
  baseline: number;
}

interface StackedElement {
  paths: string[];
  width: number;
  height: number;
  verticalOffset: number;
}

export class LatexToPath {
  private glyphPaths: Map<string, GlyphPath>;
  private spacingRules = {
    thin: 3,
    medium: 5,
    thick: 8,
    operator: 10,
  };
  private operatorSymbols: Set<string> = new Set();
  private relationSymbols: Set<string> = new Set();
  private openBrackets: Set<string> = new Set();
  private closeBrackets: Set<string> = new Set();

  constructor() {
    this.glyphPaths = new Map();
    this.initializeBasicGlyphs();
    this.initializeSpacingRules();
  }

  private initializeBasicGlyphs() {
    // Numbers 0-9
    this.addGlyph("0", this.createNumber0());
    this.addGlyph("1", this.createNumber1());
    this.addGlyph("2", this.createNumber2());

    // Basic operators
    this.addGlyph("+", this.createPlus());
    this.addGlyph("-", this.createMinus());
    this.addGlyph("=", this.createEquals());
    this.addGlyph("\\times", this.createTimes());
    this.addGlyph("\\div", this.createDivision());

    // Greek letters
    this.addGlyph("\\alpha", this.createAlpha());
    this.addGlyph("\\beta", this.createBeta());
    this.addGlyph("\\pi", this.createPi());

    // Common functions
    this.addGlyph("\\sum", this.createSum());
    this.addGlyph("\\int", this.createIntegral());
    this.addGlyph("\\frac", this.createFraction());
    this.addGlyph("\\sqrt", this.createSquareRoot());

    // Parentheses and brackets
    this.addGlyph("(", this.createLeftParenthesis());
    this.addGlyph(")", this.createRightParenthesis());
    this.addGlyph("[", this.createLeftBracket());
    this.addGlyph("]", this.createRightBracket());

    // English letters
    // Simple letters first
    this.addGlyph("A", {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 20 }],
      }, {
        type: "line",
        points: [{ x: 10, y: 0 }, { x: 20, y: 20 }],
      }, {
        type: "move",
        points: [{ x: 5, y: 10 }],
      }, {
        type: "line",
        points: [{ x: 15, y: 10 }],
      }],
      width: 20,
      height: 20,
      baseline: 20,
    });

    this.addGlyph("E", {
      paths: [{
        type: "move",
        points: [{ x: 20, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 0, y: 0 }, { x: 0, y: 20 }, { x: 20, y: 20 }],
      }, {
        type: "move",
        points: [{ x: 0, y: 10 }],
      }, {
        type: "line",
        points: [{ x: 15, y: 10 }],
      }],
      width: 20,
      height: 20,
      baseline: 20,
    });

    this.addGlyph("F", {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 20 }],
      }, {
        type: "line",
        points: [{ x: 0, y: 0 }, { x: 20, y: 0 }],
      }, {
        type: "move",
        points: [{ x: 0, y: 10 }],
      }, {
        type: "line",
        points: [{ x: 15, y: 10 }],
      }],
      width: 20,
      height: 20,
      baseline: 20,
    });

    this.addGlyph("H", {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 20 }],
      }, {
        type: "line",
        points: [{ x: 0, y: 0 }],
      }, {
        type: "move",
        points: [{ x: 20, y: 20 }],
      }, {
        type: "line",
        points: [{ x: 20, y: 0 }],
      }, {
        type: "move",
        points: [{ x: 0, y: 10 }],
      }, {
        type: "line",
        points: [{ x: 20, y: 10 }],
      }],
      width: 20,
      height: 20,
      baseline: 20,
    });

    this.addGlyph("I", {
      paths: [{
        type: "move",
        points: [{ x: 10, y: 20 }],
      }, {
        type: "line",
        points: [{ x: 10, y: 0 }],
      }, {
        type: "move",
        points: [{ x: 5, y: 20 }],
      }, {
        type: "line",
        points: [{ x: 15, y: 20 }],
      }, {
        type: "move",
        points: [{ x: 5, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 15, y: 0 }],
      }],
      width: 20,
      height: 20,
      baseline: 20,
    });

    this.addGlyph("L", {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 0, y: 20 }, { x: 20, y: 20 }],
      }],
      width: 20,
      height: 20,
      baseline: 20,
    });

    this.addGlyph("M", {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 20 }],
      }, {
        type: "line",
        points: [{ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 20, y: 0 }, {
          x: 20,
          y: 20,
        }],
      }],
      width: 20,
      height: 20,
      baseline: 20,
    });

    this.addGlyph("N", {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 20 }],
      }, {
        type: "line",
        points: [{ x: 0, y: 0 }, { x: 20, y: 20 }, { x: 20, y: 0 }],
      }],
      width: 20,
      height: 20,
      baseline: 20,
    });

    this.addGlyph("O", {
      paths: [{
        type: "move",
        points: [{ x: 10, y: 0 }],
      }, {
        type: "curve",
        points: [
          { x: 20, y: 0 },
          { x: 20, y: 20 },
          { x: 10, y: 20 },
        ],
      }, {
        type: "curve",
        points: [
          { x: 0, y: 20 },
          { x: 0, y: 0 },
          { x: 10, y: 0 },
        ],
      }],
      width: 20,
      height: 20,
      baseline: 20,
    });

    this.addGlyph("P", {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 20 }],
      }, {
        type: "line",
        points: [{ x: 0, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 15, y: 0 }],
      }, {
        type: "curve",
        points: [
          { x: 20, y: 0 },
          { x: 20, y: 10 },
          { x: 15, y: 10 },
        ],
      }, {
        type: "line",
        points: [{ x: 0, y: 10 }],
      }],
      width: 20,
      height: 20,
      baseline: 20,
    });

    this.addGlyph("S", {
      paths: [{
        type: "move",
        points: [{ x: 20, y: 5 }],
      }, {
        type: "curve",
        points: [
          { x: 20, y: 0 },
          { x: 0, y: 0 },
          { x: 0, y: 8 },
        ],
      }, {
        type: "curve",
        points: [
          { x: 0, y: 12 },
          { x: 20, y: 12 },
          { x: 20, y: 16 },
        ],
      }, {
        type: "curve",
        points: [
          { x: 20, y: 20 },
          { x: 0, y: 20 },
          { x: 0, y: 15 },
        ],
      }],
      width: 20,
      height: 20,
      baseline: 20,
    });

    this.addGlyph("T", {
      paths: [{
        type: "move",
        points: [{ x: 10, y: 20 }],
      }, {
        type: "line",
        points: [{ x: 10, y: 0 }],
      }, {
        type: "move",
        points: [{ x: 0, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 20, y: 0 }],
      }],
      width: 20,
      height: 20,
      baseline: 20,
    });

    this.addGlyph("W", {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 5, y: 20 }, { x: 10, y: 10 }, { x: 15, y: 20 }, {
          x: 20,
          y: 0,
        }],
      }],
      width: 20,
      height: 20,
      baseline: 20,
    });

    this.addGlyph("X", {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 20, y: 20 }],
      }, {
        type: "move",
        points: [{ x: 20, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 0, y: 20 }],
      }],
      width: 20,
      height: 20,
      baseline: 20,
    });

    this.addGlyph("Y", {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 10, y: 10 }],
      }, {
        type: "line",
        points: [{ x: 20, y: 0 }],
      }, {
        type: "move",
        points: [{ x: 10, y: 10 }],
      }, {
        type: "line",
        points: [{ x: 10, y: 20 }],
      }],
      width: 20,
      height: 20,
      baseline: 20,
    });

    this.addGlyph("Z", {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 20, y: 0 }, { x: 0, y: 20 }, { x: 20, y: 20 }],
      }],
      width: 20,
      height: 20,
      baseline: 20,
    });
  }

  private initializeSpacingRules() {
    // Define spacing classes for different types of symbols
    this.operatorSymbols = new Set(["+", "-", "\\times", "\\div", "="]);
    this.relationSymbols = new Set(["=", "<", ">", "\\leq", "\\geq"]);
    this.openBrackets = new Set(["(", "[", "\\{"]);
    this.closeBrackets = new Set([")", "]", "\\}"]);
  }

  private createNumber0(): GlyphPath {
    return {
      paths: [{
        type: "move",
        points: [{ x: 10, y: 0 }],
      }, {
        type: "curve",
        points: [
          { x: 15, y: 0 },
          { x: 20, y: 5 },
          { x: 20, y: 10 },
        ],
      }, {
        type: "curve",
        points: [
          { x: 20, y: 15 },
          { x: 15, y: 20 },
          { x: 10, y: 20 },
        ],
      }, {
        type: "curve",
        points: [
          { x: 5, y: 20 },
          { x: 0, y: 15 },
          { x: 0, y: 10 },
        ],
      }, {
        type: "curve",
        points: [
          { x: 0, y: 5 },
          { x: 5, y: 0 },
          { x: 10, y: 0 },
        ],
      }],
      width: 20,
      height: 20,
      baseline: 20,
    };
  }

  private createNumber1(): GlyphPath {
    return {
      paths: [{
        type: "move",
        points: [{ x: 5, y: 20 }],
      }, {
        type: "line",
        points: [{ x: 5, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 0, y: 5 }],
      }],
      width: 10,
      height: 20,
      baseline: 20,
    };
  }

  private createNumber2(): GlyphPath {
    return {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 5 }],
      }, {
        type: "curve",
        points: [
          { x: 0, y: 2 },
          { x: 2, y: 0 },
          { x: 5, y: 0 },
        ],
      }, {
        type: "curve",
        points: [
          { x: 8, y: 0 },
          { x: 10, y: 2 },
          { x: 10, y: 5 },
        ],
      }, {
        type: "curve",
        points: [
          { x: 10, y: 8 },
          { x: 8, y: 10 },
          { x: 0, y: 20 },
        ],
      }, {
        type: "line",
        points: [{ x: 10, y: 20 }],
      }],
      width: 10,
      height: 20,
      baseline: 20,
    };
  }

  private createPlus(): GlyphPath {
    return {
      paths: [{
        type: "move",
        points: [{ x: 10, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 10, y: 20 }],
      }, {
        type: "move",
        points: [{ x: 0, y: 10 }],
      }, {
        type: "line",
        points: [{ x: 20, y: 10 }],
      }],
      width: 20,
      height: 20,
      baseline: 10,
    };
  }

  private createMinus(): GlyphPath {
    return {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 10 }],
      }, {
        type: "line",
        points: [{ x: 20, y: 10 }],
      }],
      width: 20,
      height: 2,
      baseline: 1,
    };
  }

  private createEquals(): GlyphPath {
    return {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 7 }],
      }, {
        type: "line",
        points: [{ x: 20, y: 7 }],
      }, {
        type: "move",
        points: [{ x: 0, y: 13 }],
      }, {
        type: "line",
        points: [{ x: 20, y: 13 }],
      }],
      width: 20,
      height: 6,
      baseline: 10,
    };
  }

  private createTimes(): GlyphPath {
    return {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 20, y: 20 }],
      }, {
        type: "move",
        points: [{ x: 20, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 0, y: 20 }],
      }],
      width: 20,
      height: 20,
      baseline: 10,
    };
  }

  private createDivision(): GlyphPath {
    return {
      paths: [{
        type: "move",
        points: [{ x: 10, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 10, y: 20 }],
      }, {
        type: "move",
        points: [{ x: 5, y: 10 }],
      }, {
        type: "curve",
        points: [
          { x: 5, y: 15 },
          { x: 15, y: 15 },
          { x: 15, y: 10 },
        ],
      }, {
        type: "curve",
        points: [
          { x: 15, y: 5 },
          { x: 5, y: 5 },
          { x: 5, y: 10 },
        ],
      }],
      width: 20,
      height: 20,
      baseline: 10,
    };
  }

  private createIntegral(): GlyphPath {
    return {
      paths: [{
        type: "move",
        points: [{ x: 15, y: 0 }],
      }, {
        type: "curve",
        points: [
          { x: 10, y: 0 },
          { x: 5, y: 5 },
          { x: 5, y: 10 },
        ],
      }, {
        type: "line",
        points: [{ x: 5, y: 30 }],
      }, {
        type: "curve",
        points: [
          { x: 5, y: 35 },
          { x: 0, y: 40 },
          { x: -5, y: 40 },
        ],
      }],
      width: 20,
      height: 40,
      baseline: 35,
    };
  }

  private createPi(): GlyphPath {
    return {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 20, y: 0 }],
      }, {
        type: "move",
        points: [{ x: 5, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 5, y: 20 }],
      }, {
        type: "move",
        points: [{ x: 15, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 15, y: 20 }],
      }],
      width: 20,
      height: 20,
      baseline: 20,
    };
  }

  private createAlpha(): GlyphPath {
    return {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 20 }],
      }, {
        type: "curve",
        points: [
          { x: 5, y: 15 },
          { x: 10, y: 15 },
          { x: 15, y: 20 },
        ],
      }, {
        type: "curve",
        points: [
          { x: 12, y: 10 },
          { x: 10, y: 0 },
          { x: 20, y: 0 },
        ],
      }],
      width: 20,
      height: 20,
      baseline: 20,
    };
  }

  private createBeta(): GlyphPath {
    return {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 25 }],
      }, {
        type: "line",
        points: [{ x: 0, y: 0 }],
      }, {
        type: "curve",
        points: [
          { x: 15, y: 0 },
          { x: 15, y: 10 },
          { x: 0, y: 10 },
        ],
      }, {
        type: "move",
        points: [{ x: 0, y: 10 }],
      }, {
        type: "curve",
        points: [
          { x: 12, y: 10 },
          { x: 12, y: 20 },
          { x: 0, y: 20 },
        ],
      }],
      width: 15,
      height: 25,
      baseline: 20,
    };
  }

  private createSquareRoot(): GlyphPath {
    return {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 10 }],
      }, {
        type: "line",
        points: [{ x: 5, y: 20 }],
      }, {
        type: "line",
        points: [{ x: 10, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 40, y: 0 }],
      }],
      width: 40,
      height: 20,
      baseline: 10,
    };
  }

  private createLeftParenthesis(): GlyphPath {
    return {
      paths: [{
        type: "move",
        points: [{ x: 10, y: 0 }],
      }, {
        type: "curve",
        points: [
          { x: 5, y: 5 },
          { x: 0, y: 10 },
          { x: 0, y: 15 },
        ],
      }, {
        type: "curve",
        points: [
          { x: 0, y: 20 },
          { x: 5, y: 25 },
          { x: 10, y: 30 },
        ],
      }],
      width: 10,
      height: 30,
      baseline: 25,
    };
  }

  private createRightParenthesis(): GlyphPath {
    return {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 0 }],
      }, {
        type: "curve",
        points: [
          { x: 5, y: 5 },
          { x: 10, y: 10 },
          { x: 10, y: 15 },
        ],
      }, {
        type: "curve",
        points: [
          { x: 10, y: 20 },
          { x: 5, y: 25 },
          { x: 0, y: 30 },
        ],
      }],
      width: 10,
      height: 30,
      baseline: 25,
    };
  }

  private createLeftBracket(): GlyphPath {
    return {
      paths: [{
        type: "move",
        points: [{ x: 10, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 0, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 0, y: 30 }],
      }, {
        type: "line",
        points: [{ x: 10, y: 30 }],
      }],
      width: 10,
      height: 30,
      baseline: 25,
    };
  }

  private createRightBracket(): GlyphPath {
    return {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 10, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 10, y: 30 }],
      }, {
        type: "line",
        points: [{ x: 0, y: 30 }],
      }],
      width: 10,
      height: 30,
      baseline: 25,
    };
  }

  private createSum(): GlyphPath {
    return {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 20, y: 0 }],
      }, {
        type: "line",
        points: [{ x: 10, y: 15 }],
      }, {
        type: "line",
        points: [{ x: 20, y: 30 }],
      }, {
        type: "line",
        points: [{ x: 0, y: 30 }],
      }],
      width: 20,
      height: 30,
      baseline: 15,
    };
  }

  private createFraction(): GlyphPath {
    return {
      paths: [{
        type: "move",
        points: [{ x: 0, y: 15 }],
      }, {
        type: "line",
        points: [{ x: 40, y: 15 }],
      }],
      width: 40,
      height: 2,
      baseline: 15,
    };
  }

  private addGlyph(char: string, path: GlyphPath) {
    this.glyphPaths.set(char, path);
  }

  public tokenize(latex: string): string[] {
    // Enhanced tokenization - handle LaTeX commands and complex symbols
    return latex.match(
      /\\[a-zA-Z]+|\\[\{\}]|[a-zA-Z0-9]|[\+\-\*/=\{\}\[\]\(\)]|\s+/g,
    ) || [];
  }

  public getGlyphPath(token: string): GlyphPath | undefined {
    return this.glyphPaths.get(token);
  }

  private handleFraction(
    numerator: string,
    denominator: string,
  ): StackedElement {
    const numPaths = this.generateSVGPath(numerator, 0, 0);
    const denPaths = this.generateSVGPath(denominator, 0, 30); // 30 units below

    // Calculate the widest part
    const numWidth = this.calculateWidth(numerator);
    const denWidth = this.calculateWidth(denominator);
    const width = Math.max(numWidth, denWidth) + 20; // Add padding

    // Center align the numerator and denominator
    const numOffset = (width - numWidth) / 2;
    const denOffset = (width - denWidth) / 2;

    const paths = [
      this.translatePath(
        { type: "move", points: [{ x: 0, y: 15 }] },
        numOffset,
        0,
      ),
      numPaths,
      this.translatePath({ type: "move", points: [{ x: 0, y: 15 }] }, 0, 15),
      `M 0,15 L ${width},15`, // Fraction bar
      this.translatePath(
        { type: "move", points: [{ x: 0, y: 15 }] },
        denOffset,
        30,
      ),
      denPaths,
    ];

    return {
      paths,
      width,
      height: 45, // Total height for fraction
      verticalOffset: 22, // Center point
    };
  }

  private handleSubscript(base: string, sub: string): StackedElement {
    const basePaths = this.generateSVGPath(base, 0, 0);
    const subPaths = this.generateSVGPath(sub, 0, 10); // 10 units below baseline

    const baseWidth = this.calculateWidth(base);

    return {
      paths: [
        basePaths,
        this.translatePath(
          { type: "move", points: [{ x: 0, y: 0 }] },
          baseWidth,
          10,
        ),
        subPaths,
      ],
      width: baseWidth + this.calculateWidth(sub),
      height: 25,
      verticalOffset: 0,
    };
  }

  private handleSuperscript(base: string, sup: string): StackedElement {
    const basePaths = this.generateSVGPath(base, 0, 0);
    const supPaths = this.generateSVGPath(sup, 0, -10); // 10 units above baseline

    const baseWidth = this.calculateWidth(base);

    return {
      paths: [
        basePaths,
        this.translatePath(
          { type: "move", points: [{ x: 0, y: 0 }] },
          baseWidth,
          -10,
        ),
        supPaths,
      ],
      width: baseWidth + this.calculateWidth(sup),
      height: 25,
      verticalOffset: 0,
    };
  }

  private calculateWidth(latex: string): number {
    let width = 0;
    const tokens = this.tokenize(latex);

    for (const token of tokens) {
      const glyph = this.getGlyphPath(token);
      if (glyph) {
        width += glyph.width + 2; // Add standard spacing
      }

      // Add additional spacing based on symbol type
      if (this.operatorSymbols.has(token)) {
        width += this.spacingRules.operator;
      } else if (this.relationSymbols.has(token)) {
        width += this.spacingRules.thick;
      } else if (
        this.openBrackets.has(token) || this.closeBrackets.has(token)
      ) {
        width += this.spacingRules.thin;
      }
    }

    return width;
  }

  public generateSVGPath(latex: string, x = 0, y = 0): string {
    const tokens = this.tokenize(latex);
    let currentX = x;
    const currentY = y;
    let svgPath = "";

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      // Handle fractions
      if (token === "\\frac" && i + 2 < tokens.length) {
        const numerator = tokens[i + 1];
        const denominator = tokens[i + 2];
        const fraction = this.handleFraction(numerator, denominator);
        svgPath += fraction.paths.join(" ");
        currentX += fraction.width;
        i += 2; // Skip the processed tokens
        continue;
      }

      // Handle superscripts
      if (token === "^" && i + 1 < tokens.length) {
        const base = tokens[i - 1];
        const exponent = tokens[i + 1];
        const superscript = this.handleSuperscript(base, exponent);
        svgPath = svgPath.slice(0, -superscript.width) +
          superscript.paths.join(" ");
        currentX += superscript.width;
        i += 1;
        continue;
      }

      const glyph = this.getGlyphPath(token);
      if (glyph) {
        for (const segment of glyph.paths) {
          svgPath += this.translatePath(segment, currentX, currentY);
        }
        currentX += glyph.width;

        // Add appropriate spacing
        if (this.operatorSymbols.has(token)) {
          currentX += this.spacingRules.operator;
        } else if (this.relationSymbols.has(token)) {
          currentX += this.spacingRules.thick;
        } else {
          currentX += this.spacingRules.thin;
        }
      }
    }

    return svgPath;
  }

  private translatePath(
    segment: PathSegment,
    offsetX: number,
    offsetY: number,
  ): string {
    const translatePoint = (p: Vector2D) => `${p.x + offsetX},${p.y + offsetY}`;

    switch (segment.type) {
      case "move":
        return `M ${translatePoint(segment.points[0])} `;
      case "line":
        return `L ${translatePoint(segment.points[0])} `;
      case "curve":
        return `C ${segment.points.map((p) => translatePoint(p)).join(" ")} `;
      case "close":
        return "Z ";
      default:
        return "";
    }
  }
}

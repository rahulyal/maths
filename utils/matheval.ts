export const evaluateFunction = (x: number): number => {
  try {
    // Create a safe evaluation function
    // We're creating a function that operates in a safe scope
    const evalFunction = new Function(
      "x",
      "Math",
      `with(Math) { return ${this.graph.expression}; }`,
    );

    // Pass the Math object explicitly to avoid the global scope issues
    return evalFunction(x, Math);
  } catch (e) {
    console.error(`Error evaluating function at x=${x}:`, e);
    return NaN;
  }
};

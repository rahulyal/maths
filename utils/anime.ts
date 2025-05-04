// utils/anime.ts
import { createTimeline, stagger, Timeline } from "animejs";

/**
 * SVG element interface with positional and style information
 */
export interface SVGElement {
  type: string;
  attributes: Record<string, string>;
  transform?: string;
  parent?: string;
  children?: SVGElement[];
  content?: string;
  id?: string;
}

/**
 * Animation configuration for math elements
 */
export interface AnimationConfig {
  duration: number;
  easing: string;
  delay: unknown; // Changed from specific function type to unknown to handle stagger
  endDelay?: number;
}

// Anime.js types for timeline animations
interface AnimationTarget {
  progress?: number;
  opacity?: number;
  scale?: number;
  index: number;
}

/**
 * Default animation configuration
 */
const DEFAULT_CONFIG: AnimationConfig = {
  duration: 1000,
  easing: "easeOutQuad",
  delay: stagger(80),
};

/**
 * Creates an animation timeline for SVG elements
 */
export function createMathAnimation(
  elements: SVGElement[],
  config: Partial<AnimationConfig> = {},
): Timeline {
  try {
    // Merge with default config
    const fullConfig: AnimationConfig = { ...DEFAULT_CONFIG, ...config };

    // Create a timeline
    const timeline = createTimeline({
      autoplay: false,
      duration: fullConfig.duration * 1.5,
    });

    // Safety check - if no elements, just return empty timeline
    if (!elements || elements.length === 0) {
      console.warn("No elements provided for animation");
      return timeline;
    }

    // Log animation setup
    console.log(`Creating animation for ${elements.length} root elements`);

    // Flatten the SVG structure for animation
    const flatElements = flattenElements(elements);
    console.log(`Flattened to ${flatElements.length} total elements`);

    // Group elements by type for more interesting animations
    const pathElements = flatElements.filter((el) => el.type === "path");
    const textElements = flatElements.filter((el) => el.type === "text");
    const otherElements = flatElements.filter((el) =>
      !["path", "text"].includes(el.type)
    );

    // Log counts
    console.log(
      `Animation targets: ${pathElements.length} paths, ${textElements.length} texts, ${otherElements.length} other elements`,
    );

    // Add animations based on element type
    if (pathElements.length > 0) {
      addPathAnimations(timeline, pathElements, fullConfig);
    }

    if (textElements.length > 0) {
      addTextAnimations(timeline, textElements, fullConfig);
    }

    if (otherElements.length > 0) {
      addElementAnimations(timeline, otherElements, fullConfig);
    }

    return timeline;
  } catch (err) {
    console.error("Error creating animation:", err);
    // Return an empty timeline that won't cause errors
    return createTimeline({ autoplay: false, duration: 1000 });
  }
}

/**
 * Flatten hierarchical elements into a list
 */
function flattenElements(elements: SVGElement[]): SVGElement[] {
  try {
    const result: SVGElement[] = [];

    if (!elements) return result;

    for (const element of elements) {
      if (!element) continue;

      // Ensure element has an ID
      if (!element.id) {
        element.id = `elem-${Math.random().toString(36).substring(2, 9)}`;
      }

      // Add this element
      result.push(element);

      // Recursively add children
      if (element.children && element.children.length > 0) {
        const childElements = flattenElements(element.children);
        result.push(...childElements);
      }
    }

    return result;
  } catch (err) {
    console.error("Error flattening elements:", err);
    return [];
  }
}

/**
 * Add animations for path elements
 */
function addPathAnimations(
  timeline: Timeline,
  elements: SVGElement[],
  config: AnimationConfig,
) {
  try {
    // Create virtual elements for animation
    const targets: AnimationTarget[] = elements.map((_, i) => ({
      progress: 0,
      index: i,
    }));

    // Add animation to timeline
    // Using as any to work around TypeScript type incompatibility
    timeline.add({
      targets,
      progress: 1,
      duration: config.duration,
      easing: config.easing,
      delay: config.delay,
      ...(config.endDelay !== undefined ? { endDelay: config.endDelay } : {}),
    } as any);
  } catch (err) {
    console.error("Error adding path animations:", err);
  }
}

/**
 * Add animations for text elements
 */
function addTextAnimations(
  timeline: Timeline,
  elements: SVGElement[],
  config: AnimationConfig,
) {
  try {
    // Create virtual elements for animation
    const targets: AnimationTarget[] = elements.map((_, i) => ({
      opacity: 0,
      index: i,
    }));

    // Calculate delay based on the config delay
    const delayFunction = (el: AnimationTarget, i: number): number => {
      let baseDelay = 0;

      if (typeof config.delay === "function") {
        try {
          // Try to call the delay function, but handle potential type errors
          baseDelay =
            (config.delay as (el: unknown, i: number, l: number) => number)(
              el,
              i,
              elements.length,
            );
        } catch (_e) {
          // Fallback to a staggered delay
          baseDelay = i * 80;
        }
      } else if (typeof config.delay === "number") {
        baseDelay = config.delay;
      }

      return baseDelay + 200; // Add extra delay for text elements
    };

    // Add to timeline with type assertion to work around type incompatibility
    timeline.add({
      targets,
      opacity: 1,
      duration: config.duration * 0.7,
      easing: "easeInQuad",
      delay: delayFunction,
    } as any);
  } catch (err) {
    console.error("Error adding text animations:", err);
  }
}

/**
 * Add animations for other element types
 */
function addElementAnimations(
  timeline: Timeline,
  elements: SVGElement[],
  config: AnimationConfig,
) {
  try {
    // Create virtual elements for animation
    const targets: AnimationTarget[] = elements.map((_, i) => ({
      scale: 0,
      opacity: 0,
      index: i,
    }));

    // Calculate delay based on the config delay
    const delayFunction = (el: AnimationTarget, i: number): number => {
      let baseDelay = 0;

      if (typeof config.delay === "function") {
        try {
          // Try to call the delay function, but handle potential type errors
          baseDelay =
            (config.delay as (el: unknown, i: number, l: number) => number)(
              el,
              i,
              elements.length,
            );
        } catch (_e) {
          // Fallback to a staggered delay
          baseDelay = i * 80;
        }
      } else if (typeof config.delay === "number") {
        baseDelay = config.delay;
      }

      return baseDelay + 100; // Add extra delay for other elements
    };

    // Add to timeline with type assertion to work around type incompatibility
    timeline.add({
      targets,
      scale: 1,
      opacity: 1,
      duration: config.duration * 0.8,
      easing: "easeOutElastic(1, 0.5)",
      delay: delayFunction,
    } as any);
  } catch (err) {
    console.error("Error adding element animations:", err);
  }
}

/**
 * Animation child type definition
 */
interface AnimationChild {
  animatables?: Array<{
    target: AnimationTarget;
  }>;
}

/**
 * Maps an animation progress to element progress values
 * with safeguards against infinite loops
 */
export function mapAnimationToElements(
  timeline: Timeline,
  elements: SVGElement[],
): Record<string, number> {
  try {
    const progress: Record<string, number> = {};

    // Safety check - if no elements or no timeline, return empty progress
    if (!elements || elements.length === 0 || !timeline) {
      return progress;
    }

    const flatElements = flattenElements(elements);

    // Extract animation values from timeline
    // Access children safely with type check
    const animations: AnimationChild[] = Array.isArray(
        (timeline as unknown as { children?: AnimationChild[] }).children,
      )
      ? (timeline as unknown as { children: AnimationChild[] }).children
      : [];

    // Get the overall timeline progress (from 0 to 1)
    const timelineProgress = Math.min(1, Math.max(0, timeline.progress / 100));

    // Process each animation (limit processing to prevent infinite loops)
    let processedItems = 0;
    const maxProcessItems = 1000; // Safety limit

    animations.forEach((animation) => {
      if (!animation.animatables) return;

      animation.animatables.forEach((a) => {
        if (processedItems > maxProcessItems) return;
        processedItems++;

        const target = a.target;
        if (!target || target.index === undefined) return;

        // Safely access the element
        if (target.index >= 0 && target.index < flatElements.length) {
          const element = flatElements[target.index];
          if (element && element.id) {
            // For path animations
            if (target.progress !== undefined) {
              progress[element.id] = target.progress * timelineProgress;
            } // For opacity animations
            else if (target.opacity !== undefined) {
              progress[element.id] = target.opacity * timelineProgress;
            } // For scale animations (we use only the timelineProgress)
            else {
              progress[element.id] = timelineProgress;
            }
          }
        }
      });
    });

    return progress;
  } catch (err) {
    console.error("Error mapping animation progress:", err);
    // Return empty progress to avoid errors
    return {};
  }
}

import { useEffect, useRef, useCallback, useState } from 'react';
import HanziWriter from 'hanzi-writer';

interface UseHanziWriterOptions {
  character: string;
  width?: number;
  height?: number;
  showOutline?: boolean;
  strokeColor?: string;
  outlineColor?: string;
  drawingColor?: string;
  showHintAfterMisses?: number | false;
  highlightOnComplete?: boolean;
  leniency?: number;
}

export function useHanziWriter(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: UseHanziWriterOptions
) {
  const writerRef = useRef<HanziWriter | null>(null);
  const [isReady, setIsReady] = useState(false);

  const {
    character,
    width = 300,
    height = 300,
    showOutline = true,
    strokeColor = '#3E2723',
    outlineColor = '#E0D5C8',
    drawingColor = '#3E2723',
  } = options;

  // Initialize or update when character changes
  useEffect(() => {
    if (!containerRef.current || !character) return;

    // Clean up previous instance properly
    if (writerRef.current) {
      try {
        writerRef.current.cancelQuiz();
        writerRef.current = null;
      } catch (e) {
        console.warn('Error cleaning up previous writer:', e);
      }
    }
    containerRef.current.innerHTML = '';
    setIsReady(false);

    try {
      const writer = HanziWriter.create(containerRef.current, character, {
        width,
        height,
        padding: 0,
        showOutline,
        strokeColor,
        outlineColor,
        drawingWidth: 6,
        strokeAnimationSpeed: 1,
        delayBetweenStrokes: 300,
        radicalColor: strokeColor,
        showCharacter: true,
      });

      writerRef.current = writer;
      setIsReady(true);
    } catch (e) {
      console.warn(`Failed to create HanziWriter for: ${character}`, e);
    }

    return () => {
      if (writerRef.current) {
        try {
          writerRef.current.cancelQuiz();
        } catch (e) {
          // Ignore errors during cleanup
        }
        writerRef.current = null;
      }
    };
  }, [character, width, height, showOutline, strokeColor, outlineColor, drawingColor]);

  // Animate stroke order
  const animateStroke = useCallback(() => {
    if (!writerRef.current) return;
    writerRef.current.hideCharacter();
    writerRef.current.animateCharacter({
      onComplete: () => {
        // After animation, show the character again
        writerRef.current?.showCharacter();
      },
    });
  }, []);

  // Start quiz
  const startQuiz = useCallback(
    (callbacks: {
      onCorrectStroke?: (data: { strokeNum: number; mistakesOnStroke: number; totalMistakes: number; strokesRemaining: number }) => void;
      onMistake?: (data: { strokeNum: number; mistakesOnStroke: number; totalMistakes: number; strokesRemaining: number }) => void;
      onComplete?: (data: { totalMistakes: number; character: string }) => void;
    }) => {
      if (!writerRef.current) return;
      writerRef.current.hideCharacter();
      writerRef.current.quiz({
        showHintAfterMisses: options.showHintAfterMisses ?? 3,
        highlightOnComplete: options.highlightOnComplete ?? true,
        leniency: options.leniency ?? 1.2,
        onCorrectStroke: callbacks.onCorrectStroke as any,
        onMistake: callbacks.onMistake as any,
        onComplete: callbacks.onComplete as any,
      });
    },
    [options.showHintAfterMisses, options.highlightOnComplete, options.leniency]
  );

  // Reset - show character
  const reset = useCallback(() => {
    if (!writerRef.current) return;
    writerRef.current.showCharacter();
    writerRef.current.showOutline();
    writerRef.current.cancelQuiz();
  }, []);

  return { writer: writerRef.current, isReady, animateStroke, startQuiz, reset };
}

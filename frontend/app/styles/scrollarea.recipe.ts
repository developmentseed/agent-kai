import { defineConfig, defineSlotRecipe } from '@chakra-ui/react';
import { scrollAreaAnatomy } from '@ark-ui/react';

export const scrollAreaRecipe = defineSlotRecipe({
  slots: scrollAreaAnatomy.keys(),
  base: {
    viewport: {
      '&[data-overflow-y], &[data-overflow-x]': {
        maskComposite: 'intersect',
        '--scroll-shadow-size': '2rem',
        '--scroll-shadow-left':
          'linear-gradient(-90deg,#000 calc(100% - var(--scroll-shadow-size)),transparent)',
        '--scroll-shadow-right':
          'linear-gradient(90deg,#000 calc(100% - var(--scroll-shadow-size)),transparent)',
        '--scroll-shadow-top':
          'linear-gradient(0deg,#000 calc(100% - var(--scroll-shadow-size)),transparent)',
        '--scroll-shadow-bottom':
          'linear-gradient(180deg,#000 calc(100% - var(--scroll-shadow-size)),transparent)',
        '&[data-at-left]': {
          '--scroll-shadow-left': 'none'
        },
        '&[data-at-right]': {
          '--scroll-shadow-right': 'none'
        },
        '&[data-at-top]': {
          '--scroll-shadow-top': 'none'
        },
        '&[data-at-bottom]': {
          '--scroll-shadow-bottom': 'none'
        }
      }
    }
  },
  variants: {
    scrollShadow: {
      vertical: {
        viewport: {
          maskImage:
            'var(--scroll-shadow-top), var(--scroll-shadow-bottom), linear-gradient(#000,#000)'
        }
      },
      horizontal: {
        viewport: {
          maskImage:
            'var(--scroll-shadow-left), var(--scroll-shadow-right), linear-gradient(#000,#000)'
        }
      },
      both: {
        viewport: {
          maskImage:
            'var(--scroll-shadow-left), var(--scroll-shadow-right), var(--scroll-shadow-top), var(--scroll-shadow-bottom), linear-gradient(#000,#000)'
        }
      }
    }
  }
});

export const scrollAreaConfig = defineConfig({
  theme: {
    slotRecipes: {
      scrollArea: scrollAreaRecipe
    }
  }
});

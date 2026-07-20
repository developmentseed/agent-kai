import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { fieldAnatomy, dialogAnatomy } from '@ark-ui/react';

import { createColorPalette } from './color-palette';
import { scrollAreaConfig } from './scrollarea.recipe';

const lineHeight = 'calc(0.5rem + 1em)';

const createColorSemanticTokens = (colorName: string) => ({
  [colorName]: {
    contrast: {
      value: { _light: 'white', _dark: 'white' }
    },
    fg: {
      value: {
        _light: `{colors.${colorName}.500}`,
        _dark: `{colors.${colorName}.300}`
      }
    },
    subtle: {
      value: {
        _light: `{colors.${colorName}.100}`,
        _dark: `{colors.${colorName}.900}`
      }
    },
    muted: {
      value: {
        _light: `{colors.${colorName}.200}`,
        _dark: `{colors.${colorName}.800}`
      }
    },
    emphasized: {
      value: {
        _light: `{colors.${colorName}.300}`,
        _dark: `{colors.${colorName}.700}`
      }
    },
    solid: {
      value: {
        _light: `{colors.${colorName}.500}`,
        _dark: `{colors.${colorName}.500}`
      }
    },
    focusRing: {
      value: {
        _light: `{colors.${colorName}.400}`,
        _dark: `{colors.${colorName}.400}`
      }
    }
  }
});

const config = defineConfig({
  globalCss: {
    '*': {
      lineHeight
    }
  },
  theme: {
    tokens: {
      fonts: {
        body: { value: '"Fira Sans", sans-serif' },
        heading: { value: '"Lexend", serif' },
        mono: { value: '"Fira Code", monospace' }
      },
      fontSizes: {
        '2xs': { value: '0.5rem' },
        xs: { value: '0.75rem' },
        sm: { value: '1rem' },
        md: { value: '1.25rem' },
        lg: { value: '1.5rem' },
        xl: { value: '1.75rem' },
        '2xl': { value: '2rem' },
        '3xl': { value: '2.25rem' },
        '4xl': { value: '2.5rem' }
      },
      colors: {
        primary: createColorPalette('#CF3F02'),
        secondary: createColorPalette('#E2C044'),
        basi: createColorPalette('#443F3F'),
        danger: createColorPalette('#A71D31'),
        warning: createColorPalette('#E2C044'),
        success: createColorPalette('#4DA167'),
        info: createColorPalette('#2E86AB'),
        surface: createColorPalette('#FFF')
      }
    },
    textStyles: {
      ...['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'].reduce(
        (acc, size) => ({ ...acc, [size]: { value: { lineHeight } } }),
        {}
      )
    },
    layerStyles: {
      handDrawn: {
        description: 'A hand-drawn style with irregular borders',
        value: {
          borderRadius: '255px 15px 225px 15px/15px 225px 15px 255px'
        }
      }
    },
    semanticTokens: {
      colors: {
        fg: {
          DEFAULT: {
            value: '{colors.basi.500}'
          }
        },
        ...createColorSemanticTokens('primary'),
        ...createColorSemanticTokens('secondary'),
        ...createColorSemanticTokens('basi'),
        ...createColorSemanticTokens('danger'),
        ...createColorSemanticTokens('warning'),
        ...createColorSemanticTokens('success'),
        ...createColorSemanticTokens('info'),
        surface: {
          contrast: {
            value: '{colors.basi.500}'
          },
          solid: { value: '{colors.surface.500}' },
          muted: { value: '{colors.surface.200a}' },
          fg: { value: '{colors.surface.500}' },
          subtle: { value: '{colors.surface.300a}' }
        }
      }
    },
    keyframes: {
      'collapse-width': {
        from: {
          height: 'auto',
          width: 'var(--width)'
        },
        to: {
          height: 'auto',
          width: '0'
        }
      }
    },
    slotRecipes: {
      field: {
        slots: fieldAnatomy.keys(),
        base: {
          label: {
            fontFamily: 'heading',
            fontWeight: 700
          }
        }
      },
      dialog: {
        slots: dialogAnatomy.keys(),
        base: {
          title: {
            fontFamily: 'heading'
          },
          backdrop: {
            bg: 'surface.400a',
            backdropFilter: 'blur(4px)'
          }
        }
      }
    },
    recipes: {
      button: {
        base: {
          fontFamily: 'heading',
          fontWeight: 700,
          colorPalette: 'basi',
          borderRadius: 'lg',
          layerStyle: 'handDrawn'
        },
        variants: {
          size: {
            sm: { height: '1.5rem', fontSize: 'xs', minW: 6 },
            md: { height: '2rem', fontSize: 'sm', minW: 8 },
            lg: { height: '2.5rem', fontSize: 'sm' },
            xl: { height: '3rem', fontSize: 'sm' }
          },
          variant: {
            'soft-outline': {
              borderWidth: '2px',
              borderColor: 'colorPalette.muted',
              color: 'colorPalette.fg',
              // On why use '&:hover' instead of '_hover':
              // https://github.com/chakra-ui/chakra-ui/issues/9039#issuecomment-2603014975
              '&::not([disabled])': {
                '&:hover': {
                  bg: 'colorPalette.subtle'
                },
                _expanded: {
                  bg: 'colorPalette.subtle'
                },
                '&:active': {
                  bg: 'colorPalette.emphasized'
                }
              }
            },
            outline: {
              borderWidth: '2px',
              borderColor: 'colorPalette.solid'
            }
          }
        }
      },
      heading: {
        base: {
          fontWeight: 700
        }
      },
      input: {
        variants: {
          size: {
            sm: { '--input-height': 'sizes.6', textStyle: 'xs' },
            md: { '--input-height': 'sizes.8', textStyle: 'sm' },
            lg: { '--input-height': 'sizes.10', textStyle: 'sm' },
            xl: { '--input-height': 'sizes.12', textStyle: 'md' }
          }
        }
      },
      badge: {
        base: {
          fontFamily: 'heading',
          fontWeight: 700,
          colorPalette: 'basi'
        },
        variants: {
          variant: {
            solid: {
              bg: 'colorPalette.400a',
              color: 'colorPalette.contrast'
            }
          }
        }
      }
    }
  }
});

export default createSystem(defaultConfig, config, scrollAreaConfig);

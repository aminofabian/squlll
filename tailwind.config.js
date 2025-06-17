module.exports = {
  // ... existing config
  theme: {
    extend: {
      colors: {
        'custom-blue': '#246a59',
      },
      // Add custom text stroke utilities
      textStroke: {
        '1': '1px',
        '2': '2px',
        '3': '3px',
      }
    }
  },
  plugins: [
    // Add this plugin for text stroke
    function({ addUtilities }) {
      const newUtilities = {
        '.text-stroke-1': {
          '-webkit-text-stroke': '1px currentColor',
          '-webkit-text-fill-color': 'transparent',
        },
        '.text-stroke-2': {
          '-webkit-text-stroke': '2px currentColor',
          '-webkit-text-fill-color': 'transparent',
        },
        '.text-stroke-white': {
          '-webkit-text-stroke': '2px white',
          '-webkit-text-fill-color': 'transparent',
        },
        '.text-stroke-black': {
          '-webkit-text-stroke': '2px black',
          '-webkit-text-fill-color': 'transparent',
        }
      }
      addUtilities(newUtilities)
    }
  ]
} 
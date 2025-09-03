import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				surface: {
					DEFAULT: 'hsl(var(--surface))',
					foreground: 'hsl(var(--surface-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					border: 'hsl(var(--sidebar-border))'
				},
				canvas: 'hsl(var(--canvas-background))',
				panel: 'hsl(var(--panel-background))',
				glass: {
					bg: 'var(--glass-bg)',
					border: 'var(--glass-border)'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-accent': 'var(--gradient-accent)',
				'gradient-surface': 'var(--gradient-surface)'
			},
			boxShadow: {
				'sm': 'var(--shadow-sm)',
				'md': 'var(--shadow-md)', 
				'lg': 'var(--shadow-lg)',
				'xl': 'var(--shadow-xl)',
				'glow': 'var(--shadow-glow)'
			},
			spacing: {
				'xs': 'var(--spacing-xs)',
				'sm': 'var(--spacing-sm)',
				'md': 'var(--spacing-md)',
				'lg': 'var(--spacing-lg)',
				'xl': 'var(--spacing-xl)',
				'2xl': 'var(--spacing-2xl)'
			},
			transitionDuration: {
				'fast': 'var(--transition-fast)',
				'normal': 'var(--transition-normal)',
				'slow': 'var(--transition-slow)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
          "glow": {
            "0%, 100%": { "box-shadow": "0 0 20px hsl(var(--primary) / 0.3)" },
            "50%": { "box-shadow": "0 0 40px hsl(var(--primary) / 0.6)" }
          },
          "shimmer": {
            "0%": { "background-position": "-200% 0" },
            "100%": { "background-position": "200% 0" }
          },
          "bounce-gentle": {
            "0%, 100%": { "transform": "translateY(0)" },
            "50%": { "transform": "translateY(-10px)" }
          },
          "rotate-slow": {
            "from": { "transform": "rotate(0deg)" },
            "to": { "transform": "rotate(360deg)" }
          },
          "slide-up": {
            "0%": { "transform": "translateY(100%)", "opacity": "0" },
            "100%": { "transform": "translateY(0)", "opacity": "1" }
          },
          "zoom-in": {
            "0%": { "transform": "scale(0.8)", "opacity": "0" },
            "100%": { "transform": "scale(1)", "opacity": "1" }
          },
          "float": {
            "0%, 100%": { "transform": "translateY(0px)" },
            "50%": { "transform": "translateY(-20px)" }
          }
        },
        animation: {
          "accordion-down": "accordion-down 0.2s ease-out",
          "accordion-up": "accordion-up 0.2s ease-out",
          "fade-in": "fade-in 0.3s ease-out",
          "fade-out": "fade-out 0.3s ease-out",
          "scale-in": "scale-in 0.2s ease-out",
          "scale-out": "scale-out 0.2s ease-out",
          "slide-in-right": "slide-in-right 0.3s ease-out",
          "slide-out-right": "slide-out-right 0.3s ease-out",
          "pulse-soft": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          "float": "float 6s ease-in-out infinite",
          "glow": "glow 2s ease-in-out infinite alternate",
          "shimmer": "shimmer 2s ease-in-out infinite",
          "bounce-gentle": "bounce-gentle 2s ease-in-out infinite",
          "rotate-slow": "rotate-slow 20s linear infinite",
          "slide-up": "slide-up 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          "zoom-in": "zoom-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          'gradient-shift': 'gradient-shift 8s ease-in-out infinite'
        }
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

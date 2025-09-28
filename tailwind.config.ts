import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

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
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				// Zama-inspired color palette
				'zama-gold': {
					50: '#fffbeb',
					100: '#fef3c7',
					200: '#fde68a',
					300: '#fcd34d',
					400: '#fbbf24',
					500: '#f59e0b',
					600: '#d97706',
					700: '#b45309',
					800: '#92400e',
					900: '#78350f',
					950: '#451a03',
				},
				'zama-yellow': {
					50: '#fefce8',
					100: '#fef9c3',
					200: '#fef08a',
					300: '#fde047',
					400: '#facc15',
					500: '#eab308',
					600: '#ca8a04',
					700: '#a16207',
					800: '#854d0e',
					900: '#713f12',
					950: '#422006',
				},
				'dark-charcoal': {
					50: '#f6f7f9',
					100: '#eceef2',
					200: '#d5dae2',
					300: '#b0bac9',
					400: '#8594ab',
					500: '#677691',
					600: '#525f78',
					700: '#434d62',
					800: '#3a4252',
					900: '#343a47',
					950: '#1a1d24',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				gray: {
					50: '#f8fafc',
					100: '#f1f5f9',
					200: '#e2e8f0',
					300: '#cbd5e1',
					400: '#94a3b8',
					500: '#64748b',
					600: '#475569',
					700: '#334155',
					800: '#1e293b',
					900: '#0f172a',
					950: '#020617',
				},
				blue: {
					400: '#60a5fa',
					500: '#3b82f6',
					600: '#2563eb',
					700: '#1d4ed8',
				},
				purple: {
					400: '#c084fc',
					500: '#a855f7',
					600: '#9333ea',
					700: '#7e22ce',
				},
				teal: {
					400: '#2dd4bf',
					500: '#14b8a6',
					600: '#0d9488',
				},
				yellow: {
					300: '#fde047',
					400: '#facc15',
					500: '#eab308',
				},
				green: {
					400: '#4ade80',
					500: '#22c55e',
					600: '#16a34a',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			fontFamily: {
				sans: ['var(--font-sans)'],
				pixel: ['"Press Start 2P"', 'cursive'], // Example pixel font
			},
			boxShadow: {
				'neon-light': '0 0 5px var(--neon-glow), 0 0 10px var(--neon-glow), 0 0 15px var(--neon-glow)',
				'neon-medium': '0 0 10px var(--neon-glow), 0 0 20px var(--neon-glow), 0 0 30px var(--neon-glow)',
				'neon-strong': '0 0 15px var(--neon-glow), 0 0 30px var(--neon-glow), 0 0 45px var(--neon-glow)',
			},
			keyframes: {
				'pulse-neon': {
					'0%, 100%': { boxShadow: '0 0 5px var(--neon-glow)' },
					'50%': { boxShadow: '0 0 20px var(--neon-glow)' },
				},
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'blob': {
					'0%': {
						transform: 'translate(0px, 0px) scale(1)',
					},
					'33%': {
						transform: 'translate(30px, -50px) scale(1.1)',
					},
					'66%': {
						transform: 'translate(-20px, 20px) scale(0.9)',
					},
					'100%': {
						transform: 'translate(0px, 0px) scale(1)',
					},
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out forwards',
				'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
				'blob': 'blob 7s infinite cubic-bezier(0.6, -0.28, 0.735, 0.045)',
				'pulse-neon': 'pulse-neon 2s infinite',
				'glow': 'glow 1.5s ease-in-out infinite alternate',
			},
		}
	},
	plugins: [
		tailwindcssAnimate,
		require('tailwindcss/plugin')(function({ addUtilities }: { addUtilities: Function }) {
			const newUtilities = {
				'.pixel-corners': {
					'border-image-slice': '1',
					'border-image-width': '3px',
					'border-image-outset': '2px',
					'border-image-repeat': 'round',
					'border-image-source': 'url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 2V0H2V1H4V0H6V2H5V4H6V6H4V5H2V6H0V4H1V2H0Z\' fill=\'%23a855f7\'/%3E%3C/svg%3E")', // Violet
				},
				'.pixel-corners-cyan': {
					'border-image-source': 'url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 2V0H2V1H4V0H6V2H5V4H6V6H4V5H2V6H0V4H1V2H0Z\' fill=\'%2300FFFF\'/%3E%3C/svg%3E")', // Electric Cyan
				},
				'.pixel-corners-magenta': {
					'border-image-source': 'url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 2V0H2V1H4V0H6V2H5V4H6V6H4V5H2V6H0V4H1V2H0Z\' fill=\'%23FF00FF\'/%3E%3C/svg%3E")', // Vibrant Magenta
				},
			}
			addUtilities(newUtilities, ['responsive', 'hover']);
		}),
	],
};

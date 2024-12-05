import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/sections/**/*.{js,ts,jsx,tsx,mdx}",
	"./public/assets/lottie/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	container: {
  		center: true,
  		padding: {
  			DEFAULT: "20px",
  			lg: "80px",
  		},
  		screens: {
  			sm: "375px",
  			md: "768px",
  			lg: "1200px",
  		},
  	},
  	screens: {
  		sm: "375px",
  		md: "768px",
  		lg: "1200px",
  	},
  	extend: {
  		colors: {
			"mainBackground": "#0D1117",
			"columnBackground": "#161C22",
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		typography: {
  			DEFAULT: {
  				css: {
  					maxWidth: '100%',
  					color: 'rgb(255 255 255 / 0.8)',
  					lineHeight: '1.3',
  					p: {
  						marginBottom: '0.3em',
  						lineHeight: '1',
  					},
  					h1: {
  						color: 'transparent',
  						backgroundImage: 'linear-gradient(to right, rgb(168 85 247), rgb(236 72 153))',
  						backgroundClip: 'text',
  					},
  					h2: {
  						color: 'transparent',
  						backgroundImage: 'linear-gradient(to right, rgb(96 165 250), rgb(79 70 229))',
  						backgroundClip: 'text',
  					},
  					h3: {
  						color: 'transparent',
  						backgroundImage: 'linear-gradient(to right, rgb(45 212 191), rgb(34 211 238))',
  						backgroundClip: 'text',
  					},
  					'[class~="lead"]': {
  						color: 'rgb(255 255 255 / 0.7)',
  					},
  					a: {
  						color: 'rgb(96 165 250)',
  						'&:hover': {
  							color: 'rgb(147 197 253)',
  						},
  					},
  					strong: {
  						color: 'rgb(255 255 255 / 0.9)',
  					},
  					'ol > li::marker': {
  						color: 'rgb(255 255 255 / 0.6)',
  					},
  					'ul > li::marker': {
  						color: 'rgb(255 255 255 / 0.6)',
  					},
  					hr: {
  						borderColor: 'rgb(255 255 255 / 0.2)',
  					},
  					blockquote: {
  						borderLeftColor: 'rgb(255 255 255 / 0.2)',
  						color: 'rgb(255 255 255 / 0.7)',
  					},
  					code: {
  						color: 'rgb(255 255 255 / 0.8)',
  						backgroundColor: 'rgb(0 0 0 / 0.3)',
  					},
  					'pre code': {
  						backgroundColor: 'transparent',
  						color: 'inherit',
  					},
  					pre: {
  						backgroundColor: 'rgb(0 0 0 / 0.3)',
  						color: 'rgb(255 255 255 / 0.8)',
  					},
  				},
  			},
  		},
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    require('@tailwindcss/typography'),
  ],
} satisfies Config;

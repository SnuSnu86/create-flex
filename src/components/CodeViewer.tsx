import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Check, FileCode, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { DesignComponent } from './DesignTool';

interface CodeViewerProps {
  components: DesignComponent[];
}

export const CodeViewer = ({ components }: CodeViewerProps) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = async (code: string, type: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(type);
      toast({
        title: "Code copied!",
        description: `${type} code copied to clipboard`,
      });
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const generateReactCode = () => {
    if (components.length === 0) {
      return `import React from 'react';

export const GeneratedComponent = () => {
  return (
    <div className="p-8">
      {/* Your components will appear here */}
    </div>
  );
};`;
    }

    const imports = new Set<string>();
    const componentCode: string[] = [];

    components.forEach(component => {
      switch (component.type) {
        case 'button':
          imports.add("import { Button } from '@/components/ui/button';");
          componentCode.push(`        <Button
          variant="${component.props.variant || 'primary'}"
          size="${component.props.size || 'md'}"
          ${component.props.disabled ? 'disabled' : ''}
          style={{ 
            position: 'absolute', 
            left: '${component.position.x}px', 
            top: '${component.position.y}px' 
          }}
        >
          ${component.props.children || 'Button Text'}
        </Button>`);
          break;
          
        case 'card':
          imports.add("import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';");
          componentCode.push(`        <Card
          style={{ 
            position: 'absolute', 
            left: '${component.position.x}px', 
            top: '${component.position.y}px',
            width: '300px'
          }}
        >
          <CardHeader>
            <CardTitle>${component.props.title || 'Card Title'}</CardTitle>
            <CardDescription>
              ${component.props.description || 'Card description goes here'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
        </Card>`);
          break;
          
        case 'bento-grid':
          componentCode.push(`        <div
          className="grid gap-4"
          style={{ 
            position: 'absolute',
            left: '${component.position.x}px', 
            top: '${component.position.y}px',
            gridTemplateColumns: 'repeat(${component.props.columns || 3}, 1fr)',
            gridTemplateRows: 'repeat(${component.props.rows || 2}, 200px)',
            width: '600px'
          }}
        >
          ${(component.props.items || []).map((item: any, index: number) => `
          <div 
            key="${index}"
            className="bg-card rounded-lg border p-4 flex items-center justify-center"
          >
            <span className="text-card-foreground font-medium">${item.title}</span>
          </div>`).join('')}
        </div>`);
          break;
      }
    });

    return `import React from 'react';
${Array.from(imports).join('\n')}

export const GeneratedComponent = () => {
  return (
    <div className="relative min-h-screen p-8">
${componentCode.join('\n\n')}
    </div>
  );
};`;
  };

  const generateTailwindConfig = () => {
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}`;
  };

  const reactCode = generateReactCode();
  const tailwindCode = generateTailwindConfig();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4" />
          <h3 className="font-medium">Generated Code</h3>
          <Badge variant="outline" className="text-xs">
            {components.length} components
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="react" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="react" className="text-sm">
            React Component
          </TabsTrigger>
          <TabsTrigger value="tailwind" className="text-sm">
            Tailwind Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="react" className="mt-4">
          <div className="relative">
            <div className="absolute top-3 right-3 z-10">
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(reactCode, 'React')}
                className="h-8"
              >
                {copiedCode === 'React' ? (
                  <Check className="w-3 h-3 mr-1" />
                ) : (
                  <Copy className="w-3 h-3 mr-1" />
                )}
                {copiedCode === 'React' ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            
            <ScrollArea className="h-96 w-full rounded-md border">
              <pre className="p-4 text-sm bg-muted/50">
                <code className="text-foreground font-mono">
                  {reactCode}
                </code>
              </pre>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="tailwind" className="mt-4">
          <div className="relative">
            <div className="absolute top-3 right-3 z-10">
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(tailwindCode, 'Tailwind')}
                className="h-8"
              >
                {copiedCode === 'Tailwind' ? (
                  <Check className="w-3 h-3 mr-1" />
                ) : (
                  <Copy className="w-3 h-3 mr-1" />
                )}
                {copiedCode === 'Tailwind' ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            
            <ScrollArea className="h-96 w-full rounded-md border">
              <pre className="p-4 text-sm bg-muted/50">
                <code className="text-foreground font-mono">
                  {tailwindCode}
                </code>
              </pre>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
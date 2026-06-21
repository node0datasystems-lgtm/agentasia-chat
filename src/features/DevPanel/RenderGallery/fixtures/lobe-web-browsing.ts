'use client';

import { defineFixtures, single, variants } from './_helpers';

export default defineFixtures({
  identifier: 'lobe-web-browsing',
  fixtures: {
    crawlMultiPages: single({
      args: {
        urls: ['https://agentasia.ai', 'https://docs.agentasia.ai'],
      },
      pluginState: {
        results: [
          {
            crawler: 'firecrawl',
            data: {
              content: 'AgentAsia ships desktop and web experiences for AI collaboration.',
              description: 'Product homepage',
              title: 'AgentAsia',
              url: 'https://agentasia.ai',
            },
            originalUrl: 'https://agentasia.ai',
          },
          {
            crawler: 'firecrawl',
            data: {
              content: 'Developer documentation for routing, tooling, and local testing.',
              description: 'Docs homepage',
              title: 'AgentAsia Docs',
              url: 'https://docs.agentasia.ai',
            },
            originalUrl: 'https://docs.agentasia.ai',
          },
        ],
      },
    }),
    crawlSinglePage: single({
      args: { url: 'https://agentasia.ai/blog' },
      pluginState: {
        results: [
          {
            crawler: 'firecrawl',
            data: {
              content: 'Recent product updates and engineering notes.',
              description: 'Blog landing page',
              title: 'AgentAsia Blog',
              url: 'https://agentasia.ai/blog',
            },
            originalUrl: 'https://agentasia.ai/blog',
          },
        ],
      },
    }),
    search: variants([
      {
        args: {
          query: 'AgentAsia devtools preview route',
          searchEngines: ['google', 'bing'],
        },
        label: 'With results',
        pluginState: {
          query: 'AgentAsia devtools preview route',
          results: [
            {
              content: 'Documentation and implementation notes about local preview tooling.',
              engines: ['google'],
              title: 'Preview tooling guide',
              url: 'https://docs.example.com/preview-tooling',
            },
            {
              content: 'Issue thread describing the /devtools route rollout.',
              engines: ['bing'],
              title: 'Builtin render devtools issue',
              url: 'https://linear.example.com/issue/',
            },
          ],
        },
      },
      {
        args: {
          query: 'undocumented internal preview snapshot harness',
          searchEngines: ['google'],
        },
        label: 'No results',
        pluginState: {
          query: 'undocumented internal preview snapshot harness',
          results: [],
        },
      },
    ]),
  },
});

import { describe, it, expect } from 'vitest';
import { UtmBuilder } from './utm.js';

describe('UtmBuilder', () => {
  const builder = new UtmBuilder('https://lxstudio.ch');

  it('should build URL with basic UTM params', () => {
    const url = builder.build({
      source: 'instagram',
      medium: 'short',
      campaign: 'test_campaign',
    });

    expect(url).toContain('utm_source=instagram');
    expect(url).toContain('utm_medium=short');
    expect(url).toContain('utm_campaign=test_campaign');
  });

  it('should use default medium', () => {
    const url = builder.build({
      source: 'tiktok',
    });

    expect(url).toContain('utm_medium=short');
  });

  it('should create Instagram-specific URL', () => {
    const url = builder.forInstagram('post-123');

    expect(url).toContain('utm_source=instagram');
    expect(url).toContain('utm_content=post-123');
  });

  it('should create TikTok-specific URL', () => {
    const url = builder.forTikTok('video-456');

    expect(url).toContain('utm_source=tiktok');
    expect(url).toContain('utm_content=video-456');
  });
});

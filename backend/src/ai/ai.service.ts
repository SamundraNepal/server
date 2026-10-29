import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

@Injectable()
export class AIService {
  constructor(private readonly configService: ConfigService) {}

  async generateTags(imagePath: string): Promise<string[]> {
    const imageBuffer = await readFile(imagePath);

    const formData = new FormData();

    formData.append(
      'file',
      new Blob([imageBuffer], { type: 'image/jpeg' }),
      basename(imagePath),
    );

    const baseUrl = this.configService.get<string>('AI_QWEN_API_URL');

    const response = await fetch(`${baseUrl}/tag-image`, {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(120_000),
    });

    if (!response.ok) {
      throw new Error(
        `Qwen API failed: ${response.status} ${await response.text()}`,
      );
    }

    const result: { tags: string[] } = await response.json();

    return result.tags;
  }
}

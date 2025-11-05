import { ConversionType } from "../types/conversion-types";
import { BaseProvider, ConvertParams } from "./base-provider";

export class StringProvider extends BaseProvider {
  convert({ document, convertType }: ConvertParams): string {
    const segments = this.validate(document);

    if (convertType === ConversionType.JSON) {
      return this.convertToStringToJson(segments);
    }
    if (convertType === ConversionType.XML) {
      return this.convertToStringToXml(segments);
    }

    throw new Error(
      `Invalid conversion type for StringProvider: ${convertType}. Supported types: JSON, XML`
    );
  }

  validate(document: string): string[] {
    const trimmedDocument = document.trim();

    if (!document || trimmedDocument.length === 0) {
      throw new Error("Document is empty");
    }

    const segments = trimmedDocument
      .split("~")
      .filter((string) => string.trim().length > 0);

    if (segments.length === 0) {
      throw new Error(
        "No segments found. Document must contain at least one segment separated by '~'"
      );
    }

    for (const segment of segments) {
      const parts = segment.split("*");
      if (parts.length < 2) {
        throw new Error(
          `Invalid segment format: "${segment}". Each segment must have a segment name and at least one element separated by '*'`
        );
      }

      if (!parts[0] || parts[0].length === 0) {
        throw new Error(
          `Invalid segment: "${segment}". Segment name cannot be empty`
        );
      }
    }

    return segments;
  }

  private convertToStringToXml(segments: string[]): string {
    const xmlHeader = `<?xml version="1.0" encoding="UTF-8" ?>
    `;
    const result: Record<string, any[]> = {};

    for (const segment of segments) {
      const parts = segment.split("*");
      if (parts.length < 2) {
        continue;
      }

      const segmentName = parts[0];
      const elements = parts.slice(1);

      if (!result[segmentName]) {
        result[segmentName] = [];
      }

      const jsonObject: Record<string, string> = {};
      elements.forEach((element, index) => {
        jsonObject[`${segmentName}${index + 1}`] = element;
      });

      result[segmentName].push(jsonObject);
    }

    return JSON.stringify(result);
  }

  private convertToStringToJson(segments: string[]): string {
    const result: Record<string, any[]> = {};

    for (const segment of segments) {
      const parts = segment.split("*");
      if (parts.length < 2) {
        continue;
      }

      const segmentName = parts[0];
      const elements = parts.slice(1);

      if (!result[segmentName]) {
        result[segmentName] = [];
      }

      const jsonObject: Record<string, string> = {};
      elements.forEach((element, index) => {
        jsonObject[`${segmentName}${index + 1}`] = element;
      });

      result[segmentName].push(jsonObject);
    }

    return JSON.parse(JSON.stringify(result));
  }
}
